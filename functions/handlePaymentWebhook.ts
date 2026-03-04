import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
// Use STRIPE_WEBHOOK_SECRET (live key, not test or duplicate)
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

if (!webhookSecret) {
  console.error('STRIPE_WEBHOOK_SECRET is not configured');
}

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    // Validate webhook signature
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    
    // Create base44 client after auth (webhook may not have auth context)
    const base44 = createClientFromRequest(req);

    // Handle checkout.session.completed
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

        // Update payment status to confirmed with 1-hour session expiry
        const confirmedAt = new Date();
        const sessionExpiresAt = new Date(confirmedAt.getTime() + 60 * 60 * 1000); // +1 hour
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
            subject: 'Payment Confirmed — ContractorHub',
            body: `Hello ${p.payer_name},\n\nYour platform access fee of $${(p.amount || 0).toFixed(2)} has been confirmed.\n\nPayment ID: ${p.id}\nDate: ${new Date().toLocaleDateString()}\nPurpose: ${p.purpose}\n\nThank you for using ContractorHub!\n\n(Do not reply to this automated email)`,
          });
        }

        console.log(`Payment ${paymentId} confirmed successfully`);
      } catch (updateError) {
        console.error('Error confirming payment for session', session.id, ':', updateError.message);
        console.error('Error details:', updateError);
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
          console.error('Error updating refund status for payment', paymentId, ':', refundError.message);
          console.error('Error details:', refundError);
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
          console.error('Error updating dispute status for payment', paymentId, ':', disputeError.message);
          console.error('Error details:', disputeError);
        }
      } else {
        console.warn('Dispute event received but no payment_id in metadata:', dispute.metadata);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    console.error('Error type:', error.type);
    // Return 400 for signature validation errors, but still acknowledge receipt to prevent retries
    if (error.type === 'StripeSignatureVerificationError') {
      console.error('Signature verification failed - webhook may be fraudulent or secret is incorrect');
    }
    return Response.json({ received: true }, { status: 200 });
  }
});