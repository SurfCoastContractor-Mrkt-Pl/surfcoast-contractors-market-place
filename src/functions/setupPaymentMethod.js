import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const stripe = await import('npm:stripe@14.0.0').then((mod) => new mod.default(Deno.env.get('STRIPE_SECRET_KEY')));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userEmail } = await req.json();

    if (!userEmail || userEmail !== user.email) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get or create Stripe customer
    let customerId;
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({ email: userEmail });
      customerId = customer.id;
    }

    // Create setup intent for adding payment method
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    return Response.json({
      setupUrl: `https://checkout.stripe.com/pay/${setupIntent.client_secret}`,
    });
  } catch (error) {
    console.error('Setup payment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});