/**
 * notifyScopeCreated — called after a new ScopeOfWork is created.
 * Sends a clear action-required email to the CLIENT and a Notification record
 * so they see it in the bell dropdown too.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow internal service key OR authenticated user (contractor or admin)
    const internalKey = req.headers.get('x-internal-key');
    const validInternalKey = Deno.env.get('INTERNAL_SERVICE_KEY');
    if (!internalKey || internalKey !== validInternalKey) {
      const user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: 'Authentication required' }, { status: 401 });
      }
    }

    const { scope_id } = await req.json();

    if (!scope_id) {
      return Response.json({ error: 'scope_id is required' }, { status: 400 });
    }

    const scope = await base44.asServiceRole.entities.ScopeOfWork.get(scope_id);
    if (!scope) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }

    const appUrl = Deno.env.get('APP_URL') || 'https://surfcoastcmp.com';
    const approvalLink = `${appUrl}/customer-portal`;

    const emailBody = `
Hi ${scope.client_name},

${scope.contractor_name} has submitted a Scope of Work and Estimate for your review.

📋 Job: ${scope.job_title}
💰 Cost: $${scope.cost_amount} (${scope.cost_type})
📅 Work Date: ${scope.agreed_work_date || 'To be confirmed'}

⚠️ ACTION REQUIRED — No work can begin until you approve this scope.

👉 Review and approve here: ${approvalLink}

If you have questions, use the project chat with ${scope.contractor_name}.

— SurfCoast Contractor Marketplace
    `.trim();

    // Email the client
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: scope.client_email,
      subject: `[Action Required] Review & Approve Scope for "${scope.job_title}"`,
      body: emailBody,
    });

    // Create an in-app Notification for the client
    await base44.asServiceRole.entities.Notification.create({
      user_email: scope.client_email,
      title: `Scope Awaiting Your Approval`,
      description: `${scope.contractor_name} submitted a scope for "${scope.job_title}" — tap to review.`,
      action_url: approvalLink,
      read: false,
      category: 'scope',
    });

    console.log(`[notifyScopeCreated] Notified client ${scope.client_email} for scope ${scope_id}`);

    return Response.json({ success: true });
  } catch (error) {
    console.error('[notifyScopeCreated] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});