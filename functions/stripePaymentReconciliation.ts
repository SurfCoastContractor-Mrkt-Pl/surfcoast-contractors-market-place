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
        // Check if checkout session still exists in Stripe
        const sessions = await stripe.checkout.sessions.list({
          limit: 100,
        });

        const sessionExists = sessions.data.some(
          s => s.metadata?.payment_id === payment.id && s.payment_status === 'paid'
        );

        if (!sessionExists) {
          // Payment was not completed - clean up record
          await base44.asServiceRole.entities.Payment.delete(payment.id);
          cleanedUp++;
          console.log(`Cleaned up stale pending payment: ${payment.id}`);
        }
      } catch (e) {
        console.error(`Error reconciling payment ${payment.id}:`, e.message);
      }
    }

    // Check for Stripe payments not in database (orphaned charges)
    try {
      const stripeCharges = await stripe.charges.list({
        limit: 100,
      });

      const dbPayments = await base44.asServiceRole.entities.Payment.filter({
        status: { '$in': ['confirmed', 'work_scheduled'] }
      });

      const dbPaymentIds = new Set((dbPayments || []).map(p => p.id));
      let orphaned = 0;

      for (const charge of stripeCharges.data) {
        const paymentId = charge.metadata?.payment_id;
        if (paymentId && !dbPaymentIds.has(paymentId)) {
          console.warn(`Orphaned Stripe charge detected: ${charge.id} (payment_id: ${paymentId})`);
          orphaned++;
        }
      }

      if (orphaned > 0) {
        console.warn(`Found ${orphaned} orphaned Stripe charges - manual review needed`);
      }
    } catch (e) {
      console.error('Error checking for orphaned charges:', e.message);
    }

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