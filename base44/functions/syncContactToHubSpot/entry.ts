import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Allow only verified automation payloads, INTERNAL_SERVICE_KEY, or admin users
    const isValidAutomation = body?.event?.type && body?.event?.entity_name && body?.event?.entity_id;
    const serviceKey = req.headers.get('x-internal-key');
    const validServiceKey = serviceKey && serviceKey === Deno.env.get('INTERNAL_SERVICE_KEY');
    if (!isValidAutomation && !validServiceKey) {
      const user = await base44.auth.me().catch(() => null);
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
          city: contractor.location || '',
          jobtitle: 'Contractor',
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
          city: customer.location || '',
          jobtitle: 'Customer',
        };
      }
    }

    if (!contactData) {
      return Response.json({ error: 'Entity not found' }, { status: 404 });
    }

    // Get HubSpot access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');

    // Try to create contact; if it already exists (409), update it instead
    const createResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties: contactData }),
    });

    let result;
    if (createResponse.status === 409) {
      // Contact already exists — fetch their ID then patch
      const searchResponse = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(contactData.email)}?idProperty=email`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      if (!searchResponse.ok) {
        const err = await searchResponse.text();
        console.error('HubSpot lookup error:', err);
        return Response.json({ error: 'Failed to look up existing HubSpot contact', details: err }, { status: 500 });
      }
      const existing = await searchResponse.json();
      const patchResponse = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${existing.id}`,
        {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ properties: contactData }),
        }
      );
      if (!patchResponse.ok) {
        const err = await patchResponse.text();
        console.error('HubSpot patch error:', err);
        return Response.json({ error: 'Failed to update HubSpot contact', details: err }, { status: 500 });
      }
      result = await patchResponse.json();
    } else if (!createResponse.ok) {
      const err = await createResponse.text();
      console.error('HubSpot API Error:', err);
      return Response.json({ error: 'Failed to sync contact to HubSpot', details: err }, { status: 500 });
    } else {
      result = await createResponse.json();
    }

    return Response.json({
      success: true,
      hubspot_contact_id: result.id,
      message: 'Contact synced to HubSpot',
    });
  } catch (error) {
    console.error('Error syncing contact:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});