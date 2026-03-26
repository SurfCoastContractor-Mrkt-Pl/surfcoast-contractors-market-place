import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { address } = await req.json();

    if (!address || typeof address !== 'string') {
      return Response.json({ error: 'Address is required' }, { status: 400 });
    }

    // Use OpenStreetMap Nominatim API for geocoding (free, no API key needed)
    const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search');
    nominatimUrl.searchParams.set('q', address);
    nominatimUrl.searchParams.set('format', 'json');
    nominatimUrl.searchParams.set('limit', '1');

    const response = await fetch(nominatimUrl.toString(), {
      headers: {
        'User-Agent': 'SurfCoastFieldOps/1.0'
      }
    });

    if (!response.ok) {
      console.error('Nominatim API error:', response.status);
      return Response.json(
        { error: 'Failed to geocode address' },
        { status: 500 }
      );
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      return Response.json({
        success: false,
        message: 'Address not found. Please try a more specific address.'
      });
    }

    const result = results[0];
    return Response.json({
      success: true,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return Response.json(
      { error: error.message || 'Failed to geocode address' },
      { status: 500 }
    );
  }
});