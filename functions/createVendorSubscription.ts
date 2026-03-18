import Stripe from 'npm:stripe@^15.0.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const vendorPriceId = Deno.env.get('STRIPE_VENDOR_LISTING_PRICE_ID');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { shop_id, shop_name, owner_email, owner_name, vendor_type } = await req.json();

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