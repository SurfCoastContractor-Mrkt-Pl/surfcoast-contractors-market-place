import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { locationType = 'swap_meet', limit = 10 } = await req.json();

    const ratings = await base44.entities.SwapMeetLocationRating.filter(
      { location_type: locationType },
      '-created_date',
      500
    );

    if (!ratings.length) {
      return Response.json({ locations: [] });
    }

    const locationMap = new Map();
    ratings.forEach(rating => {
      if (!locationMap.has(rating.location_name)) {
        locationMap.set(rating.location_name, []);
      }
      locationMap.get(rating.location_name).push(rating);
    });

    const topLocations = Array.from(locationMap.entries())
      .map(([name, ratingsList]) => ({
        location_name: name,
        city: ratingsList[0].city,
        state: ratingsList[0].state,
        total_ratings: ratingsList.length,
        overall_experience: (
          ratingsList.reduce((s, r) => s + r.overall_experience, 0) / ratingsList.length
        ).toFixed(1),
      }))
      .sort((a, b) => parseFloat(b.overall_experience) - parseFloat(a.overall_experience))
      .slice(0, limit);

    return Response.json({ locations: topLocations });
  } catch (error) {
    console.error('Error getting top locations:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});