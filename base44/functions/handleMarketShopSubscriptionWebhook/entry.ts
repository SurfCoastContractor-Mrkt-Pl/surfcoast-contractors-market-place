import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe';

function initializeStripe() {
  const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not configured');
  }
  return new Stripe(secretKey);
}

const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');

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

    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      WEBHOOK_SECRET
    );

    const base44 = createClientFromRequest(req);

    // Handle subscription events
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      
      // Find shop by Stripe customer ID
      const shops = await base44.asServiceRole.entities.MarketShop.filter({
        wave_shop_stripe_customer_id: subscription.customer
      });

      if (shops && shops.length > 0) {
        const shop = shops[0];
        
        // Map Stripe status to Wave Shop status
        const statusMap = {
          'active': 'active',
          'past_due': 'past_due',
          'canceled': 'cancelled',
          'unpaid': 'past_due'
        };

        const waveStatus = statusMap[subscription.status] || 'inactive';
        
        // Update shop subscription status
        await base44.asServiceRole.entities.MarketShop.update(shop.id, {
          wave_shop_subscription_status: waveStatus,
          wave_shop_subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        });

        console.log(`Updated shop ${shop.id} subscription status to ${waveStatus}`);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      
      const shops = await base44.asServiceRole.entities.MarketShop.filter({
        wave_shop_stripe_customer_id: subscription.customer
      });

      if (shops && shops.length > 0) {
        const shop = shops[0];
        
        await base44.asServiceRole.entities.MarketShop.update(shop.id, {
          wave_shop_subscription_status: 'cancelled'
        });

        console.log(`Cancelled subscription for shop ${shop.id}`);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ 
      error: error.message || 'Webhook processing failed'
    }, { status: 500 });
  }
});