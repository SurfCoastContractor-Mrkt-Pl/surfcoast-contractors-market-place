import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * onScopeApproved — Entity automation triggered when a ScopeOfWork is updated to 'approved'.
 * Sets is_on_active_job = true on the contractor, locking them from accepting new scopes.
 * Also records the locked_scope_id on the contractor for reference.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { data, event } = body;

    if (data?.status !== 'approved') {
      return Response.json({ skipped: true, reason: 'Not an approval event' });
    }

    const scopeId = event?.entity_id;
    const contractorEmail = data?.contractor_email;
    const contractorId = data?.contractor_id;

    console.log(`[ON_SCOPE_APPROVED] Scope ${scopeId} approved. Setting is_on_active_job on contractor ${contractorEmail}`);

    if (!contractorEmail) {
      return Response.json({ skipped: true, reason: 'No contractor_email on scope' });
    }

    // Find the contractor and set is_on_active_job = true
    const contractors = await base44.asServiceRole.entities.Contractor.filter({ email: contractorEmail });
    if (!contractors?.length) {
      return Response.json({ skipped: true, reason: 'Contractor not found' });
    }

    const contractor = contractors[0];
    await base44.asServiceRole.entities.Contractor.update(contractor.id, {
      is_on_active_job: true,
      locked_scope_id: scopeId,
      availability_status: 'booked',
    });

    console.log(`[ON_SCOPE_APPROVED] Contractor ${contractorEmail} marked as on active job.`);

    return Response.json({ success: true, contractor_id: contractor.id, scope_id: scopeId });
  } catch (error) {
    console.error('[ON_SCOPE_APPROVED_ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});