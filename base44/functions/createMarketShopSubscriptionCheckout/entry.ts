import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

function initializeStripe() {
  const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not configured');
  }
  return new Stripe(secretKey);
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

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email, shop_name, success_url, cancel_url } = await req.json();

    if (!user_email || !success_url || !cancel_url) {
      return Response.json({ error: 'Missing required fields: user_email, success_url, cancel_url' }, { status: 400 });
    }

    if (user.email !== user_email) {
      return Response.json({ error: 'Forbidden: Cannot create subscription for another user' }, { status: 403 });
    }

    // Check if user already has an active Wave Shop subscription
    const existingShops = await base44.asServiceRole.entities.MarketShop.filter({ email: user_email });
    const existingShop = existingShops?.[0];

    if (existingShop?.wave_shop_subscription_status === 'active') {
      return Response.json({ error: 'User already has an active Wave Shop subscription.' }, { status: 409 });
    }

    // Create or retrieve Stripe customer
    let customerId = existingShop?.wave_shop_stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user_email,
        name: shop_name || user_email,
        metadata: { base44_app_id: Deno.env.get('BASE44_APP_ID') }
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: Deno.env.get('STRIPE_MARKET_SHOP_PRICE_ID'),
          quantity: 1
        }
      ],
      success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email,
        shop_name: shop_name || '',
        subscription_type: 'wave_shop'
      },
      subscription_data: {
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          user_email,
          subscription_type: 'wave_shop'
        }
      }
    });

    // If shop exists, pre-save the stripe customer id
    if (existingShop && !existingShop.wave_shop_stripe_customer_id) {
      await base44.asServiceRole.entities.MarketShop.update(existingShop.id, {
        wave_shop_stripe_customer_id: customerId
      });
    }

    console.log(`Wave Shop checkout session created for ${user_email}: ${session.id}`);
    return Response.json({ checkout_url: session.url, session_id: session.id });

  } catch (error) {
    console.error('createMarketShopSubscriptionCheckout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});