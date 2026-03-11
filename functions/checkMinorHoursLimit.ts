import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Runs on a schedule (e.g. every hour).
// For each minor contractor:
// 1. If minor_hours_locked=true and minor_hours_lock_until has passed → unlock
// 2. Accumulate hours from closed ScopeOfWork jobs completed within the current week
// 3. If total >= 20 hours → lock account, set unlock date 1 week from last closed job
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled automations (no auth) OR admin users only
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (isAuthenticated) {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }

    const minors = await base44.asServiceRole.entities.Contractor.filter({ is_minor: true });
    const now = new Date();
    let locked = 0;
    let unlocked = 0;

    // Early exit — no minors to process
    if (!minors || minors.length === 0) {
      return Response.json({ success: true, minors_checked: 0, locked, unlocked });
    }

    // Fetch ALL closed scopes for minor contractors in one batch (avoids N+1 DB calls)
    const minorIds = new Set(minors.map(c => c.id));
    const allClosedScopes = await base44.asServiceRole.entities.ScopeOfWork.filter({ status: 'closed' });
    // Build a map: contractor_id → list of their closed scopes
    const scopesByContractor = new Map();
    for (const scope of allClosedScopes) {
      if (scope.contractor_id && minorIds.has(scope.contractor_id)) {
        if (!scopesByContractor.has(scope.contractor_id)) {
          scopesByContractor.set(scope.contractor_id, []);
        }
        scopesByContractor.get(scope.contractor_id).push(scope);
      }
    }

    for (const contractor of minors) {
      // --- Auto-unlock if lock period has elapsed ---
      if (contractor.minor_hours_locked && contractor.minor_hours_lock_until) {
        const lockUntil = new Date(contractor.minor_hours_lock_until);
        if (now >= lockUntil) {
          await base44.asServiceRole.entities.Contractor.update(contractor.id, {
            minor_hours_locked: false,
            minor_hours_lock_until: null,
            minor_weekly_hours_used: 0,
            minor_weekly_hours_reset_date: now.toISOString(),
          });
          // Fire emails in parallel
          const emailPromises = [
            base44.asServiceRole.integrations.Core.SendEmail({
              to: contractor.email,
              subject: '✅ Your Account Has Been Unlocked | SurfCoast Contractors',
              body: `Hi ${contractor.name},\n\nYour account has been automatically unlocked. A full week has passed since your last completed job. You may now accept new work up to your 20-hour weekly limit.\n\nRemember: Your parent or guardian must oversee all work activities and safety decisions.\n\nSurfCoast Contractor Market Place`,
            }),
          ];
          if (contractor.parental_consent_docs?.parent_email) {
            emailPromises.push(base44.asServiceRole.integrations.Core.SendEmail({
              to: contractor.parental_consent_docs.parent_email,
              subject: `✅ ${contractor.name}'s Contractor Account Unlocked | SurfCoast`,
              body: `Dear ${contractor.parental_consent_docs.parent_name || 'Parent/Guardian'},\n\nThis is to notify you that ${contractor.name}'s contractor account on SurfCoast has been automatically unlocked. A full week has now passed since their last completed job.\n\nAs a reminder, you are responsible for overseeing ${contractor.name}'s work activities, ensuring their safety, and making any important decisions on their behalf.\n\nSurfCoast Contractor Market Place`,
            }));
          }
          await Promise.all(emailPromises);
          unlocked++;
          continue;
        }
      }

      // Skip already-locked minors until their unlock date
      if (contractor.minor_hours_locked) continue;

      // --- Calculate hours worked this week ---
      // "This week" = 7 days from minor_weekly_hours_reset_date, or from today if not set
      const weekStart = contractor.minor_weekly_hours_reset_date
        ? new Date(contractor.minor_weekly_hours_reset_date)
        : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const closedScopes = scopesByContractor.get(contractor.id) || [];

      const weekScopes = closedScopes.filter(s => {
        const closedDate = s.closed_date ? new Date(s.closed_date) : null;
        return closedDate && closedDate >= weekStart && closedDate <= now;
      });

      // Sum estimated_hours (fall back to 0 if not set)
      const totalHours = weekScopes.reduce((sum, s) => sum + (s.estimated_hours || 0), 0);

      // Update tracked hours
      await base44.asServiceRole.entities.Contractor.update(contractor.id, {
        minor_weekly_hours_used: totalHours,
      });

      // Lock if limit reached
      if (totalHours >= 20) {
        // Lock until 1 week after the most recent closed job
        const sortedByDate = weekScopes
          .filter(s => s.closed_date)
          .sort((a, b) => new Date(b.closed_date) - new Date(a.closed_date));
        const lastJobDate = sortedByDate.length > 0 ? new Date(sortedByDate[0].closed_date) : now;
        const lockUntil = new Date(lastJobDate.getTime() + 7 * 24 * 60 * 60 * 1000);

        await base44.asServiceRole.entities.Contractor.update(contractor.id, {
          minor_hours_locked: true,
          minor_hours_lock_until: lockUntil.toISOString(),
        });

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: contractor.email,
          subject: '⏸ Weekly Hours Limit Reached | SurfCoast Contractors',
          body: `Hi ${contractor.name},\n\nYou have reached the 20-hour weekly work limit for minor contractors. Your account has been temporarily locked and will automatically unlock on ${lockUntil.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} (one week after your last completed job).\n\nThis policy exists to ensure the well-being of young workers on our platform.\n\nSurfCoast Contractor Market Place`,
        });

        if (contractor.parental_consent_docs?.parent_email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: contractor.parental_consent_docs.parent_email,
            subject: `⏸ ${contractor.name} Has Reached the Weekly Hours Limit | SurfCoast`,
            body: `Dear ${contractor.parental_consent_docs.parent_name || 'Parent/Guardian'},\n\n${contractor.name} has reached the 20-hour weekly work limit for minor contractors on SurfCoast. Their account has been temporarily locked.\n\nUnlock date: ${lockUntil.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\nAs a reminder, you are responsible for supervising ${contractor.name}'s work activities, ensuring their safety, and making any important decisions on their behalf while they are working.\n\nSurfCoast Contractor Market Place`,
          });
        }

        locked++;
      }
    }

    return Response.json({ success: true, minors_checked: minors.length, locked, unlocked });
  } catch (error) {
    console.error('checkMinorHoursLimit error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});