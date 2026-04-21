import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Validate internal service key OR authenticated user
    const internalKey = req.headers.get('x-internal-key');
    const validInternalKey = Deno.env.get('INTERNAL_SERVICE_KEY');
    if (!internalKey || internalKey !== validInternalKey) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await req.json();

    // Support both direct calls ({ activity_type, related_email, ... })
    // and automation entity event calls ({ event, data })
    let activity_type, related_email, activity_body, contractor_email;

    if (body.event) {
      // Called from entity automation (e.g. Review create/update)
      // body.data may be null if payload_too_large
      const { event, data } = body;
      if (!data) {
        return Response.json({ error: 'Review data not available in automation payload' }, { status: 400 });
      }
      activity_type = `review_${event.type || 'event'}`;
      // Review entity stores: reviewer_email (author), contractor_email (subject)
      related_email = data.reviewer_email || data.contractor_email || data.email || '';
      contractor_email = data.contractor_email || '';
      activity_body = `Review ${event.type || 'event'}: ${data.comment || ''} (Rating: ${data.overall_rating || data.rating || 'N/A'}) — Contractor: ${data.contractor_name || contractor_email || 'N/A'}`;
    } else {
      ({ activity_type, related_email, activity_body, contractor_email } = body);
    }

    if (!activity_type || !related_email) {
      return Response.json({ error: 'Missing activity_type or related_email' }, { status: 400 });
    }

    // Tier check only applies for direct (non-automation) calls
    if (!body.event) {
      const tierRecords = await base44.asServiceRole.entities.ContractorTier.filter({
        contractor_email: contractor_email,
      });
      const tierLevel = tierRecords?.[0]?.current_tier || 'bronze';
      if (tierLevel !== 'gold') {
        return Response.json({ error: 'Activity logging requires gold tier' }, { status: 403 });
      }
    }

    // Get HubSpot access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');

    // Find contact in HubSpot by email
    const contactResponse = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts?limit=1&property=email&filterGroups=%5B%7B%22filters%22:%5B%7B%22propertyName%22:%22email%22,%22operator%22:%22EQ%22,%22value%22:%22${encodeURIComponent(related_email)}%22%7D%5D%7D%5D`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    if (!contactResponse.ok) {
      return Response.json({ error: 'Contact not found in HubSpot' }, { status: 404 });
    }

    const contactResult = await contactResponse.json();
    if (!contactResult.results?.length) {
      return Response.json({ error: 'No matching contact found' }, { status: 404 });
    }

    const contactId = contactResult.results[0].id;

    // Create activity/note in HubSpot
    const activityBody = activity_body || `${activity_type} event logged`;

    const noteResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}/associations/notes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        associations: [
          {
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 13 }],
            id: contactId,
          },
        ],
      }),
    });

    // Create a note object
    const notePayload = {
      properties: {
        hs_note_body: activityBody,
        hs_note_type: activity_type,
      },
    };

    const createNoteResponse = await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notePayload),
    });

    if (!createNoteResponse.ok) {
      const error = await createNoteResponse.text();
      console.error('HubSpot API Error:', error);
      return Response.json({ error: 'Failed to log activity to HubSpot' }, { status: 500 });
    }

    const result = await createNoteResponse.json();
    return Response.json({
      success: true,
      hubspot_note_id: result.id,
      message: 'Activity logged to HubSpot',
    });
  } catch (error) {
    console.error('Error logging activity:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});