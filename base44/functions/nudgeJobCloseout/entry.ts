/**
 * nudgeJobCloseout — scheduled daily to find approved scopes past their work date
 * and send nudge emails + in-app notifications to both sides to complete closeout.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Scheduled function — allow internal service key or admin only
    const internalKey = req.headers.get('x-internal-key');
    const validInternalKey = Deno.env.get('INTERNAL_SERVICE_KEY');
    if (!internalKey || internalKey !== validInternalKey) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    // Get all approved scopes that have a past agreed_work_date
    const scopes = await base44.asServiceRole.entities.ScopeOfWork.list().catch(() => []);
    const now = new Date();

    const overdueScopes = (scopes || []).filter(s => {
      if (s.status !== 'approved') return false;
      if (!s.agreed_work_date) return false;
      const workDate = new Date(s.agreed_work_date);
      const daysPast = (now - workDate) / (1000 * 60 * 60 * 24);
      // Nudge after 1 day past work date, but not more than 14 days (avoid spam)
      return daysPast >= 1 && daysPast <= 14;
    });

    console.log(`[nudgeJobCloseout] Found ${overdueScopes.length} overdue scopes to nudge`);

    const appUrl = Deno.env.get('APP_URL') || 'https://surfcoastcmp.com';

    let nudgedCount = 0;

    for (const scope of overdueScopes) {
      try {
        const workDate = new Date(scope.agreed_work_date).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric'
        });

        // Email contractor
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: scope.contractor_email,
          subject: `Reminder: Close Out "${scope.job_title}"`,
          body: `Hi ${scope.contractor_name},\n\nYour work date for "${scope.job_title}" was ${workDate}. Please log in and complete the job closeout — upload after photos and confirm completion.\n\nClose out here: ${appUrl}/FieldOps\n\nThank you,\nSurfCoast Marketplace`,
        });

        // Email client
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: scope.client_email,
          subject: `Reminder: Confirm Completion for "${scope.job_title}"`,
          body: `Hi ${scope.client_name},\n\nThe agreed work date for "${scope.job_title}" was ${workDate}. Once the job is complete, please log in to confirm and leave a review for ${scope.contractor_name}.\n\nConfirm here: ${appUrl}/customer-portal\n\nThank you,\nSurfCoast Marketplace`,
        });

        // In-app notification for contractor
        await base44.asServiceRole.entities.Notification.create({
          user_email: scope.contractor_email,
          title: 'Job Closeout Needed',
          description: `"${scope.job_title}" passed its work date. Upload after photos and close out.`,
          action_url: `${appUrl}/FieldOps`,
          read: false,
          category: 'closeout',
        });

        // In-app notification for client
        await base44.asServiceRole.entities.Notification.create({
          user_email: scope.client_email,
          title: 'Please Confirm Job Completion',
          description: `"${scope.job_title}" passed its work date. Confirm and leave a review.`,
          action_url: `${appUrl}/customer-portal`,
          read: false,
          category: 'closeout',
        });

        nudgedCount++;
      } catch (err) {
        console.error(`[nudgeJobCloseout] Failed for scope ${scope.id}:`, err.message);
      }
    }

    return Response.json({ success: true, nudged: nudgedCount });
  } catch (error) {
    console.error('[nudgeJobCloseout] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});