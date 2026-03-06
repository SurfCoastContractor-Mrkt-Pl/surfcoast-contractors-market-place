import Stripe from 'npm:stripe@17.5.0';

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
    return Response.json({ error: error.message }, { status: 500 });
  }
});