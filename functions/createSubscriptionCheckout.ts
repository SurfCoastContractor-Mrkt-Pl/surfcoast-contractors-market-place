import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.13.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { priceId, email, userType } = body;

    if (!priceId || !email || !userType) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already has active subscription
    const base44 = createClientFromRequest(req);
    const existingSubscriptions = await base44.asServiceRole.entities.Subscription.filter({
      user_email: email,
      status: 'active'
    });

    if (existingSubscriptions && existingSubscriptions.length > 0) {
      return Response.json(
        { error: 'You already have an active subscription' },
        { status: 400 }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${new URL(req.url).origin}/Success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${new URL(req.url).origin}/Cancel`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: email,
        user_type: userType,
      },
    });

    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Subscription checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});