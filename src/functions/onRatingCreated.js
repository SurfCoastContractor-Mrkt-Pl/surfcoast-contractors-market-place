import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
/* eslint-disable no-undef */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (!event || event.type !== 'create') {
      return Response.json({ error: 'Invalid event' }, { status: 400 });
    }

    // Log the rating activity
    await base44.asServiceRole.entities.ActivityLog.create({
      action_type: 'create',
      entity_type: 'rating',
      entity_id: event.entity_id,
      entity_name: data.location_name,
      user_id: data.rater_email,
      user_email: data.rater_email,
      description: `${data.rater_name} rated ${data.location_name} with ${data.overall_experience} stars`,
      severity: 'low',
      status: 'success',
    });

    // Send email notification to admin if rating is very negative
    if (data.overall_experience <= 2) {
      const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL');
      if (adminEmail) {
        await base44.integrations.Core.SendEmail({
          to: adminEmail,
          subject: `Low Rating Alert: ${data.location_name}`,
          body: `${data.rater_name} left a ${data.overall_experience}/5 star rating for ${data.location_name}.\n\nComments: ${data.comments || 'None'}`,
          from_name: 'SurfCoast Alerts',
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in onRatingCreated:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});