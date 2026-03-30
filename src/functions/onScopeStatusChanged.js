import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event } = await req.json();

    if (event.type !== 'update' || event.entity_name !== 'ScopeOfWork') {
      return Response.json({ success: false });
    }

    const scope = await base44.entities.ScopeOfWork.list('-created_date', 1);
    const currentScope = scope.find(s => s.id === event.entity_id);

    if (!currentScope) {
      return Response.json({ success: false });
    }

    // Notify contractor on approval/rejection
    if (['approved', 'rejected'].includes(currentScope.status)) {
      await base44.functions.invoke('sendJobStatusNotification', {
        scope_id: currentScope.id,
        status: currentScope.status,
        recipient_email: currentScope.contractor_email,
        message: currentScope.client_notes || '',
      });
    }

    // Notify client on scope completion ready for approval
    if (currentScope.status === 'pending_approval') {
      await base44.functions.invoke('sendJobStatusNotification', {
        scope_id: currentScope.id,
        status: 'pending_approval',
        recipient_email: currentScope.client_email,
        message: 'Your contractor has submitted a scope of work for approval.',
      });
    }

    // Notify both parties when ratings are pending
    if (currentScope.status === 'pending_ratings') {
      await base44.functions.invoke('sendJobStatusNotification', {
        scope_id: currentScope.id,
        status: 'pending_ratings',
        recipient_email: currentScope.contractor_email,
        message: 'Please submit your rating to complete this project.',
      });

      await base44.functions.invoke('sendJobStatusNotification', {
        scope_id: currentScope.id,
        status: 'pending_ratings',
        recipient_email: currentScope.client_email,
        message: 'Please submit your rating to complete this project.',
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Automation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});