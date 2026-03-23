import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scope_id, contractor_id, contractor_email, customer_email, customer_last_name, customer_first_name, job_title } = await req.json();

    // Create project folder
    const folder = await base44.entities.ProjectFolder.create({
      scope_id,
      contractor_id,
      contractor_email,
      customer_email,
      customer_last_name,
      customer_first_name,
      folder_name: `${customer_last_name}, ${customer_first_name}`,
      job_title,
      documents: [],
      created_at: new Date().toISOString()
    });

    return Response.json({ 
      success: true, 
      folder_id: folder.id,
      folder_name: folder.folder_name 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});