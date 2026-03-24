import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Stripe from 'npm:stripe@16.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId, newPaymentModel } = await req.json();

    if (!subscriptionId || !newPaymentModel) {
      return Response.json(
        { error: 'Missing subscriptionId or newPaymentModel' },
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

    // Check if subscription is in good standing
    if (subscription.status === 'past_due' || subscription.status === 'cancelled') {
      return Response.json(
        {
          error: 'Cannot switch payment models. Subscription must be active and in good standing.',
          status: subscription.status
        },
        { status: 400 }
      );
    }

    // Get Stripe subscription to check billing cycle
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Schedule the model change for next billing cycle
    const nextBillingDate = new Date(stripeSubscription.current_period_end * 1000);

    // Store the pending model switch in database (you'll need to add this field to Subscription entity)
    await base44.entities.Subscription.update(subscription.id, {
      pending_model_switch: newPaymentModel,
      pending_switch_effective_date: nextBillingDate.toISOString()
    });

    console.log(`Payment model switch scheduled for ${user.email} on ${nextBillingDate}`);

    return Response.json({
      success: true,
      message: `Payment model will switch to ${newPaymentModel} on ${nextBillingDate.toLocaleDateString()}`,
      effectiveDate: nextBillingDate.toISOString()
    });
  } catch (error) {
    console.error('Payment model switch error:', error);
    return Response.json(
      { error: error.message || 'Failed to process payment model switch' },
      { status: 500 }
    );
  }
});