import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { priceId, email, userType } = body;

    if (!priceId || !email || !userType) {
      return Response.json({ error: 'Missing required fields: priceId, email, userType' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // If user is authenticated, validate email matches their session
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (isAuthenticated) {
      const user = await base44.auth.me();
      if (user.email.toLowerCase() !== email.toLowerCase()) {
        return Response.json({ error: 'Unauthorized: email does not match authenticated user' }, { status: 403 });
      }
    }

    // Check if user already has active subscription
    const existingSubscriptions = await base44.asServiceRole.entities.Subscription.filter({
      user_email: email,
      status: 'active',
    });

    if (existingSubscriptions && existingSubscriptions.length > 0) {
      return Response.json({ error: 'You already have an active subscription' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'https://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/Success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/Cancel`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: email,
        user_type: userType,
      },
    });

    console.log(`Subscription checkout created: ${session.id} for ${email}`);
    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Subscription checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});