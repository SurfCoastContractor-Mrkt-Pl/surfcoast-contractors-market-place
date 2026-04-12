import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
/* eslint-disable no-undef */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { locationName, locationType } = await req.json();

    if (!locationName) {
      return Response.json({ error: 'Location name required' }, { status: 400 });
    }

    const ratings = await base44.entities.SwapMeetLocationRating.filter({
      location_name: locationName,
      location_type: locationType || 'swap_meet'
    });

    if (!ratings.length) {
      return Response.json({ error: 'No ratings found' }, { status: 404 });
    }

    const stats = {
      location_name: locationName,
      total_ratings: ratings.length,
      cleanliness: (ratings.reduce((s, r) => s + r.cleanliness, 0) / ratings.length).toFixed(1),
      environment_comfort: (ratings.reduce((s, r) => s + r.environment_comfort, 0) / ratings.length).toFixed(1),
      customer_purchase_rate: (ratings.reduce((s, r) => s + r.customer_purchase_rate, 0) / ratings.length).toFixed(1),
      safety_security: (ratings.reduce((s, r) => s + r.safety_security, 0) / ratings.length).toFixed(1),
      foot_traffic: (ratings.reduce((s, r) => s + r.foot_traffic, 0) / ratings.length).toFixed(1),
      space_layout: (ratings.reduce((s, r) => s + r.space_layout, 0) / ratings.length).toFixed(1),
      overall_experience: (ratings.reduce((s, r) => s + r.overall_experience, 0) / ratings.length).toFixed(1),
    };

    return Response.json(stats);
  } catch (error) {
    console.error('Error calculating location stats:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});