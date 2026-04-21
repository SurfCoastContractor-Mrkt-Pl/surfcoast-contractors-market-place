import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.19.0';

function initializeStripe() {
  const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not configured');
  }
  return new Stripe(secretKey);
}

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    let stripe;
    try {
      stripe = initializeStripe();
    } catch (initErr) {
      console.error('Stripe initialization failed:', initErr.message);
      return Response.json({
        error: 'Payment service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, { status: 503 });
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    // Verify Stripe webhook signature
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    const base44 = createClientFromRequest(req);

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const invoiceId = session.metadata?.invoice_id;

      if (!invoiceId) {
        console.log('No invoice ID in webhook metadata, skipping');
        return Response.json({ received: true });
      }

      // Update invoice status to paid
      await base44.asServiceRole.entities.ResidentialWaveInvoice.update(invoiceId, {
        status: 'paid',
        payment_date: new Date().toISOString().split('T')[0],
      });

      console.log(`Invoice ${invoiceId} marked as paid`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
});