import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { contactType, contactData, dealData } = await req.json();

    // Get HubSpot access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');

    if (contactType === 'contractor' && contactData) {
      // Sync contractor to HubSpot Contact
      const contactResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            firstname: contactData.name?.split(' ')[0] || '',
            lastname: contactData.name?.split(' ').slice(1).join(' ') || '',
            email: contactData.email,
            phone: contactData.phone,
            hs_lead_status: 'SUBSCRIBER',
            lifecyclestage: 'customer',
            notes: `Contractor: ${contactData.line_of_work}\nLocation: ${contactData.location}`,
            customObjects_contractor_type: contactData.contractor_type,
            customObjects_hourly_rate: contactData.hourly_rate?.toString() || '',
          },
        }),
      });

      if (!contactResponse.ok) {
        console.error('HubSpot contact sync failed:', await contactResponse.text());
        return Response.json({ error: 'Contact sync failed' }, { status: 400 });
      }

      const contact = await contactResponse.json();
      console.log('Contact synced to HubSpot:', contact.id);
    }

    if (dealData) {
      // Sync job/deal to HubSpot
      const dealResponse = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            dealname: dealData.title,
            dealstage: dealData.status || 'negotiation',
            amount: dealData.amount?.toString() || '0',
            closedate: dealData.closeDate || new Date().toISOString(),
            description: dealData.description || '',
            notes: dealData.notes || '',
          },
        }),
      });

      if (!dealResponse.ok) {
        console.error('HubSpot deal sync failed:', await dealResponse.text());
        return Response.json({ error: 'Deal sync failed' }, { status: 400 });
      }

      const deal = await dealResponse.json();
      console.log('Deal synced to HubSpot:', deal.id);
    }

    return Response.json({ success: true, message: 'Data synced to HubSpot' });
  } catch (error) {
    console.error('HubSpot sync error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});