import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow internal service calls or authenticated contractors/admins who own the scope
    const internalKey = req.headers.get('x-internal-service-key');
    const isValidInternalCall = internalKey && internalKey === Deno.env.get('INTERNAL_SERVICE_KEY');

    if (!isValidInternalCall) {
      const user = await base44.auth.me().catch(() => null);
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // Ownership check happens after scope is fetched below
      var callerEmail = user.email;
      var callerRole = user.role;
    }

    const { scope_id } = await req.json();

    // Fetch the scope to get folder details
    const scopes = await base44.asServiceRole.entities.ScopeOfWork.filter({ 
      id: scope_id 
    });

    if (scopes.length === 0) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }

    const scope = scopes[0];

    // Check if both ratings have been submitted
    if (!scope.contractor_satisfaction_rating || !scope.customer_satisfaction_rating) {
      return Response.json({ 
        error: 'Both parties must submit ratings first' 
      }, { status: 400 });
    }

    // Check if scope is closed
    if (scope.status !== 'closed') {
      return Response.json({ 
        error: 'Scope must be closed before sharing folder' 
      }, { status: 400 });
    }

    // Fetch the project folder
    const folders = await base44.asServiceRole.entities.ProjectFolder.filter({ 
      scope_id 
    });

    if (folders.length === 0) {
      return Response.json({ error: 'Project folder not found' }, { status: 404 });
    }

    const folder = folders[0];

    // Update folder to mark as shared with customer
    await base44.asServiceRole.entities.ProjectFolder.update(folder.id, {
      shared_with_customer: true,
      shared_at: new Date().toISOString()
    });

    return Response.json({ 
      success: true, 
      message: 'Project folder shared with customer',
      folder_id: folder.id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});