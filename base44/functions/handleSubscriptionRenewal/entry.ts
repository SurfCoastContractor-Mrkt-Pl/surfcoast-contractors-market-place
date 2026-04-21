import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Stripe from 'npm:stripe@16.0.0';

function initializeStripe() {
  const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not configured');
  }
  return new Stripe(secretKey);
}

Deno.serve(async (req) => {
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

    const { subscriptionId, priceId } = await req.json();

    if (!subscriptionId || !priceId) {
      return Response.json(
        { error: 'Missing subscriptionId or priceId' },
        { status: 400 }
      );
    }

    // Fetch subscription from database
    const subscriptions = await base44.entities.Subscription.filter({
      stripe_subscription_id: subscriptionId,
      user_email: user.email
    });

    const subscription = subscriptions?.[0];
    if (!subscription) {
      return Response.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Only allow renewal if cancelled
    if (subscription.status !== 'cancelled') {
      return Response.json(
        { error: 'Only cancelled subscriptions can be renewed' },
        { status: 400 }
      );
    }

    // Create new subscription
    const stripeCustomer = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    if (!stripeCustomer.data.length) {
      return Response.json({ error: 'Customer not found' }, { status: 404 });
    }

    const newSubscription = await stripe.subscriptions.create({
      customer: stripeCustomer.data[0].id,
      items: [{ price: priceId }],
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: user.email,
        renewal: 'true'
      }
    });

    // Update database
    await base44.entities.Subscription.update(subscription.id, {
      status: 'active',
      stripe_subscription_id: newSubscription.id,
      start_date: new Date().toISOString(),
      current_period_end: new Date(newSubscription.current_period_end * 1000).toISOString()
    });

    console.log(`Subscription renewed for ${user.email}`);

    return Response.json({
      success: true,
      message: 'Subscription renewed successfully',
      subscriptionId: newSubscription.id
    });
  } catch (error) {
    console.error('Subscription renewal error:', error);
    return Response.json(
      { error: error.message || 'Failed to renew subscription' },
      { status: 500 }
    );
  }
});