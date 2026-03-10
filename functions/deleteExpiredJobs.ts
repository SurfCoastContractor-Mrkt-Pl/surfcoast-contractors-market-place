import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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

    // Get all jobs
    const allJobs = await base44.asServiceRole.entities.Job.list();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const jobsToDelete = [];

    // Check each job
    for (const job of allJobs) {
      const jobCreatedDate = new Date(job.created_date);

      // If job is older than 30 days
      if (jobCreatedDate < thirtyDaysAgo) {
        // Check if any ScopeOfWork exists for this job
        const scopes = await base44.asServiceRole.entities.ScopeOfWork.filter({ job_id: job.id });

        // If no contractor agreements made
        if (!scopes || scopes.length === 0) {
          jobsToDelete.push(job);
        }
      }
    }

    // Delete expired jobs and notify customers
    const deletedCount = jobsToDelete.length;

    for (const job of jobsToDelete) {
      try {
        // Send notification email to customer
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: job.poster_email,
          subject: 'Your Job Posting Has Expired',
          body: `Your job posting "${job.title}" has been automatically removed after 30 days with no contractor interest. No agreements were made with any contractors. You can post a new job at any time.`
        });

        console.log(`Sending expiration email to ${job.poster_email} for job ${job.id}`);
      } catch (emailError) {
        console.error(`Failed to send email for job ${job.id}:`, emailError.message);
      }

      // Delete associated data
      try {
        const scopes = await base44.asServiceRole.entities.ScopeOfWork.filter({ job_id: job.id });
        for (const scope of scopes) {
          await base44.asServiceRole.entities.ScopeOfWork.delete(scope.id);
        }

        const proposals = await base44.asServiceRole.entities.ContractorScopeProposal.filter({ job_id: job.id });
        for (const proposal of proposals) {
          await base44.asServiceRole.entities.ContractorScopeProposal.delete(proposal.id);
        }

        const requests = await base44.asServiceRole.entities.CustomerScopeRequest.filter({ job_id: job.id });
        for (const request of requests) {
          await base44.asServiceRole.entities.CustomerScopeRequest.delete(request.id);
        }

        // Delete the job
        await base44.asServiceRole.entities.Job.delete(job.id);
        console.log(`Deleted expired job ${job.id}: ${job.title}`);
      } catch (deleteError) {
        console.error(`Failed to delete job ${job.id}:`, deleteError.message);
      }
    }

    return Response.json({
      success: true,
      message: `Deleted ${deletedCount} expired jobs`,
      deletedJobCount: deletedCount
    });
  } catch (error) {
    console.error('Error in deleteExpiredJobs:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});