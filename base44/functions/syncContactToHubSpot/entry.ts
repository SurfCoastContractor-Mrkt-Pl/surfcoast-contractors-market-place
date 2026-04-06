import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Support entity automation payload ({ event, data }) and direct calls ({ entity_type, entity_id })
    let entity_type = body.entity_type;
    let entity_id = body.entity_id;

    if (!entity_type && body.event?.entity_name) {
      entity_type = body.event.entity_name;
      entity_id = body.event.entity_id;
    }

    if (!entity_type || !entity_id) {
      return Response.json({ error: 'Missing entity_type or entity_id' }, { status: 400 });
    }

    // Fetch the entity (Contractor or CustomerProfile)
    let contactData = null;

    if (entity_type === 'Contractor') {
      const contractors = await base44.asServiceRole.entities.Contractor.filter({ id: entity_id });
      if (contractors?.length) {
        const contractor = contractors[0];
        contactData = {
          firstname: contractor.name?.split(' ')[0] || '',
          lastname: contractor.name?.split(' ').slice(1).join(' ') || '',
          email: contractor.email,
          phone: contractor.phone,
          hs_lead_status: 'contractor',
          custom_contractor_type: contractor.contractor_type,
          custom_location: contractor.location,
          custom_years_experience: contractor.years_experience,
        };
      }
    } else if (entity_type === 'CustomerProfile') {
      const customers = await base44.asServiceRole.entities.CustomerProfile.filter({ id: entity_id });
      if (customers?.length) {
        const customer = customers[0];
        contactData = {
          firstname: customer.full_name?.split(' ')[0] || '',
          lastname: customer.full_name?.split(' ').slice(1).join(' ') || '',
          email: customer.email,
          phone: customer.phone,
          hs_lead_status: 'customer',
          custom_property_type: customer.property_type,
          custom_location: customer.location,
        };
      }
    }

    if (!contactData) {
      return Response.json({ error: 'Entity not found' }, { status: 404 });
    }

    // Get HubSpot access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');

    // Create or update contact in HubSpot
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: contactData,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('HubSpot API Error:', error);
      return Response.json({ error: 'Failed to sync contact to HubSpot' }, { status: 500 });
    }

    const result = await response.json();
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