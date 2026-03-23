import Stripe from 'npm:stripe@17.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
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
    console.error('getStripePrices error:', error);
    return Response.json({ error: 'Failed to retrieve prices', details: error.message }, { status: 500 });
  }
});