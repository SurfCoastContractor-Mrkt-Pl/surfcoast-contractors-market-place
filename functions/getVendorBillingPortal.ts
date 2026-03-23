import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { shop_id } = body;

    if (!shop_id) {
      return Response.json({ error: 'shop_id is required' }, { status: 400 });
    }

    // Fetch the shop record using user-scoped query
    const shops = await base44.entities.MarketShop.filter({ id: shop_id });
    if (!shops || shops.length === 0) {
      return Response.json({ error: 'Shop not found' }, { status: 404 });
    }

    const shop = shops[0];

    // Verify the authenticated user owns this shop
    if (shop.owner_email !== user.email) {
      return Response.json({ error: 'Forbidden: You do not own this shop' }, { status: 403 });
    }

    if (!shop.stripe_customer_id) {
      return Response.json({ error: 'No stripe customer ID for this shop' }, { status: 400 });
    }

    // Create billing portal session with Stripe
    const stripe = await import('npm:stripe@14.10.0');
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    const baseUrl = Deno.env.get('APP_BASE_URL') || 'https://surfcoastcmp.base44.app';
    const session = await stripeClient.billingPortal.sessions.create({
      customer: shop.stripe_customer_id,
      return_url: `${baseUrl}/MarketShopDashboard`,
    });

    return Response.json({ portal_url: session.url });
  } catch (error) {
    console.error('Billing portal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});