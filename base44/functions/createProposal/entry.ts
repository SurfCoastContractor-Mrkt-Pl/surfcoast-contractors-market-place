import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get contractor profile
    const contractors = await base44.entities.Contractor.filter({
      email: user.email
    });

    if (!contractors.length) {
      return Response.json({ error: 'Contractor profile not found' }, { status: 404 });
    }

    const contractor = contractors[0];

    // Check if contractor has access to multi-option proposals (Wave FO, tier 2+)
    // Assuming we need to check the contractor's tier
    // Wave FO contractors must have completed 2+ jobs and be at licensed tier
    const completedJobs = contractor.data.completed_jobs_count || 0;
    const isLicensedTier = contractor.data.profile_tier === 'licensed';

    if (completedJobs < 2 || !isLicensedTier) {
      return Response.json(
        { error: 'Feature requires licensed tier and 2+ completed jobs' },
        { status: 403 }
      );
    }

    const payload = await req.json();

    // Create proposal
    const proposal = await base44.entities.Proposal.create({
      contractor_id: contractor.data.id,
      contractor_email: contractor.data.email,
      contractor_name: contractor.data.name,
      job_id: payload.job_id || '',
      customer_email: payload.customer_email,
      customer_name: payload.customer_name,
      job_title: payload.job_title,
      status: 'draft',
      notes: payload.notes || ''
    });

    return Response.json({ proposal_id: proposal.id });
  } catch (error) {
    console.error('createProposal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});