import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { jobId, limit = 10 } = await req.json();

    if (!jobId) {
      return Response.json({ error: 'Job ID required' }, { status: 400 });
    }

    // Get job details
    const job = await base44.entities.Job.filter({ id: jobId });
    if (!job?.[0]) {
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }

    const jobData = job[0];
    const requiredTrades = jobData.trade_needed ? [jobData.trade_needed] : [];

    // Get all contractors
    const contractors = await base44.entities.Contractor.list();

    // Score each contractor
    const scored = contractors.map(contractor => {
      let score = 0;

      // Trade match (40 points)
      if (requiredTrades.length > 0) {
        if (requiredTrades.includes(contractor.trade_specialty)) {
          score += 40;
        } else if (contractor.line_of_work === jobData.contractor_type_needed) {
          score += 20;
        }
      }

      // Rating match (30 points)
      if (contractor.rating) {
        score += (contractor.rating / 5) * 30;
      }

      // Location proximity (20 points) - simplified
      if (contractor.location && jobData.location) {
        score += 20; // In production, use actual geocoding
      }

      // Availability (10 points)
      if (contractor.available) {
        score += 10;
      }

      return {
        contractor,
        score,
        recommendationReason: getRecommendationReason(contractor, jobData, score),
      };
    });

    // Sort by score and limit
    const matches = scored
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ contractor, score, recommendationReason }) => ({
        contractor_id: contractor.id,
        contractor_name: contractor.name,
        contractor_email: contractor.email,
        rating: contractor.rating,
        location: contractor.location,
        skills: contractor.skills,
        match_score: Math.round(score),
        recommendation_reason: recommendationReason,
      }));

    return Response.json({ matches, total: matches.length });
  } catch (error) {
    console.error('Job matching error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getRecommendationReason(contractor, job, score) {
  if (score >= 90) return 'Perfect match - highly recommended';
  if (score >= 70) return 'Strong match - well-suited for this job';
  if (score >= 50) return 'Good match - has relevant experience';
  return 'Possible match - may have applicable skills';
}