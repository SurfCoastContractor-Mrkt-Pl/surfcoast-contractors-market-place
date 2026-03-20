import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Stripe from 'npm:stripe@16.12.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { shopId } = body;

    // Verify admin
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get shop
    const shops = await base44.asServiceRole.entities.MarketShop.filter({ id: shopId });
    const shop = shops?.[0];
    if (!shop) {
      return Response.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Check for Stripe subscription ID in shop data
    const stripeSubscriptionId = shop.data?.stripe_subscription_id;
    let cancelResult = null;

    if (stripeSubscriptionId) {
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
      try {
        // Cancel subscription
        cancelResult = await stripe.subscriptions.cancel(stripeSubscriptionId);
        console.log(`Canceled Stripe subscription: ${stripeSubscriptionId}`);
      } catch (stripeErr) {
        console.error(`Stripe error canceling ${stripeSubscriptionId}:`, stripeErr.message);
        // Continue anyway—update the shop record
      }
    }

    // Update shop: clear subscription fields and deactivate
    await base44.asServiceRole.entities.MarketShop.update(shopId, {
      subscription_status: 'cancelled',
      is_active: false,
      stripe_subscription_id: null,
      stripe_customer_id: null
    });

    console.log(`Shop ${shopId} (${shop.data.shop_name}) subscription cancelled`);

    return Response.json({
      success: true,
      shop_id: shopId,
      shop_name: shop.data.shop_name,
      stripe_subscription_cancelled: !!stripeSubscriptionId,
      stripe_result: cancelResult ? 'cancelled' : 'none'
    });
  } catch (error) {
    console.error('Error canceling market shop subscription:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});