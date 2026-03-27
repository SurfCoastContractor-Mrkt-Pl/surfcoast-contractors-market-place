import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Trade-specific supply house chains (fallback data)
const TRADE_SUPPLY_CHAINS = {
  electrician: [
    { name: 'Sensormatic Electronics', types: ['electrical'] },
    { name: 'Graybar Electric', types: ['electrical'] },
    { name: 'Wesco International', types: ['electrical'] },
    { name: 'Anixter International', types: ['electrical'] }
  ],
  plumber: [
    { name: 'Ferguson Enterprises', types: ['plumbing'] },
    { name: 'Reece Plumbing', types: ['plumbing'] },
    { name: 'Lowe\'s', types: ['plumbing', 'general'] },
    { name: 'The Home Depot', types: ['plumbing', 'general'] }
  ],
  hvac: [
    { name: 'Carrier HVAC Distributor', types: ['hvac'] },
    { name: 'Lennox Parts Distributor', types: ['hvac'] },
    { name: 'ACR Group', types: ['hvac'] }
  ],
  carpenter: [
    { name: 'Lumber Liquidators', types: ['carpentry'] },
    { name: 'Menards', types: ['carpentry', 'general'] },
    { name: 'The Home Depot', types: ['carpentry', 'general'] },
    { name: 'Lowe\'s', types: ['carpentry', 'general'] }
  ],
  general: [
    { name: 'The Home Depot', types: ['general'] },
    { name: 'Lowe\'s', types: ['general'] },
    { name: 'Menards', types: ['general'] },
    { name: 'ACE Hardware', types: ['general'] }
  ]
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { latitude, longitude, trade_specialty, radius = 5 } = await req.json();

    if (!latitude || !longitude) {
      return Response.json({ error: 'Location coordinates required' }, { status: 400 });
    }

    // Get supply chains for the contractor's trade
    const tradeKey = trade_specialty?.toLowerCase() || 'general';
    const chains = TRADE_SUPPLY_CHAINS[tradeKey] || TRADE_SUPPLY_CHAINS['general'];

    // Generate mock supply houses based on trade
    const supplyHouses = chains.map((chain, idx) => ({
      name: chain.name,
      address: `Near ${idx + 1} location`,
      latitude: latitude + (Math.random() - 0.5) * 0.1,
      longitude: longitude + (Math.random() - 0.5) * 0.1,
      rating: 4 + Math.random(),
      types: chain.types,
      open_now: Math.random() > 0.3,
      distance_miles: Math.round((Math.random() * 4 + 0.5) * 10) / 10
    })).sort((a, b) => a.distance_miles - b.distance_miles);

    return Response.json({
      success: true,
      trade_specialty: tradeKey,
      location: { latitude, longitude },
      supplies_houses: supplyHouses,
      count: supplyHouses.length,
      note: 'For live Google Maps integration, add GOOGLE_PLACES_API_KEY secret'
    });
  } catch (error) {
    console.error('findNearbySupplyHouses error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});