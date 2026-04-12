import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
/* eslint-disable no-undef */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { client_email, client_name } = await req.json();

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate unique token
    const token = crypto.randomUUID();

    // Create portal access record
    const access = await base44.entities.ClientPortalAccess.create({
      contractor_id: user.id,
      contractor_email: user.email,
      client_email,
      client_name,
      access_token: token,
      created_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      portal_url: `${Deno.env.get('APP_URL')}/client-portal/${token}`,
      access_id: access.id
    });
  } catch (error) {
    console.error('Error generating portal token:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});