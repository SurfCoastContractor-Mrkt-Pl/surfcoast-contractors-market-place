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

    // Only handle checkout.session.completed
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

      console.log(`Payment ${paymentId} confirmed`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
});