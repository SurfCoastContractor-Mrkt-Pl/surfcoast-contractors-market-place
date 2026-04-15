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

    // Look up by key_secret (the plaintext is stored for legacy lookup),
    // then verify the salted HMAC matches to prevent rainbow table attacks.
    const keys = await base44.entities.APIKey.filter({
      key_secret: apiKey,
      is_active: true,
    });

    if (!keys?.[0]) {
      return Response.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const record = keys[0];

    // Verify HMAC — key_hash is stored as "salt:hmac"
    let verified = false;
    if (record.key_hash?.includes(':')) {
      const [salt, storedHash] = record.key_hash.split(':');
      const computedHash = await hashApiKey(apiKey, salt);
      verified = computedHash === storedHash;
    } else {
      // Legacy unsalted hash — reject and prompt re-issue
      console.warn(`[apiGateway] Legacy unsalted key detected for key ID ${record.id} — rejecting`);
      return Response.json({ error: 'API key must be re-issued for security upgrade. Please generate a new key.' }, { status: 401 });
    }

    if (!verified) {
      return Response.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const apiKeyRecord = record;

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