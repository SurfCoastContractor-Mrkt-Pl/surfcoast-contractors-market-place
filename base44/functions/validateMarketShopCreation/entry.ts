import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shop_type } = await req.json();

    if (!shop_type) {
      return Response.json({ error: 'Missing shop_type' }, { status: 400 });
    }

    // Only validate for authenticated user's email (prevent enumeration)
    const email = user.email;

    // Check existing shops for this email
    const existingShops = await base44.asServiceRole.entities.MarketShop.filter({
      email: email
    });

    // Count shops by type
    const farmersMarketCount = existingShops.filter(s => s.shop_type === 'farmers_market').length;
    const swapMeetCount = existingShops.filter(s => s.shop_type === 'swap_meet').length;
    const bothCount = existingShops.filter(s => s.shop_type === 'both').length;

    // Rule: max 1 farmers_market + max 1 swap_meet (both counts as either/both)
    const canCreateFarmersMarket = farmersMarketCount === 0 && bothCount === 0;
    const canCreateSwapMeet = swapMeetCount === 0 && bothCount === 0;

    if (shop_type === 'farmers_market' && !canCreateFarmersMarket) {
      return Response.json({
        allowed: false,
        reason: 'You already have a Farmers Market account'
      }, { status: 200 });
    }

    if (shop_type === 'swap_meet' && !canCreateSwapMeet) {
      return Response.json({
        allowed: false,
        reason: 'You already have a Swap Meet account'
      }, { status: 200 });
    }

    if (shop_type === 'both' && (farmersMarketCount > 0 || swapMeetCount > 0 || bothCount > 0)) {
      return Response.json({
        allowed: false,
        reason: 'You already have a shop account. You can only have one account per type.'
      }, { status: 200 });
    }

    return Response.json({ allowed: true }, { status: 200 });
  } catch (error) {
    console.error('validateMarketShopCreation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});