import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { review_id, connectorId } = await req.json();
    if (!review_id || !connectorId) {
      return Response.json({ error: 'Missing review_id or connectorId' }, { status: 400 });
    }

    const reviews = await base44.entities.Review.filter({ id: review_id });
    const review = reviews?.[0];
    if (!review) return Response.json({ error: 'Review not found' }, { status: 404 });

    // Verify ownership (review creator)
    if (review.reviewer_email !== user.email) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const accessToken = await base44.asServiceRole.connectors.getCurrentAppUserAccessToken(connectorId);
    if (!accessToken) {
      return Response.json({ error: 'HubSpot not connected' }, { status: 400 });
    }

    const hubspotBaseUrl = 'https://api.hubapi.com';

    // Find contact and update with rating
    try {
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
                  propertyName: 'email',
                  operator: 'EQ',
                  value: review.reviewer_type === 'customer' ? review.contractor_id : review.customer_id
                }
              ]
            }
          ],
          limit: 1
        })
      });

      const searchData = await searchRes.json();
      if (searchData.results?.length > 0) {
        const contactId = searchData.results[0].id;

        // Update contact with rating
        await fetch(`${hubspotBaseUrl}/crm/v3/objects/contacts/${contactId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            properties: {
              hs_analytics_rating: review.overall_rating?.toString(),
              hs_custom_field_review_comment: review.comment || ''
            }
          })
        });
      }
    } catch (err) {
      console.error('HubSpot review sync failed:', err);
      return Response.json({ error: 'Failed to sync review' }, { status: 500 });
    }

    console.log(`Review ${review_id} synced to HubSpot`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('syncReviewToHubSpot error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});