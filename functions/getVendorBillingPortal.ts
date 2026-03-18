import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { shop_id } = body;

    if (!shop_id) {
      return Response.json({ error: 'shop_id is required' }, { status: 400 });
    }

    // Fetch the shop record
    const shops = await base44.asServiceRole.entities.MarketShop.filter({ id: shop_id });
    if (!shops || shops.length === 0) {
      return Response.json({ error: 'Shop not found' }, { status: 404 });
    }

    const shop = shops[0];
    if (!shop.stripe_customer_id) {
      return Response.json({ error: 'No stripe customer ID for this shop' }, { status: 400 });
    }

    // Create billing portal session with Stripe
    const stripe = await import('npm:stripe@14.10.0');
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    const session = await stripeClient.billingPortal.sessions.create({
      customer: shop.stripe_customer_id,
      return_url: 'https://surfcoastcmp.base44.app/MarketShopDashboard',
    });

    return Response.json({ portal_url: session.url });
  } catch (error) {
    console.error('Billing portal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});