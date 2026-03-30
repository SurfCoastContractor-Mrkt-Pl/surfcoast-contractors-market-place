import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { locationName, locationType = 'swap_meet', limit = 50 } = await req.json();

    if (!locationName) {
      return Response.json({ error: 'Location name required' }, { status: 400 });
    }

    const history = await base44.entities.SwapMeetLocationRating.filter(
      { location_name: locationName, location_type: locationType },
      '-created_date',
      limit
    );

    return Response.json({
      location_name: locationName,
      total_ratings: history.length,
      ratings: history.map(r => ({
        id: r.id,
        rater_name: r.rater_name,
        overall_experience: r.overall_experience,
        comments: r.comments,
        created_date: r.created_date,
        cleanliness: r.cleanliness,
        safety_security: r.safety_security,
        foot_traffic: r.foot_traffic,
      }))
    });
  } catch (error) {
    console.error('Error fetching location history:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});