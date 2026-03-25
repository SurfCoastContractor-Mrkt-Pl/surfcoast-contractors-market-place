import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@16.12.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shop_id } = await req.json();

    if (!shop_id) {
      return Response.json({ error: 'shop_id is required' }, { status: 400 });
    }

    // Fetch shop and verify ownership
    const shops = await base44.asServiceRole.entities.MarketShop.filter({ id: shop_id });
    const shop = shops?.[0];

    if (!shop) {
      return Response.json({ error: 'Shop not found' }, { status: 404 });
    }

    if (shop.email !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If there's a Stripe subscription, cancel it
    if (shop.stripe_subscription_id) {
      try {
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
        await stripe.subscriptions.cancel(shop.stripe_subscription_id);
        console.log(`Cancelled Stripe subscription: ${shop.stripe_subscription_id}`);
      } catch (stripeErr) {
        console.error('Stripe cancellation error (continuing):', stripeErr.message);
      }
    }

    // Deactivate the shop immediately
    await base44.asServiceRole.entities.MarketShop.update(shop_id, {
      subscription_status: 'inactive',
      is_active: false,
      payment_model: null,
      status: 'suspended',
    });

    console.log(`Shop ${shop_id} (${shop.shop_name}) cancelled by ${user.email}`);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});