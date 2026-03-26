import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    console.log('Starting stale payment cleanup...');

    // Get all pending payments older than 24 hours (limit to 50 to prevent CPU timeout)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const stalePendingPayments = await base44.asServiceRole.entities.Payment.filter({
      status: 'pending',
      created_date: { $lt: oneDayAgo }
    }, '-created_date', 50);

    console.log(`Found ${stalePendingPayments?.length || 0} stale pending payments (older than 24h)`);

    let expiredCount = 0;
    for (const payment of stalePendingPayments || []) {
      try {
        // Mark payment as expired first (faster path, avoids Stripe timeout)
        await base44.asServiceRole.entities.Payment.update(payment.id, {
          status: 'expired',
        });
        expiredCount++;

        // Then async expire the Stripe session (non-blocking, fire-and-forget)
        if (payment.stripe_session_id) {
          stripe.checkout.sessions.expire(payment.stripe_session_id).catch(stripeErr => {
            if (stripeErr.code !== 'resource_missing') {
              console.warn(`Could not expire session ${payment.stripe_session_id}:`, stripeErr.message);
            }
          });
        }
      } catch (e) {
        console.error(`Error expiring payment ${payment.id}:`, e.message);
      }
    }

    // Also clean up pending subscriptions older than 24 hours (limit to 50)
    const stalePendingSubscriptions = await base44.asServiceRole.entities.Subscription.filter({
      status: 'pending',
      created_date: { $lt: oneDayAgo }
    }, '-created_date', 50);

    console.log(`Found ${stalePendingSubscriptions?.length || 0} stale pending subscriptions`);

    let subscriptionsExpiredCount = 0;
    for (const subscription of stalePendingSubscriptions || []) {
      try {
        // Mark subscription as cancelled first (faster path)
        await base44.asServiceRole.entities.Subscription.update(subscription.id, {
          status: 'cancelled',
        });
        subscriptionsExpiredCount++;

        // Then async expire the Stripe session (non-blocking)
        if (subscription.stripe_session_id) {
          stripe.checkout.sessions.expire(subscription.stripe_session_id).catch(stripeErr => {
            if (stripeErr.code !== 'resource_missing') {
              console.warn(`Could not expire session ${subscription.stripe_session_id}:`, stripeErr.message);
            }
          });
        }
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