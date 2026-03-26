import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Get the Stripe signature
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    // Verify webhook signature
    const crypto = await import('npm:stripe@14.21.0').then(m => m.default.webhooks);
    let event;
    
    try {
      event = crypto.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Initialize Base44 client
    const base44 = createClientFromRequest(req);

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      console.log(`Checkout session completed: ${session.id}`);
      console.log('Metadata:', session.metadata);

      // Save payment record based on session type
      if (session.metadata?.session_type === 'timed_chat') {
        // Create timed chat session record if needed
        await base44.asServiceRole.entities.TimedChatSession.create({
          checkout_session_id: session.id,
          initiator_email: session.metadata?.initiator_email,
          initiator_name: session.metadata?.initiator_name,
          recipient_email: session.metadata?.recipient_email,
          recipient_name: session.metadata?.recipient_name,
          amount: session.amount_total / 100, // Convert cents to dollars
          payment_status: 'confirmed',
          session_started_at: new Date().toISOString(),
        });
      } else if (session.metadata?.session_type === 'quote_request') {
        // Create quote payment record if needed
        await base44.asServiceRole.entities.Payment.create({
          payer_email: session.customer_email,
          payer_name: session.metadata?.payer_name || 'Unknown',
          payer_type: session.metadata?.payer_type || 'customer',
          amount: session.amount_total / 100,
          purpose: 'quote_request',
          status: 'confirmed',
          stripe_session_id: session.id,
          confirmed_at: new Date().toISOString(),
        });
      }

      console.log('Payment record created successfully');
    }

    // Handle payment_intent.payment_failed
    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object;
      console.error(`Payment failed for intent: ${intent.id}`, intent.last_payment_error);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});