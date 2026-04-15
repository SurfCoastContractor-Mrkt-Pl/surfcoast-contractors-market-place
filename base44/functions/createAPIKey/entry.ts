import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Compute HMAC-SHA256(key, salt) and return as hex string
async function hashApiKey(keySecret, salt) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(keySecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(salt));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate a cryptographically secure random hex string
function generateSecureKey(prefix = 'sk_live_') {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}${hex}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { keyName, scopes = [] } = await req.json();
    if (!keyName || scopes.length === 0) {
      return Response.json({ error: 'Key name and scopes required' }, { status: 400 });
    }

    // Generate cryptographically secure API key + per-key salt
    const keySecret = generateSecureKey();
    const salt = generateSecureKey('salt_');
    const keyHash = await hashApiKey(keySecret, salt);

    const apiKey = await base44.entities.APIKey.create({
      user_email: user.email,
      key_name: keyName,
      key_secret: keySecret,
      key_hash: `${salt}:${keyHash}`,  // store salt:hash together
      scopes,
      is_active: true,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return Response.json({
      success: true,
      message: 'Save this key securely. You will not see it again.',
      key: keySecret,
      id: apiKey.id,
    });
  } catch (error) {
    console.error('Create API key error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});