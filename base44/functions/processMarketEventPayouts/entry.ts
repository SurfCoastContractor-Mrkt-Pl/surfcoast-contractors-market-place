import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@16.11.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const FACILITATION_FEE_PERCENTAGE = 5; // 5% platform fee

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403 });
    }

    const body = await req.json();
    const { market_shop_id, market_event_date } = body;

    if (!market_shop_id || !market_event_date) {
      return new Response(
        JSON.stringify({ error: 'market_shop_id and market_event_date are required' }),
        { status: 400 }
      );
    }

    console.log(`[Payouts] Processing payouts for shop ${market_shop_id} on ${market_event_date}`);

    // Fetch the MarketShop
    const shops = await base44.asServiceRole.entities.MarketShop.filter({
      id: market_shop_id
    });

    if (!shops || shops.length === 0) {
      return new Response(JSON.stringify({ error: 'MarketShop not found' }), { status: 404 });
    }

    const shop = shops[0];

    // Verify shop has Stripe Connect account
    if (!shop.stripe_connect_account_id || !shop.stripe_connect_charges_enabled) {
      console.log(`[Payouts] Shop ${market_shop_id} not ready for payouts - Stripe Connect not complete`);
      return new Response(
        JSON.stringify({
          error: 'Vendor Stripe Connect account not fully set up',
          details: 'Vendor must complete Stripe Connect onboarding before payouts can be processed'
        }),
        { status: 400 }
      );
    }

    // Fetch all pending sales for this shop on this event date
    const sales = await base44.asServiceRole.entities.MarketEventSale.filter({
      market_shop_id: market_shop_id,
      market_event_date: market_event_date,
      payout_status: 'pending'
    });

    if (!sales || sales.length === 0) {
      console.log(`[Payouts] No pending sales found for shop ${market_shop_id} on ${market_event_date}`);
      return new Response(
        JSON.stringify({ message: 'No pending sales to payout', sales_count: 0 }),
        { status: 200 }
      );
    }

    // Calculate total sales amount
    const totalSalesAmount = sales.reduce((sum, sale) => sum + sale.sale_amount, 0);
    console.log(`[Payouts] Total sales: ${totalSalesAmount} cents for ${sales.length} sales`);

    // Calculate payout (95% to vendor, 5% platform fee)
    const platformFeeAmount = Math.round((totalSalesAmount * FACILITATION_FEE_PERCENTAGE) / 100);
    const vendorPayoutAmount = totalSalesAmount - platformFeeAmount;

    console.log(`[Payouts] Platform fee: ${platformFeeAmount} cents, Vendor payout: ${vendorPayoutAmount} cents`);

    // Initiate Stripe Connect payout
    let stripeTransferId;
    try {
      const transfer = await stripe.transfers.create({
        amount: vendorPayoutAmount,
        currency: 'usd',
        destination: shop.stripe_connect_account_id,
        description: `SurfCoast Marketplace payout - ${shop.shop_name} - Market: ${sales[0].market_event_name} (${market_event_date})`,
        metadata: {
          market_shop_id: market_shop_id,
          market_event_date: market_event_date,
          sales_count: sales.length,
          platform_fee_amount: platformFeeAmount
        }
      });

      stripeTransferId = transfer.id;
      console.log(`[Payouts] Stripe transfer created: ${stripeTransferId}`);
    } catch (stripeError) {
      console.error(`[Payouts] Stripe transfer failed:`, stripeError);

      // Mark all sales as failed and notify vendor
      await Promise.all(
        sales.map(sale =>
          base44.asServiceRole.entities.MarketEventSale.update(sale.id, {
            payout_status: 'failed'
          })
        )
      );

      // Update shop status to restrict account
      await base44.asServiceRole.entities.MarketShop.update(market_shop_id, {
        is_active: false
      });

      // Send error notification email to vendor
      try {
        await base44.integrations.Core.SendEmail({
          to: shop.email,
          subject: 'Payment Issue - Your SurfCoast Account Has Been Restricted',
          body: `Hello ${shop.owner_name || shop.shop_name},\n\nWe encountered an issue processing your payout for the ${sales[0].market_event_name} event on ${market_event_date}.\n\nError: ${stripeError.message}\n\nYour account has been temporarily restricted until this issue is resolved. Please contact our support team to resolve this issue.\n\nBest regards,\nSurfCoast Marketplace Team`
        });
      } catch (emailError) {
        console.error(`[Payouts] Failed to send error notification email:`, emailError);
      }

      return new Response(
        JSON.stringify({
          error: 'Payout processing failed',
          details: stripeError.message,
          sales_marked_failed: sales.length
        }),
        { status: 500 }
      );
    }

    // Update all sales to "paid" status with payout ID
    await Promise.all(
      sales.map(sale =>
        base44.asServiceRole.entities.MarketEventSale.update(sale.id, {
          payout_status: 'paid',
          payout_id: stripeTransferId
        })
      )
    );

    // Send success notification email to vendor
    try {
      await base44.integrations.Core.SendEmail({
        to: shop.email,
        subject: `Payout Received: ${(vendorPayoutAmount / 100).toFixed(2)} from ${sales[0].market_event_name}`,
        body: `Hello ${shop.owner_name || shop.shop_name},\n\nYour payout for the ${sales[0].market_event_name} event on ${market_event_date} has been processed successfully!\n\nDetails:\n- Gross Sales: $${(totalSalesAmount / 100).toFixed(2)}\n- Platform Fee (5%): $${(platformFeeAmount / 100).toFixed(2)}\n- Your Payout: $${(vendorPayoutAmount / 100).toFixed(2)}\n- Number of Transactions: ${sales.length}\n- Transfer ID: ${stripeTransferId}\n\nThe funds should appear in your Stripe Connect account within 1-2 business days.\n\nThank you for selling at SurfCoast!\n\nBest regards,\nSurfCoast Marketplace Team`
      });
    } catch (emailError) {
      console.error(`[Payouts] Failed to send success notification email:`, emailError);
    }

    console.log(`[Payouts] Successfully processed payout for shop ${market_shop_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        shop_id: market_shop_id,
        shop_name: shop.shop_name,
        market_event: sales[0].market_event_name,
        market_event_date: market_event_date,
        sales_count: sales.length,
        total_sales: totalSalesAmount,
        platform_fee: platformFeeAmount,
        vendor_payout: vendorPayoutAmount,
        stripe_transfer_id: stripeTransferId
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Payouts] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500 }
    );
  }
});