/**
 * getPlatformStats — returns live platform counts for the home page social proof section.
 * Counts: active contractors, completed jobs, posted jobs, total reviews.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_SECONDS = 60;

async function isRateLimited(base44, ip) {
  const key = `platform_stats:${ip}`;
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString();
  try {
    const records = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key,
      window_start: { $gte: windowStart },
    });
    if (records?.length > 0) {
      if (records[0].request_count >= RATE_LIMIT_MAX) return true;
      await base44.asServiceRole.entities.RateLimitTracker.update(records[0].id, {
        request_count: records[0].request_count + 1,
      });
    } else {
      await base44.asServiceRole.entities.RateLimitTracker.create({
        key,
        limit_type: 'platform_stats',
        request_count: 1,
        window_start: new Date().toISOString(),
        window_duration_seconds: RATE_LIMIT_WINDOW_SECONDS,
      });
    }
    return false;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     req.headers.get('cf-connecting-ip') || 'unknown';

    const base44 = createClientFromRequest(req);

    if (await isRateLimited(base44, clientIp)) {
      return Response.json({ error: 'Too many requests' }, { status: 429 });
    }

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