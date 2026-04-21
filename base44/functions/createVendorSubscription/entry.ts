import Stripe from 'npm:stripe@^15.0.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const vendorPriceId = Deno.env.get('STRIPE_VENDOR_LISTING_PRICE_ID');

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

    const { shop_id, shop_name, owner_email, owner_name, vendor_type } = await req.json();

    // Verify owner email matches authenticated user
    if (owner_email !== user.email) {
      return Response.json({ error: 'Forbidden: You can only create subscriptions for your own account' }, { status: 403 });
    }

    // Validate inputs
    if (!shop_id || !shop_name || !owner_email || !owner_name || !vendor_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!vendorPriceId) {
      console.error('STRIPE_VENDOR_LISTING_PRICE_ID not set');
      return Response.json({ error: 'Payment configuration error' }, { status: 500 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: vendorPriceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${new URL(req.url).origin}/Success?shop_id=${shop_id}`,
      cancel_url: `${new URL(req.url).origin}/MarketShopSignup?type=${vendor_type}&canceled=true`,
      customer_email: owner_email,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        shop_id: shop_id,
        shop_name: shop_name,
        vendor_type: vendor_type
      }
    });

    console.log(`Checkout session created for shop ${shop_id}: ${session.id}`);

    return Response.json({
      checkoutUrl: session.url,
      sessionId: session.id
    });
  } catch (error) {
    console.error('createVendorSubscription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});