import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

function initializeStripe() {
  const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not configured');
  }
  return new Stripe(secretKey);
}

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

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return Response.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    // Verify webhook signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (sigError) {
      console.error('Webhook signature verification failed');
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Check idempotency
    if (isEventProcessed(event.id)) {
      console.log(`Skipping duplicate subscription webhook: ${event.id}`);
      return Response.json({ received: true, duplicate: true }, { status: 200 });
    }
    markEventProcessed(event.id);

    const base44 = createClientFromRequest(req);

    // --- Helper: update MarketShop wave_shop fields by subscription ---
    async function updateMarketShopWaveShop(subscriptionId, fields) {
      const shops = await base44.asServiceRole.entities.MarketShop.filter({
        wave_shop_subscription_id: subscriptionId,
      });
      if (shops && shops.length > 0) {
        await base44.asServiceRole.entities.MarketShop.update(shops[0].id, fields);
        console.log(`MarketShop updated for subscription ${subscriptionId}:`, fields);
      }
    }

    // --- Helper: find MarketShop by Stripe customer id ---
    async function findMarketShopByCustomer(customerId) {
      const shops = await base44.asServiceRole.entities.MarketShop.filter({
        wave_shop_stripe_customer_id: customerId,
      });
      return shops?.[0] || null;
    }

    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object;
      const userEmail = subscription.metadata?.user_email;
      const subscriptionType = subscription.metadata?.subscription_type;

      console.log('Subscription created:', subscription.id, '| type:', subscriptionType);

      // Handle Wave Shop subscription
      if (subscriptionType === 'wave_shop' && userEmail) {
        const shop = await findMarketShopByCustomer(subscription.customer) ||
          (await base44.asServiceRole.entities.MarketShop.filter({ email: userEmail }))?.[0];

        if (shop) {
          await base44.asServiceRole.entities.MarketShop.update(shop.id, {
            wave_shop_subscription_status: 'active',
            wave_shop_subscription_id: subscription.id,
            wave_shop_stripe_customer_id: subscription.customer,
            wave_shop_subscription_start: new Date(subscription.created * 1000).toISOString(),
            wave_shop_subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            subscription_status: 'active',
            status: 'active'
          });
          console.log(`Wave Shop activated for ${userEmail}`);
        } else {
          console.warn(`No MarketShop found for Wave Shop subscription: ${userEmail}`);
        }
      } else {
        // Legacy: create generic Subscription record
        await base44.asServiceRole.entities.Subscription.create({
          user_email: userEmail || subscription.metadata?.user_email,
          user_type: subscription.metadata?.user_type,
          stripe_subscription_id: subscription.id,
          status: 'active',
          start_date: new Date(subscription.created * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          amount_paid: subscription.items.data[0].price.unit_amount,
        });
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const subscriptionType = subscription.metadata?.subscription_type;
      const stripeStatus = subscription.status;
      const mappedStatus = stripeStatus === 'active' ? 'active' :
                           stripeStatus === 'past_due' ? 'past_due' : 'cancelled';

      if (subscriptionType === 'wave_shop') {
        await updateMarketShopWaveShop(subscription.id, {
          wave_shop_subscription_status: mappedStatus,
          wave_shop_subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          subscription_status: mappedStatus === 'active' ? 'active' : 'paused'
        });
      } else {
        const subs = await base44.asServiceRole.entities.Subscription.filter({
          stripe_subscription_id: subscription.id,
        });
        if (subs && subs.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
            status: mappedStatus,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          });
        }
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const subscriptionType = subscription.metadata?.subscription_type;

      if (subscriptionType === 'wave_shop') {
        await updateMarketShopWaveShop(subscription.id, {
          wave_shop_subscription_status: 'cancelled',
          subscription_status: 'inactive',
          status: 'pending'
        });
      } else {
        const subs = await base44.asServiceRole.entities.Subscription.filter({
          stripe_subscription_id: subscription.id,
        });
        if (subs && subs.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
            status: 'cancelled',
          });
        }
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const subscriptionType = invoice.subscription_details?.metadata?.subscription_type ||
        (await (async () => {
          try {
            const sub = await stripe.subscriptions.retrieve(invoice.subscription);
            return sub.metadata?.subscription_type;
          } catch { return null; }
        })());

      if (subscriptionType === 'wave_shop') {
        await updateMarketShopWaveShop(invoice.subscription, {
          wave_shop_subscription_status: 'past_due',
          subscription_status: 'paused'
        });
      } else {
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
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error');
    return Response.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
});