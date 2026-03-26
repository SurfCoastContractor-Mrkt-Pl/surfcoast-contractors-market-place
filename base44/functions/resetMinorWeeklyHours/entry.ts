import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // SECURITY: Only admins or automated systems can reset minor hours
    const user = await base44.auth.me();
    if (user && user.role !== 'admin') {
      console.warn(`[AUTH_VIOLATION] Non-admin user ${user.email} attempted to trigger resetMinorWeeklyHours`);
      return Response.json(
        { error: 'Forbidden: Only admins or scheduled automations can reset minor hours' },
        { status: 403 }
      );
    }

    // Fetch all minors currently locked due to hours
    const minors = await base44.asServiceRole.entities.Contractor.filter({
      is_minor: true,
    });

    if (!minors || minors.length === 0) {
      return Response.json({
        success: true,
        message: 'No minors found',
        reset_count: 0,
      });
    }

    const now = new Date();
    let resetCount = 0;
    let unlockedCount = 0;

    for (const minor of minors) {
      const updates = {
        minor_weekly_hours_used: 0,
        minor_weekly_hours_reset_date: now.toISOString(),
      };

      // If they were locked, unlock them
      if (minor.minor_hours_locked) {
        updates.minor_hours_locked = false;
        updates.minor_hours_lock_until = null;
        unlockedCount++;
      }

      await base44.asServiceRole.entities.Contractor.update(minor.id, updates);
      resetCount++;
    }

    console.log(
      `[MINOR_HOURS_RESET] Reset ${resetCount} minors. Unlocked ${unlockedCount} locked accounts.`
    );

    return Response.json({
      success: true,
      reset_count: resetCount,
      unlocked_count: unlockedCount,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[MINOR_HOURS_RESET_ERROR]', error.message);
    return Response.json(
      { error: 'Failed to reset minor hours', details: error.message },
      { status: 500 }
    );
  }
});