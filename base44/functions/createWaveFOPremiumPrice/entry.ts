import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const productId = Deno.env.get('STRIPE_WAVE_FO_PREMIUM_PRODUCT_ID');
    if (!productId) {
      return Response.json({ error: 'STRIPE_WAVE_FO_PREMIUM_PRODUCT_ID environment variable not set' }, { status: 500 });
    }

    // Create a new price for Wave FO Premium at $100/month
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: 10000, // $100.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      nickname: 'Wave FO Premium $100/month',
    });

    console.log('New price created:', price.id, price.unit_amount / 100);

    return Response.json({ 
      success: true, 
      priceId: price.id,
      amount: '$100.00/month',
      message: 'Wave FO Premium $100/month price created. Update STRIPE_WAVE_FO_PREMIUM_PRICE_ID secret with this ID and manually rename Residential Wave Bundle in Stripe to "Wave FO Premium + Subscription Communication Bundle"'
    });
  } catch (error) {
    console.error('Error creating price:', error.message);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});