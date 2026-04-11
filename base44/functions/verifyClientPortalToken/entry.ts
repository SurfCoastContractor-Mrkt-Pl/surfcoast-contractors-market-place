import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token } = await req.json();

    if (!token) {
      return Response.json({ error: 'Missing token' }, { status: 400 });
    }

    // Use service role to bypass RLS for token-based public access
    const portalAccess = await base44.asServiceRole.entities.ClientPortalAccess.filter({
      access_token: token,
      is_active: true
    });

    if (!portalAccess || portalAccess.length === 0) {
      return Response.json({ error: 'Invalid or expired portal access' }, { status: 404 });
    }

    const access = portalAccess[0];

    // Update last accessed timestamp
    await base44.asServiceRole.entities.ClientPortalAccess.update(access.id, {
      last_accessed_at: new Date().toISOString()
    });

    // Fetch all scopes for this client
    const scopes = await base44.asServiceRole.entities.ScopeOfWork.filter({
      client_email: access.client_email
    });

    return Response.json({
      success: true,
      access: {
        client_name: access.client_name,
        client_email: access.client_email,
        contractor_email: access.contractor_email,
      },
      scopes: scopes || []
    });
  } catch (error) {
    console.error('verifyClientPortalToken error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});