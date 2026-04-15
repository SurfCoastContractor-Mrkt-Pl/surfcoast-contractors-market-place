/**
 * getPlatformStats — returns live platform counts for the home page social proof section.
 * Counts: active contractors, completed jobs, posted jobs, total reviews.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// In-memory rate limit: max 30 requests per IP per minute
const statsRateMap = new Map();

function checkStatsRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 30;
  const record = statsRateMap.get(ip) || { attempts: [] };
  record.attempts = record.attempts.filter(t => now - t < windowMs);
  if (record.attempts.length >= maxRequests) return false;
  record.attempts.push(now);
  statsRateMap.set(ip, record);
  return true;
}

Deno.serve(async (req) => {
  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     req.headers.get('cf-connecting-ip') || 'unknown';
    if (!checkStatsRateLimit(clientIp)) {
      return Response.json({ error: 'Too many requests' }, { status: 429 });
    }

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