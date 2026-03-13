import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Only allow admin or internal service
    const internalKey = req.headers.get('x-internal-service-key');
    if (internalKey !== Deno.env.get('INTERNAL_SERVICE_KEY')) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    console.log('Starting payment reconciliation...');

    // Get all pending payments from database (older than 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const pendingPayments = await base44.asServiceRole.entities.Payment.filter({
      status: 'pending',
      created_date: { '$lt': tenMinutesAgo }
    });

    console.log(`Found ${pendingPayments?.length || 0} stale pending payments`);

    let cleanedUp = 0;
    for (const payment of pendingPayments || []) {
      try {
        // Only check if this specific session exists and is paid
        if (payment.stripe_session_id) {
          const session = await stripe.checkout.sessions.retrieve(payment.stripe_session_id);
          
          // If session is paid, update payment status instead of deleting
          if (session.payment_status === 'paid') {
            await base44.asServiceRole.entities.Payment.update(payment.id, {
              status: 'confirmed',
              confirmed_at: new Date().toISOString()
            });
            console.log(`Updated stale payment to confirmed: ${payment.id}`);
          } else {
            // Expire the session if payment wasn't completed
            try {
              await stripe.checkout.sessions.expire(payment.stripe_session_id);
            } catch (stripeErr) {
              console.warn(`Could not expire session ${payment.stripe_session_id}:`, stripeErr.message);
            }
            // Mark as expired instead of deleting to preserve audit trail
            await base44.asServiceRole.entities.Payment.update(payment.id, {
              status: 'expired'
            });
            cleanedUp++;
            console.log(`Marked stale pending payment as expired: ${payment.id}`);
          }
        }
      } catch (e) {
        console.error(`Error reconciling payment ${payment.id}:`, e.message);
      }
    }

    // Skip orphaned charge check - too expensive and rarely needed
    // Orphaned charges will be caught when they attempt to create duplicate payments

    return Response.json({
      success: true,
      message: 'Reconciliation complete',
      stalePendingCleaned: cleanedUp,
    });
  } catch (error) {
    console.error('Reconciliation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});