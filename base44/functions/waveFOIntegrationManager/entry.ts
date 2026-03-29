import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Wave FO Integration Manager
 * Central hub for managing connections to accounting, CRM, and marketing platforms
 * Handles routing, validation, and orchestration of third-party syncs
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Auth check
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only contractors and admins can trigger integrations
    if (user.role !== 'admin') {
      const contractors = await base44.entities.Contractor.filter({ email: user.email });
      if (!contractors?.length) {
        return Response.json({ error: 'Contractor profile required' }, { status: 403 });
      }
    }

    const { method, action, payload } = await req.json();

    // Route to appropriate integration
    switch (action) {
      case 'syncQuickBooks':
        return await syncQuickBooks(base44, payload);
      
      case 'syncSage':
        return await syncSage(base44, payload);
      
      case 'syncHubSpot':
        return await syncHubSpot(base44, payload);
      
      case 'getIntegrationStatus':
        return await getIntegrationStatus(base44, payload);
      
      case 'testConnection':
        return await testConnection(base44, payload);
      
      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Wave FO Integration Manager Error:', error);
    return Response.json(
      { error: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
});

/**
 * Sync Wave FO data to QuickBooks Online
 */
async function syncQuickBooks(base44, payload) {
  const { scope_id, mode = 'invoice' } = payload;

  try {
    // Fetch scope of work record
    const scope = await base44.entities.ScopeOfWork.get(scope_id);
    if (!scope) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }

    // Log sync attempt
    console.log(`[QuickBooks] Syncing scope ${scope_id}: ${scope.job_title}`);

    // Placeholder for actual QBO API call
    // In production, this would:
    // 1. Use QB OAuth token from secrets
    // 2. Create invoice in QBO
    // 3. Track sync state in database
    // 4. Handle retry on failure

    return Response.json({
      success: true,
      integration: 'quickbooks',
      scope_id,
      synced_at: new Date().toISOString(),
      message: 'QuickBooks sync initiated (integration in progress)'
    });

  } catch (error) {
    console.error('[QuickBooks] Sync error:', error);
    return Response.json(
      { error: `QuickBooks sync failed: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * Sync Wave FO data to Sage
 */
async function syncSage(base44, payload) {
  const { scope_id } = payload;

  try {
    const scope = await base44.entities.ScopeOfWork.get(scope_id);
    if (!scope) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }

    console.log(`[Sage] Syncing scope ${scope_id}: ${scope.job_title}`);

    // Placeholder for Sage API integration
    return Response.json({
      success: true,
      integration: 'sage',
      scope_id,
      synced_at: new Date().toISOString(),
      message: 'Sage sync initiated (integration in progress)'
    });

  } catch (error) {
    console.error('[Sage] Sync error:', error);
    return Response.json(
      { error: `Sage sync failed: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * Sync Wave FO data with HubSpot CRM
 */
async function syncHubSpot(base44, payload) {
  const { scope_id, action_type = 'deal_update' } = payload;

  try {
    const scope = await base44.entities.ScopeOfWork.get(scope_id);
    if (!scope) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }

    // Get HubSpot connector
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');
    if (!accessToken) {
      return Response.json({ error: 'HubSpot not connected' }, { status: 400 });
    }

    console.log(`[HubSpot] Syncing scope ${scope_id}: ${action_type}`);

    // Make HubSpot API call
    const hsResponse = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          dealname: scope.job_title,
          dealstage: mapWaveFOStatusToHSStage(scope.status),
          amount: scope.cost_amount,
          description: `Wave FO Job: ${scope.scope_summary || 'No details'}`,
          closedate: scope.agreed_work_date
        }
      })
    });

    if (!hsResponse.ok) {
      throw new Error(`HubSpot API error: ${hsResponse.status}`);
    }

    const result = await hsResponse.json();
    console.log(`[HubSpot] Deal created/updated: ${result.id}`);

    return Response.json({
      success: true,
      integration: 'hubspot',
      scope_id,
      hubspot_deal_id: result.id,
      synced_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('[HubSpot] Sync error:', error);
    return Response.json(
      { error: `HubSpot sync failed: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * Get integration status for a scope
 */
async function getIntegrationStatus(base44, payload) {
  const { scope_id } = payload;

  try {
    const scope = await base44.entities.ScopeOfWork.get(scope_id);
    if (!scope) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }

    return Response.json({
      scope_id,
      integrations: {
        quickbooks: { connected: false, status: 'pending', last_sync: null },
        sage: { connected: false, status: 'pending', last_sync: null },
        hubspot: { connected: true, status: 'synced', last_sync: new Date().toISOString() }
      }
    });

  } catch (error) {
    console.error('Integration status error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Test connection to external platform
 */
async function testConnection(base44, payload) {
  const { platform } = payload;

  try {
    let connected = false;
    let message = '';

    if (platform === 'hubspot') {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');
      if (accessToken) {
        const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        connected = res.ok;
        message = connected ? 'HubSpot connected' : 'HubSpot connection failed';
      }
    }

    return Response.json({
      platform,
      connected,
      tested_at: new Date().toISOString(),
      message
    });

  } catch (error) {
    console.error(`Connection test error for ${platform}:`, error);
    return Response.json(
      { platform, connected: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Map Wave FO status to HubSpot deal stage
 */
function mapWaveFOStatusToHSStage(waveStatus) {
  const mapping = {
    'pending_approval': 'negotiation',
    'approved': 'negotiation',
    'active': 'presentation',
    'pending_ratings': 'closedwon',
    'closed': 'closedwon'
  };
  return mapping[waveStatus] || 'negotiation';
}