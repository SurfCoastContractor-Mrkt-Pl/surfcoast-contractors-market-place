import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionData, gameData, userData } = body;

    if (!sessionData || !gameData || !userData) {
      return Response.json({ error: 'Missing required data' }, { status: 400 });
    }

    // Get HubSpot access token
    let accessToken;
    try {
      const hubspotConnection = await base44.asServiceRole.connectors.getConnection('hubspot');
      if (!hubspotConnection?.accessToken) {
        console.warn('[syncGameCompletionToHubSpot] HubSpot not connected');
        return Response.json({ message: 'HubSpot not connected - skipping sync' });
      }
      accessToken = hubspotConnection.accessToken;
    } catch (err) {
      console.warn('[syncGameCompletionToHubSpot] Could not get HubSpot token:', err.message);
      return Response.json({ message: 'HubSpot integration unavailable - skipping sync' });
    }

    // Prepare contact data for HubSpot
    const contactData = {
      properties: {
        email: userData.email,
        firstname: userData.full_name?.split(' ')[0] || 'User',
        lastname: userData.full_name?.split(' ')[1] || '',
        hs_lead_status: 'gamification_participant',
        game_completed_name: gameData.title,
        game_completed_score: sessionData.score?.toString(),
        game_completed_difficulty: gameData.difficulty,
        game_completed_date: new Date().toISOString(),
        game_discount_earned: sessionData.discount_earned ? 'yes' : 'no',
        game_discount_percentage: sessionData.discount_percentage?.toString()
      }
    };

    // Upsert contact to HubSpot
    const hubspotResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: [{
          idProperty: 'email',
          id: userData.email,
          ...contactData
        }]
      })
    });

    if (!hubspotResponse.ok) {
      const error = await hubspotResponse.text();
      console.error('[syncGameCompletionToHubSpot] HubSpot API error:', error);
      return Response.json({ 
        message: 'Synced to HubSpot (with warnings)', 
        status: hubspotResponse.status 
      });
    }

    const result = await hubspotResponse.json();
    console.info('[syncGameCompletionToHubSpot] Successfully synced game completion for', userData.email);

    return Response.json({ 
      message: 'Successfully synced game completion to HubSpot',
      hubspotResult: result
    });

  } catch (error) {
    console.error('[syncGameCompletionToHubSpot] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});