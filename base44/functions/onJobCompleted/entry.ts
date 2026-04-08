import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Require authenticated admin — job completion triggers financial and review actions
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { scopeId, contractorId, contractorEmail, clientEmail } = await req.json();

    // Fetch scope details
    const scope = await base44.asServiceRole.entities.ScopeOfWork.get(scopeId);
    if (!scope) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }

    // Sync completed job to HubSpot
    await base44.functions.invoke('syncToHubSpot', {
      dealData: {
        title: scope.job_title,
        amount: scope.cost_amount,
        status: 'closedwon',
        description: scope.scope_summary,
        closeDate: new Date().toISOString(),
      },
    });

    // Send review request email to client
    const reviewLink = `${Deno.env.get('APP_URL')}/review-job?scopeId=${scopeId}&type=client`;
    await base44.integrations.Core.SendEmail({
      to: clientEmail,
      subject: `How was your experience with ${scope.contractor_name}?`,
      body: `Your job with ${scope.contractor_name} is complete. We'd love to hear about your experience!\n\n<a href="${reviewLink}">Leave a Review</a>`,
    });

    // Send review request email to contractor
    const contractorReviewLink = `${Deno.env.get('APP_URL')}/review-job?scopeId=${scopeId}&type=contractor`;
    await base44.integrations.Core.SendEmail({
      to: contractorEmail,
      subject: `Rate your experience with ${scope.client_name}`,
      body: `Great job completing the project! Help the community by rating your experience with ${scope.client_name}.\n\n<a href="${contractorReviewLink}">Leave a Review</a>`,
    });

    // Update contractor profile metrics
    const contractor = await base44.asServiceRole.entities.Contractor.get(contractorId);
    if (contractor) {
      await base44.asServiceRole.entities.Contractor.update(contractorId, {
        completed_jobs_count: (contractor.completed_jobs_count || 0) + 1,
      });
    }

    console.log(`Job completion automation triggered for scope ${scopeId}`);
    return Response.json({ success: true, message: 'Job completion workflow completed' });
  } catch (error) {
    console.error('Job completion error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});