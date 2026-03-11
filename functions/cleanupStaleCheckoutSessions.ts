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

    // Get expired pending payments from database instead (avoids Stripe API calls)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const staleSessions = await base44.asServiceRole.entities.Payment.filter({
      status: 'pending'
    }, '-created_date', 50);

    let cleanedUp = 0;

    for (const payment of staleSessions || []) {
      if (payment.created_date && new Date(payment.created_date) < new Date(oneHourAgo)) {
        try {
          await base44.asServiceRole.entities.Payment.delete(payment.id);
          cleanedUp++;
          console.log(`Cleaned up stale payment session: ${payment.id}`);
        } catch (e) {
            console.error(`Error cleaning up payment ${payment.id}`);
          }
      }
    }

    return Response.json({
      success: true,
      staleSessions: cleanedUp,
      message: `Cleaned up ${cleanedUp} stale checkout session(s)`
    });
  } catch (error) {
    console.error('Cleanup error');
    return Response.json({ error: 'An error occurred' }, { status: 500 });
  }
});