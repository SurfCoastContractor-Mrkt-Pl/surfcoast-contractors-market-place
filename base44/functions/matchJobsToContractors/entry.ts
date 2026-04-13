import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const serviceKey = req.headers.get('x-internal-key');
    const validServiceKey = serviceKey && serviceKey === Deno.env.get('INTERNAL_SERVICE_KEY');
    if (!validServiceKey) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin or internal service access required' }, { status: 403 });
      }
    }
    const body = await req.json().catch(() => ({}));
    const { jobId, limit = 10 } = body;

    // Get all contractors once (shared across all jobs)
    const contractors = await base44.asServiceRole.entities.Contractor.list();

    const scoreJob = (jobData) => {
      const requiredTrades = jobData.trade_needed ? [jobData.trade_needed] : [];
      const scored = contractors.map(contractor => {
        let score = 0;

        // Trade match (40 points)
        if (requiredTrades.length > 0) {
          if (requiredTrades.includes(contractor.trade_specialty)) score += 40;
          else if (contractor.line_of_work === jobData.contractor_type_needed) score += 20;
        }

        // Rating match (30 points)
        if (contractor.rating) score += (contractor.rating / 5) * 30;

        // Location proximity (20 points) - simplified
        if (contractor.location && jobData.location) score += 20;

        // Availability (10 points)
        if (contractor.available) score += 10;

        return { contractor, score };
      });

      return scored
        .filter(m => m.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ contractor, score }) => ({
          contractor_id: contractor.id,
          contractor_name: contractor.name,
          contractor_email: contractor.email,
          rating: contractor.rating,
          location: contractor.location,
          skills: contractor.skills,
          match_score: Math.round(score),
          recommendation_reason: getRecommendationReason(score),
        }));
    };

    // Single-job path (manual call with jobId)
    if (jobId) {
      const job = await base44.asServiceRole.entities.Job.filter({ id: jobId });
      if (!job?.[0]) {
        return Response.json({ error: 'Job not found' }, { status: 404 });
      }
      const matches = scoreJob(job[0]);
      return Response.json({ matches, total: matches.length });
    }

    // Scheduled path: process all open jobs
    const openJobs = await base44.asServiceRole.entities.Job.filter({ status: 'open' }, '-created_date', 500);
    console.log(`[matchJobsToContractors] Processing ${openJobs.length} open jobs`);

    const results = openJobs.map(jobData => ({
      job_id: jobData.id,
      job_title: jobData.title,
      matches: scoreJob(jobData),
    }));

    console.log(`[matchJobsToContractors] Done. ${results.length} jobs processed`);
    return Response.json({ success: true, jobs_processed: results.length, results });
  } catch (error) {
    console.error('Job matching error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getRecommendationReason(score) {
  if (score >= 90) return 'Perfect match - highly recommended';
  if (score >= 70) return 'Strong match - well-suited for this job';
  if (score >= 50) return 'Good match - has relevant experience';
  return 'Possible match - may have applicable skills';
}