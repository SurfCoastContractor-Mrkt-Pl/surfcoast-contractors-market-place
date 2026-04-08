import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * autoUnlockOnJobClose
 * Entity automation triggered when a ScopeOfWork record is updated.
 * If the scope status changes to 'closed', automatically unlock both
 * the contractor and client accounts that were locked for the overdue job.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { data, event } = body;

    // Only act when scope is closed
    if (data?.status !== 'closed') {
      return Response.json({ skipped: true, reason: 'Status is not closed' });
    }

    const scopeId = event?.entity_id;
    const contractorEmail = data?.contractor_email;
    const clientEmail = data?.client_email;

    console.log(`[AUTO_UNLOCK] Scope ${scopeId} closed. Unlocking accounts.`);

    // Unlock contractor
    if (contractorEmail) {
      const contractors = await base44.asServiceRole.entities.Contractor.filter({ email: contractorEmail });
      if (contractors?.length > 0) {
        const c = contractors[0];
        // Only unlock if this scope is the one that caused the lock
        if (c.locked_scope_id === scopeId || c.account_locked_for_overdue_job) {
          await base44.asServiceRole.entities.Contractor.update(c.id, {
            account_locked_for_overdue_job: false,
            account_locked: false,
            locked_scope_id: null,
            is_on_active_job: false,
            billing_deletion_pending: false,
            account_deletion_initiated: false,
            availability_status: 'available',
          });
          console.log(`[AUTO_UNLOCK] Contractor ${contractorEmail} unlocked.`);

          await base44.asServiceRole.integrations.Core.SendEmail({
            to: contractorEmail,
            subject: '✅ Account Unlocked — Job Closed Out',
            body: `Hi ${c.name},\n\nGreat news — your account has been automatically unlocked because the job "${data?.job_title}" has been successfully closed out.\n\nYou are now free to accept new jobs and use all platform features.\n\n— SurfCoast Team`,
          });
        }
      }
    }

    // Unlock client
    if (clientEmail) {
      const clients = await base44.asServiceRole.entities.CustomerProfile.filter({ email: clientEmail });
      if (clients?.length > 0) {
        const client = clients[0];
        if (client.locked_scope_id === scopeId || client.account_locked_for_overdue_job) {
          await base44.asServiceRole.entities.CustomerProfile.update(client.id, {
            account_locked_for_overdue_job: false,
            locked_scope_id: null,
          });
          console.log(`[AUTO_UNLOCK] Client ${clientEmail} unlocked.`);

          await base44.asServiceRole.integrations.Core.SendEmail({
            to: clientEmail,
            subject: '✅ Account Unlocked — Job Closed Out',
            body: `Hi ${client.full_name},\n\nYour account has been automatically unlocked because the job "${data?.job_title}" has been successfully closed out.\n\nYou can now post new jobs and use all platform features.\n\n— SurfCoast Team`,
          });
        }
      }
    }

    return Response.json({ success: true, scope_id: scopeId });
  } catch (error) {
    console.error('[AUTO_UNLOCK_ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});