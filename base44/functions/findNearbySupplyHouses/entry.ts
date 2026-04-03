import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Trade-specific Google Places search keywords
const TRADE_KEYWORDS = {
  electrician: 'electrical supply store',
  plumber: 'plumbing supply store',
  hvac: 'HVAC supply store',
  carpenter: 'lumber yard building supply',
  painter: 'paint supply store',
  roofer: 'roofing supply store',
  tiler: 'tile supply store',
  welder: 'welding supply store',
  mason: 'masonry supply store',
  landscaper: 'landscaping supply store',
  general: 'building supply store hardware store'
};

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function calculateDistanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { latitude, longitude, trade_specialty, radius = 10 } = await req.json();

    if (!latitude || !longitude) {
      return Response.json({ error: 'Location coordinates required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Google Maps API key not configured' }, { status: 500 });
    }

    const tradeKey = trade_specialty?.toLowerCase() || 'general';
    const keyword = TRADE_KEYWORDS[tradeKey] || TRADE_KEYWORDS['general'];

    // Convert radius from miles to meters for Google Places API
    const radiusMeters = Math.round(radius * 1609.34);

    // Google Places Nearby Search
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radiusMeters}&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`;

    const placesResponse = await fetch(placesUrl);
    const placesData = await placesResponse.json();

    if (placesData.status !== 'OK' && placesData.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', placesData.status, placesData.error_message);
      return Response.json({ error: `Places API error: ${placesData.status}` }, { status: 500 });
    }

    let results = placesData.results || [];

    // If we have a next_page_token, fetch more results (up to 3 pages = 60 results)
    let nextPageToken = placesData.next_page_token;
    let pageCount = 0;
    while (nextPageToken && pageCount < 2) {
      // Google requires a short delay before using next_page_token
      await new Promise(resolve => setTimeout(resolve, 2000));
      const nextUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${nextPageToken}&key=${apiKey}`;
      const nextResponse = await fetch(nextUrl);
      const nextData = await nextResponse.json();
      if (nextData.results) {
        results = results.concat(nextData.results);
      }
      nextPageToken = nextData.next_page_token;
      pageCount++;
    }

    // Map and calculate real distances
    const supplyHouses = results.map(place => {
      const placeLat = place.geometry?.location?.lat;
      const placeLng = place.geometry?.location?.lng;
      const distanceMiles = (placeLat && placeLng)
        ? calculateDistanceMiles(latitude, longitude, placeLat, placeLng)
        : null;

      return {
        name: place.name,
        address: place.vicinity || place.formatted_address || 'Address not available',
        latitude: placeLat,
        longitude: placeLng,
        rating: place.rating ? Math.round(place.rating * 10) / 10 : null,
        user_ratings_total: place.user_ratings_total || 0,
        open_now: place.opening_hours?.open_now ?? null,
        distance_miles: distanceMiles,
        place_id: place.place_id,
        types: place.types || []
      };
    });

    // Sort by distance
    supplyHouses.sort((a, b) => (a.distance_miles ?? 999) - (b.distance_miles ?? 999));

    return Response.json({
      success: true,
      trade_specialty: tradeKey,
      location: { latitude, longitude },
      supplies_houses: supplyHouses,
      count: supplyHouses.length,
      radius_miles: radius
    });

  } catch (error) {
    console.error('findNearbySupplyHouses error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});