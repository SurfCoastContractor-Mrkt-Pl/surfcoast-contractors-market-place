import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled automations (service-role context) OR authenticated admin users only
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (isAuthenticated) {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    } else {
      // Unauthenticated calls must come from an internal automation context
      // Verify via a shared secret header to prevent open invocation
      const internalKey = req.headers.get('x-internal-key');
      const expectedKey = Deno.env.get('INTERNAL_AUTOMATION_KEY');
      if (expectedKey && internalKey !== expectedKey) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // This runs as a scheduled job, use service role
    const scopes = await base44.asServiceRole.entities.ScopeOfWork.list();

    const now = new Date();
    let locked = 0;
    let unlocked = 0;

    // Build map of contractor IDs to fetch
    const contractorIds = [...new Set(scopes.filter(s => s.contractor_id).map(s => s.contractor_id))];
    const contractorMap = new Map();
    for (const id of contractorIds) {
      const contractors = await base44.asServiceRole.entities.Contractor.filter({ id });
      if (contractors.length > 0) {
        contractorMap.set(id, contractors[0]);
      }
    }

    for (const scope of scopes) {
      if (!scope.agreed_work_date || !scope.contractor_id) continue;

      const deadline = new Date(new Date(scope.agreed_work_date).getTime() + 72 * 60 * 60 * 1000);
      const photosCount = (scope.after_photo_urls || []).length;
      const pastDeadline = now > deadline;
      const hasEnoughPhotos = photosCount >= 5;

      const contractor = contractorMap.get(scope.contractor_id);
      if (!contractor) continue;

      if (pastDeadline && !hasEnoughPhotos) {
        // Lock if not already locked
        if (!contractor.account_locked) {
          await base44.asServiceRole.entities.Contractor.update(contractor.id, {
            account_locked: true,
            locked_scope_id: scope.id,
          });

          // Notify contractor
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: contractor.email,
            from_name: 'SurfCoast Contractor Market Place',
            subject: '⚠️ Account Locked — After Photos Required | SurfCoast',
            body: `Dear ${contractor.name},\n\nYour SurfCoast account has been temporarily locked because after photos were not uploaded within 72 hours of the agreed work date for job: "${scope.job_title}".\n\nTo restore full access, you must upload a minimum of 5 after photos for this job.\n\nLog in to your Contractor Account on SurfCoast and upload the required after photos to unlock your account immediately.\n\nSurfCoast Contractor Market Place`,
          });

          locked++;
        }
      } else if (hasEnoughPhotos && contractor.account_locked && contractor.locked_scope_id === scope.id) {
        // Unlock if photos are now sufficient
        await base44.asServiceRole.entities.Contractor.update(contractor.id, {
          account_locked: false,
          locked_scope_id: null,
        });
        unlocked++;
      }
    }

    return Response.json({ success: true, locked, unlocked, checked: scopes.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});