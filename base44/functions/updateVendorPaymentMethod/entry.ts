import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe';

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

    const { shopId } = await req.json();

    if (!shopId) {
      return Response.json({ error: 'Shop ID required' }, { status: 400 });
    }

    // Get shop
    const shop = await base44.entities.MarketShop.read(shopId);
    
    if (!shop) {
      return Response.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Verify user owns shop
    if (shop.email !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if Stripe customer exists
    if (!shop.wave_shop_stripe_customer_id) {
      return Response.json({ error: 'No Stripe account found. Set up subscription first.' }, { status: 400 });
    }

    // Create setup intent for secure card update
    const setupIntent = await stripe.setupIntents.create({
      customer: shop.wave_shop_stripe_customer_id,
      payment_method_types: ['card'],
    });

    return Response.json({ 
      success: true,
      clientSecret: setupIntent.client_secret,
      message: 'Setup intent created. Redirect to Stripe portal to update payment method.'
    });
  } catch (error) {
    console.error('Payment method update error:', error);
    return Response.json({ 
      error: error.message || 'Failed to update payment method',
      success: false 
    }, { status: 500 });
  }
});