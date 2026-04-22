import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Allow entity automations, INTERNAL_SERVICE_KEY, or admin users
    const isAutomation = !!body?.event;
    const serviceKey = req.headers.get('x-internal-key');
    const validServiceKey = serviceKey && serviceKey === Deno.env.get('INTERNAL_SERVICE_KEY');
    if (!isAutomation && !validServiceKey) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    let entity_type = body.entity_type;
    let entity_id = body.entity_id;

    if (body.event) {
      entity_type = body.event.entity_name;
      entity_id = body.event.entity_id;
      console.log('[syncDealToHubSpot] Automation payload:', JSON.stringify({ entity_type, entity_id, event_type: body.event.type }));
    }

    if (!entity_type || !entity_id) {
      console.error('[syncDealToHubSpot] Missing entity_type or entity_id. Full body:', JSON.stringify(body));
      return Response.json({ error: 'Missing entity_type or entity_id', received: { entity_type, entity_id } }, { status: 400 });
    }

    // Fetch the entity using service role (no user session in automations)
    let dealData = null;
    let contactEmail = null;

    if (entity_type === 'Job') {
      const job = body.data || (await base44.asServiceRole.entities.Job.get(entity_id));
      if (job) {
        contactEmail = job.poster_email;
        dealData = {
          dealname: job.title || 'Untitled Job',
          amount: ((job.budget_min || 0) + (job.budget_max || 0)) / 2,
          dealstage: 'qualifiedtobuy',
          description: job.description || '',
        };
      }
    } else if (entity_type === 'QuoteRequest') {
      const quote = body.data || (await base44.asServiceRole.entities.QuoteRequest.get(entity_id));
      if (quote) {
        contactEmail = quote.client_email || quote.customer_email;
        dealData = {
          dealname: quote.job_title || 'Untitled Quote',
          amount: quote.contractor_estimate || 0,
          dealstage: 'presentationscheduled',
          description: quote.work_description || '',
        };
      }
    }

    if (!dealData) {
      return Response.json({ error: 'Entity not found or unsupported entity type' }, { status: 404 });
    }

    // Get HubSpot access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');

    // Try to find associated HubSpot contact by email
    let contactId = null;
    if (contactEmail) {
      const contactResponse = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(contactEmail)}?idProperty=email`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      if (contactResponse.ok) {
        const contact = await contactResponse.json();
        contactId = contact.id;
      }
    }

    // Build deal payload
    const dealPayload = { properties: dealData };
    if (contactId) {
      dealPayload.associations = [{
        to: { id: contactId },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
      }];
    }

    // Create deal in HubSpot
    const dealResponse = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dealPayload),
    });

    if (!dealResponse.ok) {
      const error = await dealResponse.text();
      console.error('HubSpot API Error:', error);
      return Response.json({ error: 'Failed to sync deal to HubSpot', details: error }, { status: 500 });
    }

    const result = await dealResponse.json();
    return Response.json({
      success: true,
      hubspot_deal_id: result.id,
      message: 'Deal synced to HubSpot',
    });
  } catch (error) {
    console.error('Error syncing deal:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});