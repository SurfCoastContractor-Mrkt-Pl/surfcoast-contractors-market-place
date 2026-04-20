import { createClientFromRequest } from 'npm:@base44/sdk@0.8.26';

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
      event = await crypto.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Initialize Base44 client (CRITICAL: must be after signature verification)
    const base44 = createClientFromRequest(req);

    // SECURITY: Database-backed idempotency to prevent duplicate processing
    const eventIdRecord = await base44.asServiceRole.entities.ProcessedWebhookEvent.filter({
      event_id: event.id
    });

    if (eventIdRecord && eventIdRecord.length > 0) {
      console.log(`Duplicate webhook event received and skipped: ${event.id}`);
      return Response.json({ received: true, duplicate: true }, { status: 200 });
    }

    // Record event as processed (idempotency key)
    try {
      await base44.asServiceRole.entities.ProcessedWebhookEvent.create({
        event_id: event.id,
        event_type: event.type,
        processed_at: new Date().toISOString()
      });
    } catch (idempotencyErr) {
      console.warn('Failed to record webhook idempotency:', idempotencyErr.message);
      // Continue processing even if logging fails
    }

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
      } else if (session.metadata?.session_type === 'consumer_order' && session.metadata?.shop_id) {
        // Handle consumer order payout to vendor
        try {
          const totalAmount = session.amount_total; // in cents
          const platformFee = Math.round(totalAmount * 0.05); // 5% platform fee
          const vendorPayout = totalAmount - platformFee; // 95% to vendor

          // Retrieve vendor's Stripe Connect account
          const shop = await base44.asServiceRole.entities.MarketShop.get(session.metadata.shop_id);
          
          if (!shop || !shop.stripe_connect_account_id) {
            console.error(`Shop ${session.metadata.shop_id} has no Stripe Connect account`);
            return Response.json({ error: 'Vendor not ready for payouts' }, { status: 400 });
          }

          // Initialize Stripe client
          const stripeModule = await import('npm:stripe@14.21.0');
          const stripe = new stripeModule.default(Deno.env.get('STRIPE_SECRET_KEY'));

          // Create transfer to vendor's connected account
          const transfer = await stripe.transfers.create({
            amount: vendorPayout,
            currency: 'usd',
            destination: shop.stripe_connect_account_id,
            metadata: {
              session_id: session.id,
              shop_id: session.metadata.shop_id,
            },
          });

          console.log(`Transfer created: ${transfer.id} for shop ${session.metadata.shop_id}`);

          // Update ConsumerOrder with payout details
          const consumerOrder = await base44.asServiceRole.entities.ConsumerOrder.filter({
            stripe_checkout_session_id: session.id,
          });

          if (consumerOrder && consumerOrder.length > 0) {
            await base44.asServiceRole.entities.ConsumerOrder.update(consumerOrder[0].id, {
              status: 'completed',
              platform_fee: platformFee / 100, // Convert back to dollars
              vendor_payout: vendorPayout / 100,
              stripe_transfer_id: transfer.id,
            });
            console.log(`ConsumerOrder ${consumerOrder[0].id} updated with transfer ${transfer.id}`);
          }
        } catch (payoutErr) {
          console.error('Failed to process vendor payout:', payoutErr.message);
          // Don't fail the webhook response, but log the error for admin review
        }
      }

      console.log('Payment record created successfully');
    }

    // Handle customer.subscription.created — send welcome inbox message to subscriber
    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object;
      const customerEmail = subscription.metadata?.contractor_email || subscription.customer_email;

      if (customerEmail) {
        try {
          await base44.asServiceRole.entities.Message.create({
            sender_name: 'SurfCoast Team',
            sender_email: 'hello@surfcoastmarket.com',
            sender_type: 'customer',
            recipient_email: customerEmail,
            recipient_name: subscription.metadata?.contractor_name || customerEmail,
            subject: '🎉 Welcome to Unlimited — Your Collaboration Tools Are Unlocked!',
            body: `Hi there,

Thank you for subscribing to the SurfCoast Unlimited Messaging plan!

Your subscription has been activated and you now have access to a full suite of professional collaboration tools — included at no extra cost:

📋 PROJECT MILESTONES
Break any job down into clear checkpoints. Both you and your client can track progress together in real time, so everyone stays aligned from start to finish.

📁 FILE SHARING
Share blueprints, photos, contracts, and any other project documents directly within the project workspace. No more hunting through emails — everything lives in one secure place.

💬 DEDICATED PROJECT CHAT
Every project gets its own private message thread. All conversations about a specific job stay organized and separate, making it easy to reference past discussions and avoid confusion across multiple projects.

🔒 HOW TO ACCESS THESE FEATURES
These tools are available inside your active project workspaces (linked to an approved Scope of Work). When you have an active project with a client, open the project from your dashboard and you'll find the Milestones, Files, and Project Chat tabs ready to go.

These features are exclusively available to subscribers — a thank-you for your commitment to working professionally on the platform.

If you have any questions, reply to this message or visit your account dashboard.

Welcome aboard,
The SurfCoast Team`,
            payment_id: subscription.id,
            read: false,
          });
          console.log(`Welcome subscription message sent to ${customerEmail}`);
        } catch (msgErr) {
          console.error('Failed to send subscription welcome message:', msgErr.message);
        }
      }
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