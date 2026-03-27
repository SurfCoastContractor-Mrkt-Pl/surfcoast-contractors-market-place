import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Trade-specific supply house search queries
const TRADE_SUPPLY_QUERIES = {
  electrician: ['electrical supply store', 'electrical distributor', 'industrial electric supplier'],
  plumber: ['plumbing supply', 'plumbing distributor', 'plumbing hardware store'],
  hvac: ['HVAC supply', 'HVAC distributor', 'heating and cooling supply'],
  carpenter: ['lumber yard', 'building materials', 'carpentry supply'],
  mason: ['masonry supply', 'stone supplier', 'brick supplier'],
  roofer: ['roofing supply', 'roofing materials', 'roofing distributor'],
  painter: ['paint supply', 'painting supplies store', 'contractor paint supplier'],
  welder: ['welding supply', 'welding equipment', 'industrial gas supplier'],
  tiler: ['tile supplier', 'flooring materials', 'ceramic tile distributor'],
  landscaper: ['landscaping supply', 'landscape materials', 'outdoor supply'],
  general: ['building materials', 'home depot', 'lowes', 'menards']
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

    // Get search queries for the contractor's trade
    const tradeKey = trade_specialty?.toLowerCase() || 'general';
    const searchQueries = TRADE_SUPPLY_QUERIES[tradeKey] || TRADE_SUPPLY_QUERIES['general'];
    const searchQuery = searchQueries[0]; // Use primary query

    // Use Google Places API (requires GOOGLE_PLACES_API_KEY secret)
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_PLACES_API_KEY not configured');
      return Response.json({ error: 'Supply house search not available' }, { status: 503 });
    }

    const radiusMeters = radius * 1609.34; // Convert miles to meters
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radiusMeters}&keyword=${encodeURIComponent(searchQuery)}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.warn('Places API error:', data.status, data.error_message);
      return Response.json({ 
        supplies_houses: [],
        error: 'Unable to find supply houses nearby'
      });
    }

    const supplyHouses = (data.results || []).map(place => ({
      name: place.name,
      address: place.vicinity,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      rating: place.rating || null,
      types: place.types || [],
      open_now: place.opening_hours?.open_now || null,
      distance_miles: calculateDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng)
    })).sort((a, b) => a.distance_miles - b.distance_miles);

    return Response.json({
      success: true,
      trade_specialty: tradeKey,
      location: { latitude, longitude },
      supplies_houses: supplyHouses,
      count: supplyHouses.length
    });
  } catch (error) {
    console.error('findNearbySupplyHouses error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal
}