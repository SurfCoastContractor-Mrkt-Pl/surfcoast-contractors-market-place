import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verify authorization
    const internalKey = req.headers.get('x-internal-service-key');
    if (internalKey !== Deno.env.get('INTERNAL_SERVICE_KEY')) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    console.log('Cleaning up stale checkout sessions...');

    // Get expired checkout sessions (more than 1 hour old, unpaid)
    const oneHourAgo = Math.floor((Date.now() - 60 * 60 * 1000) / 1000);
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
    });

    let cleanedUp = 0;

    for (const session of sessions.data) {
      if (
        session.payment_status === 'unpaid' &&
        session.created < oneHourAgo &&
        session.metadata?.payment_id
      ) {
        try {
          // Delete the pending payment from database
          const paymentId = session.metadata.payment_id;
          const payments = await base44.asServiceRole.entities.Payment.filter({
            id: paymentId,
            status: 'pending'
          });

          if (payments && payments.length > 0) {
            await base44.asServiceRole.entities.Payment.delete(paymentId);
            cleanedUp++;
            console.log(`Cleaned up stale payment session: ${paymentId}`);
          }
        } catch (e) {
          console.error(`Error cleaning up session ${session.id}:`, e.message);
        }
      }
    }

    return Response.json({
      success: true,
      staleSessions: cleanedUp,
      message: `Cleaned up ${cleanedUp} stale checkout session(s)`
    });
  } catch (error) {
    console.error('Cleanup error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});