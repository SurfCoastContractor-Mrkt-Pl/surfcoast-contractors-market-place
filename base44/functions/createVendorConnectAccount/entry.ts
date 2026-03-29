import Stripe from 'npm:stripe@17.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Creates a Stripe Connect onboarding link for a vendor to set up their payout account
Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shopId } = await req.json();
    if (!shopId) {
      return Response.json({ error: 'Missing shopId' }, { status: 400 });
    }

    const shop = await base44.entities.MarketShop.get(shopId);
    if (!shop || shop.email !== user.email) {
      return Response.json({ error: 'Shop not found or access denied' }, { status: 403 });
    }

    const origin = req.headers.get('origin') || 'https://app.base44.com';

    let accountId = shop.stripe_connect_account_id;

    // Create a new Connect account if one doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        metadata: {
          shop_id: shopId,
          shop_name: shop.shop_name,
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
        },
      });
      accountId = account.id;

      // Save the Connect account ID on the shop
      await base44.entities.MarketShop.update(shopId, {
        stripe_connect_account_id: accountId,
        stripe_connect_onboarded: false,
      });
      console.log(`Created Stripe Connect account ${accountId} for shop ${shopId}`);
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/MarketShopDashboard?connect_refresh=true`,
      return_url: `${origin}/MarketShopDashboard?connect_success=true`,
      type: 'account_onboarding',
    });

    return Response.json({ success: true, onboardingUrl: accountLink.url });

  } catch (error) {
    console.error('createVendorConnectAccount error:', error.message);
    return Response.json({ error: error.message || 'Failed to create Connect account' }, { status: 500 });
  }
});