import Stripe from 'npm:stripe@17.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const prices = await stripe.prices.list({ active: true, limit: 20, expand: ['data.product'] });
    const summary = prices.data.map(p => ({
      id: p.id,
      product_name: p.product?.name,
      product_id: p.product?.id,
      amount: p.unit_amount,
      currency: p.currency,
      type: p.type,
      interval: p.recurring?.interval,
    }));
    return Response.json({ prices: summary });
  } catch (error) {
    console.error('getStripePrices error');
    return Response.json({ error: 'Failed to retrieve prices' }, { status: 500 });
  }
});