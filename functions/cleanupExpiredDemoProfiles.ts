import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const now = new Date().toISOString();

    // Find expired demo contractors
    const contractors = await base44.entities.Contractor.filter({ is_demo: true }, null, 1000);
    let deletedCount = 0;

    for (const contractor of contractors) {
      if (contractor.demo_expires_at && new Date(contractor.demo_expires_at) < new Date(now)) {
        try {
          await base44.entities.Contractor.delete(contractor.id);
          deletedCount++;
        } catch (e) {
          console.error(`Failed to delete contractor ${contractor.id}:`, e);
        }
      }
    }

    // Find expired demo jobs
    const jobs = await base44.entities.Job.filter({ is_demo: true }, null, 1000);
    let jobsDeleted = 0;

    for (const job of jobs) {
      if (job.demo_expires_at && new Date(job.demo_expires_at) < new Date(now)) {
        try {
          await base44.entities.Job.delete(job.id);
          jobsDeleted++;
        } catch (e) {
          console.error(`Failed to delete job ${job.id}:`, e);
        }
      }
    }

    return Response.json({
      success: true,
      contractors_deleted: deletedCount,
      jobs_deleted: jobsDeleted,
      timestamp: now
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});