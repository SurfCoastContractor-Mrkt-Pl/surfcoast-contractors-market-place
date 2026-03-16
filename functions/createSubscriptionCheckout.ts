import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { priceId, email, userType, paymentMethodId } = body;

    if (!priceId || !email || !userType) {
      return Response.json({ error: 'Missing required fields: priceId, email, userType' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Require authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.email.toLowerCase() !== email.toLowerCase()) {
      return Response.json({ error: 'Unauthorized: email does not match authenticated user' }, { status: 403 });
    }

    // Check if user already has active subscription
    const existingSubscriptions = await base44.asServiceRole.entities.Subscription.filter({
      user_email: email,
      status: 'active',
    });

    if (existingSubscriptions && existingSubscriptions.length > 0) {
      return Response.json({ error: 'You already have an active subscription' }, { status: 400 });
    }

    // Check for existing pending checkout sessions (prevents duplicates within 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const pendingCheckouts = await base44.asServiceRole.entities.Subscription.filter({
      user_email: email,
      status: 'pending',
      created_date: { '$gt': twoMinutesAgo },
    });

    if (pendingCheckouts && pendingCheckouts.length > 0) {
      const pendingCheckout = pendingCheckouts[0];
      if (pendingCheckout.stripe_session_id) {
        try {
          const existingSession = await stripe.checkout.sessions.retrieve(pendingCheckout.stripe_session_id);
          if (existingSession && existingSession.status !== 'expired') {
            console.log(`Returning existing checkout session: ${pendingCheckout.stripe_session_id}`);
            return Response.json({
              sessionId: existingSession.id,
              url: existingSession.url,
              isExisting: true,
            });
          }
        } catch (e) {
          console.warn(`Could not retrieve existing session, creating new one: ${e.message}`);
        }
      }
    }

    const origin = req.headers.get('origin') || 'https://localhost:3000';

    const sessionConfig = {
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/Success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/Cancel`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_type: userType,
      },
    };

    // If using a saved payment method, set it directly (no payment form needed)
    if (paymentMethodId) {
      sessionConfig.payment_method_types = ['card'];
      sessionConfig.payment_method_collection = 'if_required';
      sessionConfig.payment_method = paymentMethodId;
    } else {
      // Otherwise allow card entry without saving
      sessionConfig.payment_method_types = ['card'];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Persist pending record so deduplication check has data to query against
    await base44.asServiceRole.entities.Subscription.create({
      user_email: email,
      user_type: userType,
      status: 'pending',
      stripe_session_id: session.id,
    });

    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Subscription checkout error:', error.message);
    return Response.json({ error: 'Failed to create subscription checkout' }, { status: 500 });
  }
});