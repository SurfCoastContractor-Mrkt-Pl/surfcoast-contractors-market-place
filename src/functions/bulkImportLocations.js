import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
/* eslint-disable no-undef */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { locations } = await req.json();

    if (!Array.isArray(locations) || locations.length === 0) {
      return Response.json({ error: 'Locations array required' }, { status: 400 });
    }

    const results = [];
    for (const loc of locations) {
      try {
        const created = await base44.entities.SwapMeetLocationRating.create({
          location_name: loc.location_name,
          city: loc.city,
          state: loc.state,
          location_type: loc.location_type || 'swap_meet',
          rater_email: user.email,
          rater_name: user.full_name || 'Admin',
          cleanliness: loc.cleanliness || 3,
          environment_comfort: loc.environment_comfort || 3,
          customer_purchase_rate: loc.customer_purchase_rate || 3,
          safety_security: loc.safety_security || 3,
          foot_traffic: loc.foot_traffic || 3,
          space_layout: loc.space_layout || 3,
          overall_experience: loc.overall_experience || 3,
          comments: loc.comments || 'Bulk import',
        });
        results.push({ status: 'success', location: loc.location_name, id: created.id });
      } catch (err) {
        results.push({ status: 'error', location: loc.location_name, error: err.message });
      }
    }

    return Response.json({ imported: results.length, results });
  } catch (error) {
    console.error('Error bulk importing locations:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});