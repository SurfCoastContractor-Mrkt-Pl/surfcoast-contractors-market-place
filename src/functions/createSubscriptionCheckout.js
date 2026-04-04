import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const stripe = await import('npm:stripe@14.0.0').then((mod) => new mod.default(Deno.env.get('STRIPE_SECRET_KEY')));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier, priceId, userEmail, userType } = await req.json();

    if (!tier || !priceId || !userEmail) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get or create Stripe customer
    let customerId;
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          base44_user_type: userType,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${Deno.env.get('APP_URL')}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('APP_URL')}/SubscriptionUpgrade`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: userEmail,
        tier,
      },
    });

    return Response.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});