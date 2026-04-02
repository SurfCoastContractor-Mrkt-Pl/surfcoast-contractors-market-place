import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Missing API key' }, { status: 401 });
    }

    const apiKey = authHeader.substring(7);
    const base44 = createClientFromRequest(req);

    // Verify API key exists and is active
    const keyHash = btoa(String.fromCharCode(...new Uint8Array(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey))
    )));

    const keys = await base44.entities.APIKey.filter({
      key_hash: keyHash,
      is_active: true,
    });

    if (!keys?.[0]) {
      return Response.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const apiKeyRecord = keys[0];

    // Route request based on path
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === '/api/v1/jobs' && req.method === 'GET') {
      if (!apiKeyRecord.scopes.includes('read:jobs')) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
      const jobs = await base44.entities.Job.list();
      return Response.json({ jobs });
    }

    if (path === '/api/v1/contractors' && req.method === 'GET') {
      if (!apiKeyRecord.scopes.includes('read:contractors')) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
      const contractors = await base44.entities.Contractor.list();
      return Response.json({ contractors });
    }

    // Update last used
    await base44.entities.APIKey.update(apiKeyRecord.id, {
      last_used: new Date().toISOString(),
    });

    return Response.json({ error: 'Endpoint not found' }, { status: 404 });
  } catch (error) {
    console.error('API gateway error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});