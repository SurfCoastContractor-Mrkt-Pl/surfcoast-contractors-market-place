import Stripe from 'npm:stripe@^15.0.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { shopId, paymentModel, shopName, ownerEmail, ownerName } = await req.json();

    if (!shopId || !paymentModel || !ownerEmail) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Facilitation model is free upfront — just activate the shop directly
    if (paymentModel === 'facilitation') {
      await base44.asServiceRole.entities.MarketShop.update(shopId, {
        payment_model: 'facilitation',
        subscription_status: 'active',
        is_active: true,
      });
      console.log(`Market shop ${shopId} activated with facilitation model`);
      return Response.json({ activated: true, paymentModel: 'facilitation' });
    }

    // Subscription model requires Stripe checkout
    if (paymentModel !== 'subscription') {
      return Response.json({ error: 'Invalid payment model' }, { status: 400 });
    }

    const priceId = Deno.env.get('STRIPE_SUBSCRIPTION_PRICE_ID');
    if (!priceId) {
      console.error('STRIPE_SUBSCRIPTION_PRICE_ID not configured');
      return Response.json({ error: 'Subscription price not configured' }, { status: 500 });
    }

    const origin = req.headers.get('origin') || new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      customer_email: ownerEmail,
      success_url: `${origin}/Success?session_id={CHECKOUT_SESSION_ID}&shop_id=${shopId}`,
      cancel_url: `${origin}/MarketShopSignup?shop_id=${shopId}&canceled=true`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        shop_id: shopId,
        shop_name: shopName,
        payment_model: paymentModel,
        owner_email: ownerEmail,
      },
    });

    console.log(`Market shop subscription checkout created for shop ${shopId}: ${session.id}`);

    return Response.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('createMarketShopCheckout error:', error.message);
    return Response.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 });
  }
});