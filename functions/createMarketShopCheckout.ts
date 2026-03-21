import Stripe from 'npm:stripe@^15.0.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shopId, paymentModel, shopName, ownerEmail, ownerName } = await req.json();

    if (!shopId || !paymentModel || !ownerEmail) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify owner email matches authenticated user
    if (ownerEmail !== user.email) {
      return Response.json({ error: 'Forbidden: Email does not match authenticated user' }, { status: 403 });
    }

    // Map payment model to price ID
    const priceMap = {
      subscription: Deno.env.get('STRIPE_SUBSCRIPTION_PRICE_ID'),
      facilitation: Deno.env.get('STRIPE_VENDOR_LISTING_PRICE_ID'),
    };

    const priceId = priceMap[paymentModel];
    if (!priceId) {
      console.error(`Invalid payment model: ${paymentModel}`);
      return Response.json({ error: 'Invalid payment model' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || new URL(req.url).origin;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
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

    console.log(`Market shop checkout created for shop ${shopId}: ${session.id}`);

    return Response.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('createMarketShopCheckout error:', error.message);
    console.error('Full error:', JSON.stringify(error));
    return Response.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 });
  }
});