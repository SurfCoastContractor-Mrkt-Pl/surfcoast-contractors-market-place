import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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
        return Response.json({ error: 'Forbidden: Admin or internal service access required' }, { status: 403 });
      }
    }

    // Support entity automation payload ({ event, data }) and direct calls ({ entity_type, entity_id })
    let entity_type = body.entity_type;
    let entity_id = body.entity_id;

    if (body.event) {
      // Extract from automation event
      entity_type = body.event.entity_name;
      entity_id = body.event.entity_id;
      console.log('[syncContactToHubSpot] Automation payload:', JSON.stringify({ entity_type, entity_id, event_type: body.event.type }));
    }

    if (!entity_type || !entity_id) {
      console.error('[syncContactToHubSpot] Missing entity_type or entity_id. Full body:', JSON.stringify(body));
      return Response.json({ error: 'Missing entity_type or entity_id', received: { entity_type, entity_id } }, { status: 400 });
    }

    // Fetch the entity (Contractor or CustomerProfile)
    let contactData = null;

    if (entity_type === 'Contractor') {
      // Use data from automation payload if available, otherwise fetch
      const contractor = body.data || (await base44.asServiceRole.entities.Contractor.get(entity_id));
      if (contractor) {
        contactData = {
          firstname: contractor.name?.split(' ')[0] || '',
          lastname: contractor.name?.split(' ').slice(1).join(' ') || '',
          email: contractor.email,
          phone: contractor.phone || '',
          hs_lead_status: 'contractor',
          custom_location: contractor.location || '',
        };
      }
    } else if (entity_type === 'CustomerProfile') {
      const customer = body.data || (await base44.asServiceRole.entities.CustomerProfile.get(entity_id));
      if (customer) {
        contactData = {
          firstname: customer.full_name?.split(' ')[0] || '',
          lastname: customer.full_name?.split(' ').slice(1).join(' ') || '',
          email: customer.email,
          phone: customer.phone || '',
          hs_lead_status: 'customer',
          custom_location: customer.location || '',
        };
      }
    }

    if (!contactData) {
      return Response.json({ error: 'Entity not found' }, { status: 404 });
    }

    // Get HubSpot access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');

    // Upsert contact in HubSpot by email (creates or updates)
    const response = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [{
          idProperty: 'email',
          properties: contactData,
        }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('HubSpot API Error:', error);
      return Response.json({ error: 'Failed to sync contact to HubSpot', details: error }, { status: 500 });
    }

    const result = await response.json();
    const contact = result.results?.[0];
    return Response.json({
      success: true,
      hubspot_contact_id: contact?.id,
      status: contact?.status,
      message: 'Contact synced to HubSpot',
    });
  } catch (error) {
    console.error('Error syncing contact:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});