import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
// Use STRIPE_WEBHOOK_SECRET (live key, not test or duplicate)
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

if (!webhookSecret) {
  console.error('STRIPE_WEBHOOK_SECRET is not configured');
}

// Database-backed idempotency checking
async function isEventProcessed(base44, eventId) {
  try {
    const processed = await base44.asServiceRole.entities.ProcessedWebhookEvent.filter({ event_id: eventId });
    return processed.length > 0;
  } catch {
    return false;
  }
}

async function markEventProcessed(base44, eventId, eventType) {
  try {
    await base44.asServiceRole.entities.ProcessedWebhookEvent.create({
      event_id: eventId,
      event_type: eventType,
      processed_at: new Date().toISOString(),
      status: 'success'
    });
  } catch (error) {
    console.error('Failed to mark event as processed:', error.message);
  }
}

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    if (!signature) {
      console.error('Missing Stripe signature');
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Validate webhook signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (sigError) {
      console.error('Webhook signature verification failed');
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    // Create base44 client after auth (webhook may not have auth context)
    const base44 = createClientFromRequest(req);

    // Check idempotency (database-backed)
    if (await isEventProcessed(base44, event.id)) {
      console.log(`Skipping duplicate webhook event: ${event.id}`);
      return Response.json({ received: true, duplicate: true }, { status: 200 });
    }
    await markEventProcessed(base44, event.id, event.type);

    // Handle checkout.session.completed (fast path)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const paymentId = session.metadata?.payment_id;

      if (!paymentId) {
        console.error('No payment_id in metadata for session:', session.id);
        console.error('Session metadata:', session.metadata);
        return Response.json({ received: true }); // Don't fail, Stripe will retry
      }

      try {
        // Verify paymentId is a string
        if (typeof paymentId !== 'string') {
          console.error('Invalid payment_id format:', paymentId);
          return Response.json({ received: true });
        }

        // Update payment status to confirmed with 10-minute session expiry
        const confirmedAt = new Date();
        const sessionExpiresAt = new Date(confirmedAt.getTime() + 10 * 60 * 1000); // +10 minutes
        await base44.asServiceRole.entities.Payment.update(paymentId, {
          status: 'confirmed',
          confirmed_at: confirmedAt.toISOString(),
          session_expires_at: sessionExpiresAt.toISOString(),
        });

        // Send confirmation email
        const payment = await base44.asServiceRole.entities.Payment.filter({ id: paymentId });
        if (payment && payment.length > 0) {
          const p = payment[0];
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: p.payer_email,
            from_name: 'SurfCoast Contractor Market Place',
            subject: 'Payment Confirmed — SurfCoast',
            body: `Hello ${p.payer_name},\n\nYour platform access fee of $${(p.amount || 0).toFixed(2)} has been confirmed.\n\nPayment ID: ${p.id}\nDate: ${new Date().toLocaleDateString()}\nPurpose: ${p.purpose}\n\nThank you for using SurfCoast Contractor Market Place!\n\n(Do not reply to this automated email)`,
          });
        }

        console.log(`Payment ${paymentId} confirmed successfully`);
      } catch (updateError) {
         console.error('Error confirming payment for session', session.id);
         // Still return received: true to prevent Stripe retrying indefinitely
       }
    }

    // Handle charge.refunded
    if (event.type === 'charge.refunded') {
      const charge = event.data.object;
      const paymentId = charge.metadata?.payment_id;

      if (paymentId) {
        try {
          await base44.asServiceRole.entities.Payment.update(paymentId, {
            status: 'refunded',
          });
          console.log(`Payment ${paymentId} refunded successfully`);
        } catch (refundError) {
          console.error('Error updating refund status for payment', paymentId);
        }
      } else {
        console.warn('Refund event received but no payment_id in metadata:', charge.metadata);
      }
    }

    // Handle charge.dispute.created
    if (event.type === 'charge.dispute.created') {
      const dispute = event.data.object;
      const paymentId = dispute.metadata?.payment_id;

      if (paymentId) {
        try {
          await base44.asServiceRole.entities.Payment.update(paymentId, {
            status: 'disputed',
          });
          console.log(`Payment ${paymentId} disputed successfully`);
        } catch (disputeError) {
          console.error('Error updating dispute status for payment', paymentId);
        }
      } else {
        console.warn('Dispute event received but no payment_id in metadata:', dispute.metadata);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});