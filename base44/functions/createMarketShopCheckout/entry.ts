import Stripe from 'npm:stripe@17.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { shopId, paymentModel, shopName, ownerEmail, ownerName } = await req.json();

    if (!shopId || !paymentModel || !ownerEmail) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify authenticated user matches the owner email
    const user = await base44.auth.me();
    if (!user || user.email !== ownerEmail) {
      console.warn(`Unauthorized checkout attempt: user ${user?.email} tried to create checkout for ${ownerEmail}`);
      return Response.json({ error: 'Unauthorized: Email mismatch' }, { status: 403 });
    }

    if (!['facilitation', 'subscription'].includes(paymentModel)) {
      return Response.json({ error: 'Invalid payment model' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || new URL(req.url).origin;

    let session;

    if (paymentModel === 'facilitation') {
      // Collect card via Stripe setup mode — no charge now, card saved for future 5% fees
      // Find or create Stripe customer
      let customerId;
      const existing = await stripe.customers.list({ email: ownerEmail, limit: 1 });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
      } else {
        const customer = await stripe.customers.create({ email: ownerEmail, name: ownerName });
        customerId = customer.id;
      }

      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'setup',
        customer: customerId,
        success_url: `${origin}/Success?session_id={CHECKOUT_SESSION_ID}&shop_id=${shopId}&payment_model=facilitation`,
        cancel_url: `${origin}/MarketShopSignup?shop_id=${shopId}&canceled=true`,
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          shop_id: shopId,
          shop_name: shopName,
          payment_model: 'facilitation',
          owner_email: ownerEmail,
        },
      });

      console.log(`Market shop facilitation setup checkout created for shop ${shopId}: ${session.id}`);
    } else {
      // Subscription model — $35/month recurring charge
      const priceId = Deno.env.get('STRIPE_SUBSCRIPTION_PRICE_ID');
      if (!priceId) {
        console.error('STRIPE_SUBSCRIPTION_PRICE_ID not configured');
        return Response.json({ error: 'Subscription price not configured' }, { status: 500 });
      }

      session = await stripe.checkout.sessions.create({
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
    }

    return Response.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('createMarketShopCheckout error:', error.message);
    return Response.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 });
  }
});