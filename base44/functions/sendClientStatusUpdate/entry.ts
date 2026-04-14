import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { scope_id, new_status, notes } = await req.json();

    if (!scope_id || !new_status) {
      return Response.json({ error: 'scope_id and new_status are required' }, { status: 400 });
    }

    // Fetch scope details
    const scope = await base44.asServiceRole.entities.ScopeOfWork.get(scope_id);

    if (!scope) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }

    // Only the contractor on the scope or an admin can send status updates
    if (user.email !== scope.contractor_email && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Define status update messages
    const statusMessages = {
      'pending_approval': 'Your job proposal is pending approval',
      'approved': 'Your job has been approved! Work will start soon.',
      'cancelled': 'Your job has been cancelled',
      'pending_ratings': 'Your job is complete. Please rate your experience.',
      'closed': 'Your job is closed and complete.'
    };

    const statusTitle = statusMessages[new_status] || `Job status updated to ${new_status}`;

    // Send email to client
    const emailBody = `
Hello ${scope.client_name},

${statusTitle}

Job: ${scope.job_title}
Contractor: ${scope.contractor_name}
${notes ? `Notes: ${notes}` : ''}

Thank you for using SurfCoast!

Best regards,
SurfCoast Contractor Marketplace
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: scope.client_email,
      subject: `Job Update: ${scope.job_title}`,
      body: emailBody
    });

    // Also send to contractor for record
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: scope.contractor_email,
      subject: `Client Notified: ${scope.job_title}`,
      body: `You have notified the client about a status update for "${scope.job_title}".`
    });

    console.log(`Client update sent for scope: ${scope_id}, status: ${new_status}`);

    return Response.json({
      success: true,
      message: 'Client notification sent successfully'
    });

  } catch (error) {
    console.error('sendClientStatusUpdate error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});