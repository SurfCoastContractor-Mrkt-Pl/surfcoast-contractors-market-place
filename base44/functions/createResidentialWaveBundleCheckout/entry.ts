import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.7.0';

function initializeStripe() {
  const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not configured');
  }
  return new Stripe(secretKey);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    let stripe;
    try {
      stripe = initializeStripe();
    } catch (initErr) {
      console.error('Stripe initialization failed:', initErr.message);
      return Response.json({
        error: 'Payment service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, { status: 503 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify contractor is a sole proprietor
    const contractors = await base44.asServiceRole.entities.Contractor.filter({ email: user.email });
    const contractor = contractors?.[0];

    if (!contractor || !contractor.is_licensed_sole_proprietor || contractor.contractor_type !== 'trade_specific') {
      return Response.json({ error: 'Not eligible for bundle subscription' }, { status: 403 });
    }

    // Check if contractor is in iframe
    const headers = Object.fromEntries(req.headers);
    if (headers.referer?.includes('iframe')) {
      return Response.json(
        { error: 'Checkout must be opened in a new window' },
        { status: 400 }
      );
    }

    const priceId = Deno.env.get('STRIPE_RESIDENTIAL_WAVE_BUNDLE_PRICE_ID');
    if (!priceId) {
      console.error('STRIPE_RESIDENTIAL_WAVE_BUNDLE_PRICE_ID not configured');
      return Response.json({ error: 'Payment configuration error' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/ResidentialWaveDashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/ResidentialWaveDashboard`,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        contractor_email: user.email,
        contractor_id: contractor.id,
        subscription_type: 'residential_wave_bundle',
      },
    });

    return Response.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
});