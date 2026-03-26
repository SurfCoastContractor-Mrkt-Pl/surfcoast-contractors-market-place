import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    // SECURITY: Only allow POST requests
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    
    // SECURITY: Authenticate the user - must be admin or the contractor
    const user = await base44.auth.me();
    if (!user) {
      return Response.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }
    
    const { scope_id, contractor_id, estimated_hours } = await req.json();

    if (!scope_id || !contractor_id || estimated_hours === undefined) {
      return Response.json(
        { error: 'Missing required fields: scope_id, contractor_id, estimated_hours' },
        { status: 400 }
      );
    }
    
    // Fetch contractor once for both auth and business logic
    let contractor = null;
    try {
      contractor = await base44.asServiceRole.entities.Contractor.get(contractor_id);
    } catch (e) {
      console.warn('Contractor not found:', contractor_id);
      return Response.json({ error: 'Contractor not found' }, { status: 404 });
    }

    if (!contractor) {
      return Response.json({ error: 'Contractor not found' }, { status: 404 });
    }

    // SECURITY: Authorization - only admins or the contractor themselves can update hours
    if (user.role !== 'admin' && contractor.email !== user.email) {
      console.warn(`[AUTH_VIOLATION] Non-admin user ${user.email} attempted to update hours for contractor ${contractor_id}`);
      return Response.json(
        { error: 'Forbidden: You can only update your own minor hours' },
        { status: 403 }
      );
    }

    if (!contractor) {
      return Response.json({ error: 'Contractor not found' }, { status: 404 });
    }

    // Only check if this is a minor
    if (!contractor.is_minor) {
      return Response.json({
        is_minor: false,
        hours_checked: false,
      });
    }

    const WEEKLY_LIMIT = 20;
    const currentHours = contractor.minor_weekly_hours_used || 0;
    const newTotal = currentHours + estimated_hours;

    const updates = {
      minor_weekly_hours_used: newTotal,
    };

    // If hours exceed limit, lock account
    if (newTotal >= WEEKLY_LIMIT) {
      updates.minor_hours_locked = true;
      updates.minor_hours_lock_until = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(); // Lock for 1 week

      console.log(
        `[MINOR_HOURS_LOCK] Minor ${contractor_id} reached ${newTotal}h (limit ${WEEKLY_LIMIT}h). Account locked.`
      );

      await base44.asServiceRole.entities.Contractor.update(contractor_id, updates);

      return Response.json({
        is_minor: true,
        hours_checked: true,
        current_hours: currentHours,
        new_hours: newTotal,
        limit: WEEKLY_LIMIT,
        locked: true,
        lock_until: updates.minor_hours_lock_until,
      });
    }

    // Just update hours
    await base44.asServiceRole.entities.Contractor.update(contractor_id, updates);

    return Response.json({
      is_minor: true,
      hours_checked: true,
      current_hours: currentHours,
      new_hours: newTotal,
      limit: WEEKLY_LIMIT,
      locked: false,
      hours_remaining: WEEKLY_LIMIT - newTotal,
    });
  } catch (error) {
    console.error('[MINOR_HOURS_CHECK_ERROR]', error.message);
    return Response.json(
      { error: 'Failed to check minor hours', details: error.message },
      { status: 500 }
    );
  }
});