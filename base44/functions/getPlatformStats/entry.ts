/**
 * getPlatformStats — returns live platform counts for the home page social proof section.
 * Counts: active contractors, completed jobs, posted jobs, total reviews.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const [contractors, scopes, reviews] = await Promise.all([
      base44.asServiceRole.entities.Contractor.list().catch(() => []),
      base44.asServiceRole.entities.ScopeOfWork.list().catch(() => []),
      base44.asServiceRole.entities.Review.list().catch(() => []),
    ]);

    const activeContractors = (contractors || []).filter(c => !c.is_demo && c.profile_complete).length;
    const completedJobs = (scopes || []).filter(s => s.status === 'closed').length;
    const verifiedReviews = (reviews || []).filter(r => r.verified).length;

    // Sum all profile views
    const totalViews = (contractors || []).reduce((sum, c) => sum + (c.profile_views || 0), 0);

    return Response.json({
      active_contractors: activeContractors,
      completed_jobs: completedJobs,
      verified_reviews: verifiedReviews,
      profile_views: totalViews,
    });
  } catch (error) {
    console.error('[getPlatformStats] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});