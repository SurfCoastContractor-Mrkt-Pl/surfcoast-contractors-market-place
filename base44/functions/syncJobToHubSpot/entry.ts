import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { scope_id, connectorId } = await req.json();
    if (!scope_id || !connectorId) {
      return Response.json({ error: 'Missing scope_id or connectorId' }, { status: 400 });
    }

    // Fetch the scope/job
    const scopes = await base44.entities.ScopeOfWork.filter({ id: scope_id });
    const scope = scopes?.[0];
    if (!scope) return Response.json({ error: 'Scope not found' }, { status: 404 });

    // Verify ownership
    if (scope.contractor_email !== user.email) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get HubSpot access token from shared connector
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');
    if (!accessToken) {
      return Response.json({ error: 'HubSpot not connected' }, { status: 400 });
    }

    // Create or update contact for customer
    const hubspotBaseUrl = 'https://api.hubapi.com';
    let contactId;

    try {
      // Search for existing contact by email
      const searchRes = await fetch(`${hubspotBaseUrl}/crm/v3/objects/contacts/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'hs_lead_status',
                  operator: 'EQ',
                  value: scope.customer_email
                }
              ]
            }
          ],
          limit: 1
        })
      });

      const searchData = await searchRes.json();
      if (searchData.results?.length > 0) {
        contactId = searchData.results[0].id;
      } else {
        // Create new contact
        const createRes = await fetch(`${hubspotBaseUrl}/crm/v3/objects/contacts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            properties: {
              email: scope.customer_email,
              firstname: scope.customer_name?.split(' ')[0] || '',
              lastname: scope.customer_name?.split(' ').slice(1).join(' ') || ''
            }
          })
        });

        const createData = await createRes.json();
        contactId = createData.id;
      }
    } catch (err) {
      console.error('HubSpot contact sync failed:', err);
      return Response.json({ error: 'Failed to sync contact' }, { status: 500 });
    }

    // Create deal for the job
    try {
      const dealRes = await fetch(`${hubspotBaseUrl}/crm/v3/objects/deals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            dealname: scope.job_title,
            dealstage: scope.status === 'closed' ? 'closedwon' : 'negotiation',
            amount: scope.cost_amount?.toString(),
            closedate: scope.agreed_work_date ? new Date(scope.agreed_work_date).getTime().toString() : '',
            hs_custom_field_job_id: scope_id,
            description: scope.scope_summary || ''
          },
          associations: [
            {
              id: contactId,
              type: 'deal_to_contact'
            }
          ]
        })
      });

      if (!dealRes.ok) {
        throw new Error(`HubSpot API error: ${dealRes.status}`);
      }

      console.log(`Job ${scope_id} synced to HubSpot`);
      return Response.json({ success: true, contactId });
    } catch (err) {
      console.error('HubSpot deal sync failed:', err);
      return Response.json({ error: 'Failed to sync deal' }, { status: 500 });
    }
  } catch (error) {
    console.error('syncJobToHubSpot error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});