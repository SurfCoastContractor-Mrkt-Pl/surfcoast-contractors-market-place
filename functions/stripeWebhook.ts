import Stripe from 'npm:stripe@17.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return Response.json({ received: true, skipped: true }, { status: 200 });
  }

  const session = event.data.object;
  console.log(`checkout.session.completed: ${session.id}, payment_status: ${session.payment_status}`);

  if (session.payment_status !== 'paid') {
    console.warn(`Session ${session.id} not paid (status: ${session.payment_status}), skipping`);
    return Response.json({ received: true }, { status: 200 });
  }

  try {
    const base44 = createClientFromRequest(req);

    let payment = null;

    // Primary: look up by payment_id in metadata
    if (session.metadata?.payment_id) {
      try {
        payment = await base44.asServiceRole.entities.Payment.get(session.metadata.payment_id);
      } catch (e) {
        console.warn('Payment lookup by ID failed:', e.message);
      }
    }

    // Fallback: look up by payer email
    if (!payment) {
      const email = session.customer_email || session.metadata?.payer_email;
      if (email) {
        const results = await base44.asServiceRole.entities.Payment.filter({
          payer_email: email,
          status: 'pending',
        });
        if (results && results.length > 0) {
          payment = results.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
        }
      }
    }

    if (!payment) {
      console.warn(`No pending payment found for session ${session.id}`);
      return Response.json({ received: true }, { status: 200 });
    }

    // Build update: set status to 'confirmed' and confirmed_at
    const updateData = {
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    };

    // For timed tier ($1.50), set 10-minute session expiry
    if (payment.amount === 1.50 && !payment.session_expires_at) {
      updateData.session_expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    }

    await base44.asServiceRole.entities.Payment.update(payment.id, updateData);
    console.log(`Payment ${payment.id} confirmed for ${payment.payer_email}`);

    // Send receipt email
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: payment.payer_email,
        from_name: 'SurfCoast Payments',
        subject: 'Payment Confirmed — Receipt',
        body: `Hi ${payment.payer_name || ''},\n\nYour payment has been successfully processed.\n\nAmount: $${Number(payment.amount).toFixed(2)}\nPurpose: ${payment.purpose || 'Service fee'}\nDate: ${new Date().toLocaleDateString()}\n\nThank you for using SurfCoast Contractor Market Place.\n\n— SurfCoast Contractor Market Place`,
      });
      console.log(`Receipt email sent to ${payment.payer_email}`);
    } catch (emailErr) {
      console.warn('Failed to send receipt email:', emailErr.message);
    }

    return Response.json({ received: true, payment_id: payment.id }, { status: 200 });
  } catch (error) {
    console.error('Error processing checkout.session.completed:', error.message);
    return Response.json({ error: 'Processing failed' }, { status: 500 });
  }
});