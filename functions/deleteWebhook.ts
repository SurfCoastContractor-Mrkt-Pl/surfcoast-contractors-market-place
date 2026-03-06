import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const { webhookId } = await req.json();
    const deleted = await stripe.webhookEndpoints.del(webhookId);
    return Response.json({ deleted });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});