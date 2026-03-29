import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all availability slots for contractor
    const slots = await base44.entities.AvailabilitySlot.filter({
      created_by: user.email
    });

    // Fetch all active scopes to check for conflicts
    const scopes = await base44.entities.ScopeOfWork.filter({
      contractor_email: user.email,
      status: 'approved'
    });

    // Mark slots as unavailable if they overlap with agreed work dates
    const conflicts = [];
    for (const slot of slots) {
      if (slot.available) {
        const slotDate = new Date(slot.date);
        const conflictingScope = scopes.find(scope => {
          const workDate = new Date(scope.agreed_work_date);
          return slotDate.toDateString() === workDate.toDateString();
        });

        if (conflictingScope) {
          await base44.entities.AvailabilitySlot.update(slot.id, {
            available: false
          });
          conflicts.push({ slotId: slot.id, date: slot.date, jobTitle: conflictingScope.job_title });
        }
      }
    }

    return Response.json({
      success: true,
      conflictsResolved: conflicts.length,
      message: conflicts.length > 0 ? `Resolved ${conflicts.length} double-booking conflicts` : 'No conflicts found'
    });
  } catch (error) {
    console.error('Smart availability check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});