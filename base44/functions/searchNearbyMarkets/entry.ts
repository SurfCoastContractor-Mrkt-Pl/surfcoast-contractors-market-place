import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: max 20 requests per hour per user
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    
    const rateLimitRecords = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key: user.email,
      limit_type: 'search_nearby_markets',
      created_date: { $gte: oneHourAgo.toISOString() }
    });
    
    if (rateLimitRecords?.length >= 20) {
      return Response.json({ error: 'Rate limit exceeded. Max 20 searches per hour.' }, { status: 429 });
    }
    
    await base44.asServiceRole.entities.RateLimitTracker.create({
      key: user.email,
      limit_type: 'search_nearby_markets',
      request_count: 1
    });

    const { location, radiusMiles = 15, marketType = 'all', thisWeekendOnly = false } = await req.json();

    if (!location) {
      return Response.json({ error: 'Location is required' }, { status: 400 });
    }

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!GOOGLE_API_KEY) {
      return Response.json({ error: 'Google Maps API key not configured' }, { status: 500 });
    }

    // Step 1: Geocode the location
    const geocodeRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_API_KEY}`
    );
    const geocodeData = await geocodeRes.json();

    if (!geocodeData.results || geocodeData.results.length === 0) {
      return Response.json({ error: 'Could not find location', results: [] });
    }

    const { lat, lng } = geocodeData.results[0].geometry.location;
    const radiusMeters = Math.round(radiusMiles * 1609.34);

    // Step 2: Build search queries based on market type
    const queries = [];
    if (marketType === 'all' || marketType === 'farmers_market') {
      queries.push('farmers market');
    }
    if (marketType === 'all' || marketType === 'swap_meet') {
      queries.push('swap meet');
    }
    if (marketType === 'all' || marketType === 'flea_market') {
      queries.push('flea market');
    }

    // Step 3: Search Google Places for each query
    const allResults = [];
    const seenPlaceIds = new Set();

    for (const query of queries) {
      const placesRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=${radiusMeters}&key=${GOOGLE_API_KEY}`
      );
      const placesData = await placesRes.json();

      if (placesData.results) {
        for (const place of placesData.results) {
          if (!seenPlaceIds.has(place.place_id)) {
            seenPlaceIds.add(place.place_id);

            // Determine market type from query
            let detectedType = 'farmers_market';
            if (query.includes('swap meet')) detectedType = 'swap_meet';
            else if (query.includes('flea market')) detectedType = 'flea_market';

            allResults.push({
              id: place.place_id,
              shop_name: place.name,
              city: extractCity(place.formatted_address),
              state: extractState(place.formatted_address),
              full_address: place.formatted_address,
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
              average_rating: place.rating || null,
              total_ratings: place.user_ratings_total || 0,
              shop_type: detectedType,
              is_google_result: true,
              google_place_id: place.place_id,
              business_status: place.business_status,
              is_active: true,
              description: place.types ? place.types.join(', ') : '',
            });
          }
        }
      }
    }

    return Response.json({
      results: allResults,
      center: { lat, lng },
      location_label: geocodeData.results[0].formatted_address,
    });

  } catch (error) {
    console.error('[searchNearbyMarkets] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function extractCity(address) {
  if (!address) return '';
  const parts = address.split(',');
  return parts.length >= 2 ? parts[parts.length - 3]?.trim() || parts[0].trim() : parts[0].trim();
}

function extractState(address) {
  if (!address) return '';
  const parts = address.split(',');
  const stateZip = parts[parts.length - 2]?.trim() || '';
  return stateZip.split(' ')[0] || '';
}