import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    const summary = webhooks.data.map(wh => ({
      id: wh.id,
      url: wh.url,
      status: wh.status,
      events: wh.enabled_events,
    }));
    return Response.json({ webhooks: summary });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});