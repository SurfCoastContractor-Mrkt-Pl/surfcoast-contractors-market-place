import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { folder_id, document_type, document_name, document_url } = await req.json();

    // Fetch folder with user permission verification
    const folder = await base44.entities.ProjectFolder.filter({ id: folder_id });
    if (folder.length === 0) {
      return Response.json({ error: 'Folder not found' }, { status: 404 });
    }

    const f = folder[0];

    // Verify user is the owner (contractor or customer) of the folder
    if (user.email !== f.contractor_email && user.email !== f.customer_email) {
      return Response.json({ error: 'Forbidden: You do not have permission to modify this folder' }, { status: 403 });
    }

    // Additionally verify the associated ScopeOfWork matches user permissions
    const scopes = await base44.entities.ScopeOfWork.filter({ id: f.scope_id });
    if (scopes.length > 0) {
      const scope = scopes[0];
      if (user.email !== scope.contractor_email && user.email !== scope.customer_email) {
        return Response.json({ error: 'Forbidden: No permission for this scope' }, { status: 403 });
      }
    }

    // Add document to folder
    const newDocument = {
      document_id: crypto.randomUUID(),
      document_type,
      document_name,
      document_url,
      added_at: new Date().toISOString()
    };

    const documents = f.documents || [];
    documents.push(newDocument);

    await base44.entities.ProjectFolder.update(folder_id, { documents });

    return Response.json({ 
      success: true, 
      document_id: newDocument.document_id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});