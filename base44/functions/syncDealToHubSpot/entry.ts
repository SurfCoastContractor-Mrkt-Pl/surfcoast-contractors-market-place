import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Support entity automations or authenticated user calls
    const isAutomation = !!body?.event;
    if (!isAutomation) {
      const user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    let entity_type = body.entity_type;
    let entity_id = body.entity_id;
    let contractor_email = body.contractor_email;

    if (body.event) {
      // Extract from automation event
      entity_type = body.event.entity_name;
      entity_id = body.event.entity_id;
      // For automations, contractor_email comes from the data if available
      if (body.data?.contractor_email) {
        contractor_email = body.data.contractor_email;
      }
    }

    if (!entity_type || !entity_id) {
      return Response.json({ error: 'Missing entity_type or entity_id' }, { status: 400 });
    }

    const user = isAutomation ? null : await base44.auth.me();

    // Check if contractor has access to Deal Syncing (silver or gold tier) — skip for automations
    if (!isAutomation) {
      const tierRecords = await base44.asServiceRole.entities.ContractorTier.filter({
        contractor_email: contractor_email || user.email,
      });

      const tierLevel = tierRecords?.[0]?.current_tier || 'bronze';
      const hasDealSyncAccess = ['silver', 'gold'].includes(tierLevel);

      if (!hasDealSyncAccess) {
        return Response.json({ error: 'Deal syncing requires silver or gold tier' }, { status: 403 });
      }
    }

    // Fetch the entity (Job or QuoteRequest)
    let dealData = null;
    let contactEmail = null;

    if (entity_type === 'Job') {
      const jobs = await base44.entities.Job.filter({ id: entity_id });
      if (jobs?.length) {
        const job = jobs[0];
        contactEmail = job.poster_email;
        dealData = {
          dealname: job.title,
          amount: ((job.budget_min || 0) + (job.budget_max || 0)) / 2,
          dealstage: 'qualifiedtobuy',
          custom_job_description: job.description,
          custom_location: job.location,
          custom_budget_min: job.budget_min,
          custom_budget_max: job.budget_max,
          custom_urgency: job.urgency,
        };
      }
    } else if (entity_type === 'QuoteRequest') {
      const quotes = await base44.asServiceRole.entities.QuoteRequest.filter({ id: entity_id });
      if (quotes?.length) {
        const quote = quotes[0];
        contactEmail = quote.customer_email;
        dealData = {
          dealname: quote.job_title,
          amount: quote.contractor_estimate || 0,
          dealstage: 'negotiation/review',
          custom_quote_description: quote.work_description,
          custom_contractor_estimate: quote.contractor_estimate,
          custom_quote_status: quote.status,
        };
      }
    }

    if (!dealData || !contactEmail) {
      return Response.json({ error: 'Entity or contact email not found' }, { status: 404 });
    }

    // Get HubSpot access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');

    // First, find the associated contact in HubSpot by email
    const contactResponse = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts?limit=1&after=0&property=email&filterGroups=%5B%7B%22filters%22:%5B%7B%22propertyName%22:%22email%22,%22operator%22:%22EQ%22,%22value%22:%22${encodeURIComponent(contactEmail)}%22%7D%5D%7D%5D`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    let contactId = null;
    if (contactResponse.ok) {
      const contactResult = await contactResponse.json();
      if (contactResult.results?.length) {
        contactId = contactResult.results[0].id;
      }
    }

    // Create deal in HubSpot
    const dealPayload = {
      properties: dealData,
    };

    if (contactId) {
      dealPayload.associations = [
        {
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
          id: contactId,
        },
      ];
    }

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
      return Response.json({ error: 'Failed to sync deal to HubSpot' }, { status: 500 });
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