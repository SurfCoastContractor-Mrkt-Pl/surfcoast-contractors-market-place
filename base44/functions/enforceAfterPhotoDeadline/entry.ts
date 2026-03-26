import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    // SECURITY: Only allow POST requests
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    
    // SECURITY: Only admins or automated systems can enforce this
    const user = await base44.auth.me();
    if (user && user.role !== 'admin') {
      console.warn(`[AUTH_VIOLATION] Non-admin user ${user.email} attempted to trigger enforceAfterPhotoDeadline`);
      return Response.json(
        { error: 'Forbidden: Only admins or scheduled automations can enforce photo deadlines' },
        { status: 403 }
      );
    }

    // Fetch all approved scopes
    const scopes = await base44.asServiceRole.entities.ScopeOfWork.filter({
      status: 'approved',
    });

    if (!scopes || scopes.length === 0) {
      return Response.json({
        success: true,
        message: 'No approved scopes found',
        checked: 0,
        locked: 0,
      });
    }

    const now = new Date();
    let checkedCount = 0;
    let lockedCount = 0;
    const lockedContractors = [];

    for (const scope of scopes) {
      if (!scope.agreed_work_date) continue;

      const workDate = new Date(scope.agreed_work_date);
      const deadlineDate = new Date(workDate.getTime() + 72 * 60 * 60 * 1000);

      // Check if 72 hours have passed and no after photos submitted
      if (now >= deadlineDate && (!scope.after_photo_urls || scope.after_photo_urls.length === 0)) {
        checkedCount++;

        // Lock the contractor
        const contractors = await base44.asServiceRole.entities.Contractor.filter({
          email: scope.contractor_email,
        });

        if (contractors && contractors.length > 0) {
          const contractor = contractors[0];

          await base44.asServiceRole.entities.Contractor.update(contractor.id, {
            account_locked: true,
            locked_scope_id: scope.id,
          });

          lockedCount++;
          lockedContractors.push({
            contractor_id: contractor.id,
            contractor_name: contractor.name,
            scope_id: scope.id,
            job_title: scope.job_title,
            work_date: scope.agreed_work_date,
          });

          console.log(
            `[AFTER_PHOTO_LOCK] Contractor ${contractor.id} locked. Scope ${scope.id} missing after photos. Work date: ${scope.agreed_work_date}`
          );
        }
      }
    }

    return Response.json({
      success: true,
      checked: checkedCount,
      locked: lockedCount,
      locked_contractors: lockedContractors,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[AFTER_PHOTO_DEADLINE_ERROR]', error.message);
    return Response.json(
      { error: 'Failed to enforce after photo deadline', details: error.message },
      { status: 500 }
    );
  }
});