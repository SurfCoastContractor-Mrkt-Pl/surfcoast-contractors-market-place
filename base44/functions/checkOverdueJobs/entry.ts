import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * checkOverdueJobs
 * Runs daily. Finds all approved ScopeOfWork records where expected_completion_date
 * has passed and the job is not closed. Locks both the contractor and client accounts.
 * Also detects billing-cycle-ended locked accounts and initiates deletion.
 */
Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);

    // Allow internal service key OR admin
    const serviceKey = req.headers.get('x-service-key');
    const expectedKey = Deno.env.get('INTERNAL_SERVICE_KEY');
    if (!serviceKey || serviceKey !== expectedKey) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const now = new Date();
    let overdueLockedCount = 0;
    let billingEndDeletionCount = 0;

    // ── STEP 1: Find overdue approved/active scopes ───────────────────────────
    const activeScopes = await base44.asServiceRole.entities.ScopeOfWork.filter({
      status: 'approved',
    });

    for (const scope of activeScopes || []) {
      if (!scope.expected_completion_date) continue;

      const completionDeadline = new Date(scope.expected_completion_date);
      if (now <= completionDeadline) continue; // Not yet overdue

      // Job is overdue — lock contractor
      if (scope.contractor_email) {
        const contractors = await base44.asServiceRole.entities.Contractor.filter({
          email: scope.contractor_email,
        });
        if (contractors?.length > 0) {
          const c = contractors[0];
          if (!c.account_locked_for_overdue_job) {
            await base44.asServiceRole.entities.Contractor.update(c.id, {
              account_locked_for_overdue_job: true,
              locked_scope_id: scope.id,
              is_on_active_job: true,
              availability_status: 'booked',
            });
            overdueLockedCount++;
            console.log(`[OVERDUE_LOCK] Contractor ${c.email} locked. Scope ${scope.id} overdue since ${scope.expected_completion_date}`);

            // Notify contractor via email
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: c.email,
              subject: '⚠️ Action Required: Overdue Job — Account Locked',
              body: `Hi ${c.name},\n\nYour account has been locked because the job "${scope.job_title}" passed its expected completion date without being closed out.\n\nTo unlock your account, please complete the job closeout including signatures and payment through the platform.\n\nIf this job was paid off-platform, your account will be permanently deleted once your billing cycle ends.\n\nPlease log in and close out the job immediately.\n\n— SurfCoast Team`,
            });
          }
        }
      }

      // Lock client
      if (scope.client_email) {
        const clients = await base44.asServiceRole.entities.CustomerProfile.filter({
          email: scope.client_email,
        });
        if (clients?.length > 0) {
          const client = clients[0];
          if (!client.account_locked_for_overdue_job) {
            await base44.asServiceRole.entities.CustomerProfile.update(client.id, {
              account_locked_for_overdue_job: true,
              locked_scope_id: scope.id,
            });
            console.log(`[OVERDUE_LOCK] Client ${client.email} locked. Scope ${scope.id} overdue.`);

            // Notify client via email
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: client.email,
              subject: '⚠️ Action Required: Job Closeout Overdue — Account Locked',
              body: `Hi ${client.full_name},\n\nYour account has been locked because the job "${scope.job_title}" passed its expected completion date without being closed out.\n\nTo unlock your account, please complete the job closeout including signatures and payment through SurfCoast.\n\nPlease log in to take action.\n\n— SurfCoast Team`,
            });
          }
        }
      }
    }

    // ── STEP 2: Billing cycle ended — initiate deletion process ──────────────
    // Find contractors locked for overdue job AND marked for deletion (billing_deletion_pending)
    const deletionPendingContractors = await base44.asServiceRole.entities.Contractor.filter({
      account_locked_for_overdue_job: true,
      billing_deletion_pending: true,
    });

    for (const c of deletionPendingContractors || []) {
      if (!c.billing_cycle_end_date) continue;
      const billingEnd = new Date(c.billing_cycle_end_date);
      if (now < billingEnd) continue;

      // Billing cycle has ended — remove card details and flag for deletion
      await base44.asServiceRole.entities.Contractor.update(c.id, {
        stripe_connected_account_id: null,
        stripe_account_setup_complete: false,
        stripe_account_charges_enabled: false,
        account_deletion_initiated: true,
        account_deletion_initiated_at: now.toISOString(),
        availability_status: 'booked',
      });

      billingEndDeletionCount++;
      console.log(`[BILLING_DELETION] Contractor ${c.email} billing cycle ended. Card removed. Deletion initiated.`);

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: c.email,
        subject: '🚨 Account Deletion Initiated — Billing Cycle Ended',
        body: `Hi ${c.name},\n\nYour billing cycle has ended and your overdue job was never closed out on SurfCoast.\n\nYour payment details have been removed and your account is now queued for permanent deletion.\n\nIf you believe this is an error, contact support immediately at support@surfcoast.com.\n\n— SurfCoast Team`,
      });

      // Notify admin
      const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL');
      if (adminEmail) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: adminEmail,
          subject: `[ADMIN] Account Deletion Initiated: ${c.name}`,
          body: `Contractor account deletion initiated.\n\nName: ${c.name}\nEmail: ${c.email}\nLocked Scope ID: ${c.locked_scope_id}\nBilling Cycle End: ${c.billing_cycle_end_date}\nDeletion initiated at: ${now.toISOString()}`,
        });
      }
    }

    return Response.json({
      success: true,
      overdue_locked: overdueLockedCount,
      billing_deletion_initiated: billingEndDeletionCount,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[CHECK_OVERDUE_JOBS_ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});