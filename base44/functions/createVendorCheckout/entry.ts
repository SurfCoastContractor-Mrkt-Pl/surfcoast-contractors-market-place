import Stripe from 'npm:stripe@17.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { cartItems, shopId, shopName, shopType, consumerEmail, consumerName } = await req.json();

    if (!cartItems || !cartItems.length || !shopId || !consumerEmail) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify authenticated user matches the consumer email
    const user = await base44.auth.me();
    if (!user || user.email !== consumerEmail) {
      console.warn(`Unauthorized checkout attempt: user ${user?.email} tried to create checkout for ${consumerEmail}`);
      return Response.json({ error: 'Unauthorized: Email mismatch' }, { status: 403 });
    }

    // Fetch the shop to get Stripe Connect account
    const shop = await base44.asServiceRole.entities.MarketShop.get(shopId);
    if (!shop) {
      return Response.json({ error: 'Shop not found' }, { status: 404 });
    }

    const origin = req.headers.get('origin') || 'https://app.base44.com';

    // Build line items for Stripe
    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product_name,
          ...(item.image_url ? { images: [item.image_url] } : {}),
        },
        unit_amount: Math.round(item.price * 100), // convert to cents
      },
      quantity: item.quantity,
    }));

    const totalCents = cartItems.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0);
    const platformFeeCents = Math.round(totalCents * 0.05); // 5% platform fee

    // Create a pending order record first so we have an ID for metadata
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const order = await base44.asServiceRole.entities.ConsumerOrder.create({
      consumer_email: consumerEmail,
      order_number: orderNumber,
      shop_id: shopId,
      shop_name: shopName,
      shop_type: shopType || 'farmers_market',
      items: cartItems.map(i => ({
        listing_id: i.id,
        product_name: i.product_name,
        price: i.price,
        unit: i.unit || '',
        quantity: i.quantity,
        image_url: i.image_url || null,
        subtotal: parseFloat((i.price * i.quantity).toFixed(2)),
      })),
      total: parseFloat((totalCents / 100).toFixed(2)),
      platform_fee: parseFloat((platformFeeCents / 100).toFixed(2)),
      vendor_payout: parseFloat(((totalCents - platformFeeCents) / 100).toFixed(2)),
      status: 'pending',
      placed_at: new Date().toISOString(),
    });

    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: consumerEmail,
      success_url: `${origin}/Success?order_id=${order.id}&shop_id=${shopId}&type=vendor_purchase`,
      cancel_url: `${origin}/ConsumerHub?cart_canceled=true`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        order_id: order.id,
        shop_id: shopId,
        consumer_email: consumerEmail,
        type: 'vendor_purchase',
      },
    };

    // If shop has a Stripe Connect account with charges enabled, use transfer_data for split payment
    if (shop.stripe_connect_account_id && shop.stripe_connect_charges_enabled) {
      sessionConfig.payment_intent_data = {
        application_fee_amount: platformFeeCents, // 5% stays on platform
        transfer_data: {
          destination: shop.stripe_connect_account_id, // 95% goes to vendor
        },
      };
      console.log(`Split payment: ${totalCents - platformFeeCents} cents to vendor ${shop.stripe_connect_account_id}, ${platformFeeCents} cents platform fee`);
    } else {
      // No Connect account yet — collect full payment on platform, note for manual payout
      console.log(`Shop ${shopId} has no Connect account — collecting full payment on platform. Manual payout needed.`);
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Update order with session ID
    await base44.asServiceRole.entities.ConsumerOrder.update(order.id, {
      stripe_checkout_session_id: session.id,
    });

    console.log(`Vendor checkout session created: ${session.id} for shop ${shopId}, order ${order.id}`);
    return Response.json({ checkoutUrl: session.url, sessionId: session.id, orderId: order.id });

  } catch (error) {
    console.error('createVendorCheckout error:', error.message);
    return Response.json({ error: error.message || 'Failed to create checkout' }, { status: 500 });
  }
});