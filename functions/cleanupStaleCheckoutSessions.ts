import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    // Force redeploy
    // Validate internal service key
    const internalKey = req.headers.get('x-internal-service-key');
    if (internalKey !== Deno.env.get('INTERNAL_SERVICE_KEY')) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const base44 = createClientFromRequest(req);

    console.log('Starting stale payment cleanup...');

    // Get all pending payments older than 24 hours (limit to 100 to prevent CPU timeout)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const stalePendingPayments = await base44.asServiceRole.entities.Payment.filter({
      status: 'pending',
      created_date: { $lt: oneDayAgo }
    }, '-created_date', 100);

    console.log(`Found ${stalePendingPayments?.length || 0} stale pending payments (older than 24h)`);

    let expiredCount = 0;
    for (const payment of stalePendingPayments || []) {
      try {
        // Expire the Stripe session if it exists
        if (payment.stripe_session_id) {
          try {
            await stripe.checkout.sessions.expire(payment.stripe_session_id);
            console.log(`Expired Stripe session: ${payment.stripe_session_id}`);
          } catch (stripeErr) {
            if (stripeErr.code !== 'resource_missing') {
              console.warn(`Could not expire session ${payment.stripe_session_id}:`, stripeErr.message);
            }
          }
        }

        // Mark payment as expired (preserves audit trail)
        await base44.asServiceRole.entities.Payment.update(payment.id, {
          status: 'expired',
        });

        expiredCount++;
        console.log(`Marked stale payment as expired: ${payment.id}`);
      } catch (e) {
        console.error(`Error expiring payment ${payment.id}:`, e.message);
      }
    }

    // Also clean up pending subscriptions older than 24 hours (limit to 100)
    const stalePendingSubscriptions = await base44.asServiceRole.entities.Subscription.filter({
      status: 'pending',
      created_date: { $lt: oneDayAgo }
    }, '-created_date', 100);

    console.log(`Found ${stalePendingSubscriptions?.length || 0} stale pending subscriptions`);

    let subscriptionsExpiredCount = 0;
    for (const subscription of stalePendingSubscriptions || []) {
      try {
        if (subscription.stripe_session_id) {
          try {
            await stripe.checkout.sessions.expire(subscription.stripe_session_id);
          } catch (stripeErr) {
            if (stripeErr.code !== 'resource_missing') {
              console.warn(`Could not expire session ${subscription.stripe_session_id}:`, stripeErr.message);
            }
          }
        }

        await base44.asServiceRole.entities.Subscription.update(subscription.id, {
          status: 'cancelled',
        });

        subscriptionsExpiredCount++;
        console.log(`Marked stale subscription as cancelled: ${subscription.id}`);
      } catch (e) {
        console.error(`Error expiring subscription ${subscription.id}:`, e.message);
      }
    }

    return Response.json({
      success: true,
      message: 'Stale payment cleanup complete',
      paymentsExpired: expiredCount,
      subscriptionsExpired: subscriptionsExpiredCount,
    });
  } catch (error) {
    console.error('Cleanup error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});