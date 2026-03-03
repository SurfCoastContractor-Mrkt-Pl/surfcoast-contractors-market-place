import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    // Validate webhook signature
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const paymentId = session.metadata?.payment_id;

      if (!paymentId) {
        console.error('No payment_id in metadata');
        return Response.json({ error: 'No payment ID' }, { status: 400 });
      }

      // Update payment status to confirmed
      await base44.asServiceRole.entities.Payment.update(paymentId, {
        status: 'confirmed',
      });

      // Send confirmation email
      const payment = await base44.asServiceRole.entities.Payment.filter({ id: paymentId });
      if (payment.length > 0) {
        const p = payment[0];
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: p.payer_email,
          subject: 'Payment Confirmed — ContractorHub',
          body: `Hello ${p.payer_name},\n\nYour platform access fee of $${(p.amount || 0).toFixed(2)} has been confirmed.\n\nPayment ID: ${p.id}\nDate: ${new Date().toLocaleDateString()}\nPurpose: ${p.purpose}\n\nThank you for using ContractorHub!\n\n(Do not reply to this automated email)`,
        });
      }

      console.log(`Payment ${paymentId} confirmed`);
    }

    // Handle charge.refunded
    if (event.type === 'charge.refunded') {
      const charge = event.data.object;
      const paymentId = charge.metadata?.payment_id;

      if (paymentId) {
        await base44.asServiceRole.entities.Payment.update(paymentId, {
          status: 'refunded',
        });
        console.log(`Payment ${paymentId} refunded`);
      }
    }

    // Handle charge.dispute.created
    if (event.type === 'charge.dispute.created') {
      const dispute = event.data.object;
      const paymentId = dispute.metadata?.payment_id;

      if (paymentId) {
        await base44.asServiceRole.entities.Payment.update(paymentId, {
          status: 'disputed',
        });
        console.log(`Payment ${paymentId} disputed`);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
});