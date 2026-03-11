import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Check if a minor contractor has exceeded their 20-hour weekly work limit
 * Returns locked status and hours remaining for the week
 * Called before job assignments or hour tracking updates
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contractorId } = await req.json();

    if (!contractorId) {
      return Response.json({ error: 'contractorId required' }, { status: 400 });
    }

    // Get contractor profile
    const contractor = await base44.asServiceRole.entities.Contractor.filter({
      id: contractorId
    });

    if (!contractor || contractor.length === 0) {
      return Response.json({ error: 'Contractor not found' }, { status: 404 });
    }

    const c = contractor[0];

    // Not a minor - no limits apply
    if (!c.is_minor) {
      return Response.json({
        is_minor: false,
        can_accept_job: true,
        locked: false,
        hours_used: 0,
        hours_remaining: null
      });
    }

    // Check if already locked
    if (c.minor_hours_locked) {
      return Response.json({
        is_minor: true,
        can_accept_job: false,
        locked: true,
        locked_until: c.minor_hours_lock_until,
        hours_used: c.minor_weekly_hours_used,
        hours_remaining: 0,
        message: `Account locked due to 20-hour weekly limit. Unlocks on ${new Date(c.minor_hours_lock_until).toLocaleDateString()}`
      });
    }

    // Check week reset
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const lastResetDate = c.minor_weekly_hours_reset_date ? new Date(c.minor_weekly_hours_reset_date) : null;

    // Reset hours if a new week has started
    let hoursUsed = c.minor_weekly_hours_used || 0;
    if (!lastResetDate || lastResetDate < startOfWeek) {
      // Week has reset - update contractor record
      await base44.asServiceRole.entities.Contractor.update(c.id, {
        minor_weekly_hours_used: 0,
        minor_weekly_hours_reset_date: startOfWeek.toISOString()
      });
      hoursUsed = 0;
    }

    const MINOR_WEEKLY_LIMIT = 20;
    const hoursRemaining = MINOR_WEEKLY_LIMIT - hoursUsed;

    return Response.json({
      is_minor: true,
      can_accept_job: hoursRemaining > 0,
      locked: false,
      hours_used: hoursUsed,
      hours_remaining: hoursRemaining,
      week_starts: startOfWeek.toISOString()
    });
  } catch (error) {
    console.error('Minor hours check error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});