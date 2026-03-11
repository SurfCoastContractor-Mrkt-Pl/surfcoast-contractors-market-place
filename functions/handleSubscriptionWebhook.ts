import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Idempotency tracking
const processedEvents = new Map();
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000;

function isEventProcessed(eventId) {
  if (processedEvents.has(eventId)) {
    const timestamp = processedEvents.get(eventId);
    if (Date.now() - timestamp < IDEMPOTENCY_TTL) {
      return true;
    }
    processedEvents.delete(eventId);
  }
  return false;
}

function markEventProcessed(eventId) {
  processedEvents.set(eventId, Date.now());
  for (const [id, ts] of processedEvents.entries()) {
    if (Date.now() - ts > IDEMPOTENCY_TTL) {
      processedEvents.delete(id);
    }
  }
}

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    // Check idempotency
    if (isEventProcessed(event.id)) {
      console.log(`Skipping duplicate subscription webhook: ${event.id}`);
      return Response.json({ received: true, duplicate: true }, { status: 200 });
    }
    markEventProcessed(event.id);

    const base44 = createClientFromRequest(req);

    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object;
      
      console.log('Subscription created:', subscription.id);
      
      // Create subscription record
      await base44.asServiceRole.entities.Subscription.create({
        user_email: subscription.customer_email || subscription.metadata?.user_email,
        user_type: subscription.metadata?.user_type,
        stripe_subscription_id: subscription.id,
        status: 'active',
        start_date: new Date(subscription.created * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        amount_paid: subscription.items.data[0].price.unit_amount,
      });
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      
      const status = subscription.status === 'active' ? 'active' : 
                     subscription.status === 'past_due' ? 'past_due' : 'cancelled';

      const subs = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: subscription.id,
      });

      if (subs && subs.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
          status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        });
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      
      const subs = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: subscription.id,
      });

      if (subs && subs.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
          status: 'cancelled',
        });
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const subs = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: invoice.subscription,
      });

      if (subs && subs.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
          status: 'past_due',
        });
        console.log(`Subscription marked past_due: ${invoice.subscription}`);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});