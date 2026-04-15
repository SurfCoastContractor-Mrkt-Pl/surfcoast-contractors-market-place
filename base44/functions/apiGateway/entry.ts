import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Recompute HMAC-SHA256(key, salt) and return as hex string
async function hashApiKey(keySecret, salt) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(keySecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(salt));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Missing API key' }, { status: 401 });
    }

    const apiKey = authHeader.substring(7);
    const base44 = createClientFromRequest(req);

    // Lookup candidates by key_prefix (first 8 chars) — no plaintext stored in DB
    const keyPrefix = apiKey.substring(0, 8);
    const keys = await base44.asServiceRole.entities.APIKey.filter({
      key_prefix: keyPrefix,
      is_active: true,
    });

    if (!keys?.length) {
      return Response.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // Among prefix-matched candidates, verify HMAC — key_hash stored as "salt:hmac"
    let record = null;
    for (const candidate of keys) {
      if (!candidate.key_hash?.includes(':')) {
        console.warn(`[apiGateway] Key ID ${candidate.id} has no salted hash — skipping (re-issue required)`);
        continue;
      }
      const [salt, storedHash] = candidate.key_hash.split(':');
      const computedHash = await hashApiKey(apiKey, salt);
      if (computedHash === storedHash) {
        record = candidate;
        break;
      }
    }

    if (!record) {
      return Response.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // Route request based on path
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === '/api/v1/jobs' && req.method === 'GET') {
      if (!record.scopes.includes('read:jobs')) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
      const jobs = await base44.asServiceRole.entities.Job.list();
      // Update last used (fire-and-forget)
      base44.asServiceRole.entities.APIKey.update(record.id, { last_used: new Date().toISOString() });
      return Response.json({ jobs });
    }

    if (path === '/api/v1/contractors' && req.method === 'GET') {
      if (!record.scopes.includes('read:contractors')) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
      const contractors = await base44.asServiceRole.entities.Contractor.list();
      // Update last used (fire-and-forget)
      base44.asServiceRole.entities.APIKey.update(record.id, { last_used: new Date().toISOString() });
      return Response.json({ contractors });
    }

    return Response.json({ error: 'Endpoint not found' }, { status: 404 });
  } catch (error) {
    console.error('API gateway error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});