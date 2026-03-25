import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@^15.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    let { priceId, email, userType, paymentMethodId, shop_id, payment_model } = body;

    const base44 = createClientFromRequest(req);

    // Require authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle MarketShop checkout (new format)
    if (shop_id && payment_model) {
      email = user.email;
      userType = 'market_vendor';
      
      // Map payment model to price ID
      const priceMap = {
        subscription: Deno.env.get('STRIPE_SUBSCRIPTION_PRICE_ID'),
        facilitation: Deno.env.get('STRIPE_VENDOR_LISTING_PRICE_ID'),
      };
      
      priceId = priceMap[payment_model];
      if (!priceId) {
        console.error(`Invalid payment model: ${payment_model}`);
        return Response.json({ error: 'Invalid payment model' }, { status: 400 });
      }
    } else if (!priceId || !email || !userType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
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
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      customer_email: email,
      success_url: `${origin}/Success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/Cancel`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_type: userType,
      },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Subscription checkout error:', error.message);
    console.error('Full error:', error);
    return Response.json({ error: error.message || 'Failed to create subscription checkout' }, { status: 500 });
  }
});