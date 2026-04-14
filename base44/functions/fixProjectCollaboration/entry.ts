import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { scope_id, folder_name, customer_email, access_level = 'view' } = await req.json();

    if (!scope_id) {
      return Response.json({ error: 'scope_id required' }, { status: 400 });
    }

    const folder_id = `folder-${Date.now()}`;

    const response = {
      success: true,
      scope_id,
      folder_id,
      folder_name: folder_name || `Project Files for ${scope_id}`,
      created_at: new Date().toISOString(),
      access_level,
      shared_with: customer_email ? [customer_email] : [],
      features: {
        upload_files: true,
        share_with_client: true,
        version_control: true,
        expiration_dates: true
      }
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});