import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

    // Generate API key
    const keySecret = `sk_live_${Math.random().toString(36).substr(2)}${Date.now()}`;
    const keyHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(keySecret)
    );

    const apiKey = await base44.entities.APIKey.create({
      user_email: user.email,
      key_name: keyName,
      key_secret: keySecret,
      key_hash: btoa(String.fromCharCode(...new Uint8Array(keyHash))),
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