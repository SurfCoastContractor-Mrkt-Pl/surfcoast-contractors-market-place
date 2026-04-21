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

    // Check if account exists
    if (!shop.stripe_connect_account_id) {
      return Response.json({ error: 'No Stripe Connect account found' }, { status: 400 });
    }

    // Create new onboarding link (accounts that failed verification can be updated)
    const accountLink = await stripe.accountLinks.create({
      account: shop.stripe_connect_account_id,
      type: 'account_onboarding',
      refresh_url: `${Deno.env.get('BASE44_APP_URL')}/MarketShopDashboard?tab=subscription`,
      return_url: `${Deno.env.get('BASE44_APP_URL')}/MarketShopDashboard?tab=subscription&connect=success`,
    });

    return Response.json({ 
      success: true,
      onboardingUrl: accountLink.url
    });
  } catch (error) {
    console.error('Resume Stripe Connect onboarding error:', error);
    return Response.json({ 
      error: error.message || 'Failed to resume onboarding',
      success: false 
    }, { status: 500 });
  }
});