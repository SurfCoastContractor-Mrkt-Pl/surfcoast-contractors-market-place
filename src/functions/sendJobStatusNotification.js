import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
/* eslint-disable no-undef */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { scope_id, status, recipient_email, message } = await req.json();

    if (!scope_id || !recipient_email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const scope = await base44.entities.ScopeOfWork.list('-created_date', 1);
    const currentScope = scope.find(s => s.id === scope_id);

    if (!currentScope) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }

    const statusLabels = {
      pending_approval: 'Pending Your Approval',
      approved: 'Approved',
      rejected: 'Requires Revision',
      pending_ratings: 'Awaiting Ratings',
      closed: 'Completed',
    };

    const emailBody = `
Hello,

This is an automated notification about your project: ${currentScope.job_title}

**Status Update:** ${statusLabels[status] || status}

${message ? `**Message:** ${message}` : ''}

**Project Details:**
- Client: ${currentScope.client_name}
- Contractor: ${currentScope.contractor_name}
- Amount: $${currentScope.cost_amount?.toFixed(2) || 'TBD'}
- Work Date: ${currentScope.agreed_work_date || 'TBD'}

This is a transactional notification. Please do not reply to this email.

Best regards,
Wave FO
    `;

    await base44.integrations.Core.SendEmail({
      to: recipient_email,
      subject: `Job Update: ${currentScope.job_title} - ${statusLabels[status] || status}`,
      body: emailBody,
      from_name: 'Wave FO',
    });

    return Response.json({ success: true, message: 'Notification sent' });
  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});