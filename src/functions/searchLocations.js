import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query, locationType = 'swap_meet', limit = 20 } = await req.json();

    if (!query || query.length < 2) {
      return Response.json({ error: 'Search query required (min 2 chars)' }, { status: 400 });
    }

    const allRatings = await base44.entities.SwapMeetLocationRating.filter(
      { location_type: locationType },
      '-created_date',
      500
    );

    const searchTerm = query.toLowerCase();
    const locationMap = new Map();

    allRatings.forEach(rating => {
      if (
        rating.location_name.toLowerCase().includes(searchTerm) ||
        rating.city.toLowerCase().includes(searchTerm)
      ) {
        if (!locationMap.has(rating.location_name)) {
          locationMap.set(rating.location_name, {
            location_name: rating.location_name,
            city: rating.city,
            state: rating.state,
            match_score: 0,
          });
        }
      }
    });

    const results = Array.from(locationMap.values())
      .sort((a, b) => {
        const aExact = a.location_name.toLowerCase() === searchTerm ? 100 : 0;
        const bExact = b.location_name.toLowerCase() === searchTerm ? 100 : 0;
        return bExact - aExact;
      })
      .slice(0, limit);

    return Response.json({ results, total: results.length });
  } catch (error) {
    console.error('Error searching locations:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});