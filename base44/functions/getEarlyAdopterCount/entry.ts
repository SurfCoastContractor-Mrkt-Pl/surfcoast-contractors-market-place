import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const RATE_LIMIT_THRESHOLD = 20;
const RATE_LIMIT_WINDOW_SECONDS = 60;

async function isRateLimited(base44, ip) {
  const key = `early_adopter:${ip}`;
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString();
  try {
    const records = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key,
      window_start: { $gte: windowStart },
    });
    if (records?.length > 0) {
      if (records[0].request_count >= RATE_LIMIT_THRESHOLD) return true;
      await base44.asServiceRole.entities.RateLimitTracker.update(records[0].id, {
        request_count: records[0].request_count + 1,
      });
    } else {
      await base44.asServiceRole.entities.RateLimitTracker.create({
        key,
        limit_type: 'early_adopter_count',
        request_count: 1,
        window_start: new Date().toISOString(),
        window_duration_seconds: RATE_LIMIT_WINDOW_SECONDS,
      });
    }
    return false;
  } catch {
    return false; // fail open for non-critical public endpoint
  }
}

// Public endpoint — returns cached count of approved early adopter waivers (non-sensitive metric)
Deno.serve(async (req) => {
  const clientIp = req.headers.get('cf-connecting-ip') ||
                   req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                   'unknown';

  try {
    const base44 = createClientFromRequest(req);

    if (await isRateLimited(base44, clientIp)) {
      return Response.json({ error: 'Rate limited' }, { status: 429 });
    }
    const waivers = await base44.asServiceRole.entities.EarlyAdopterWaiver.filter({ is_eligible: true });
    const count = waivers ? waivers.length : 0;
    // Return only count, never expose individual data
    return Response.json({ count }, { headers: { 'cache-control': 'public, max-age=300' } });
  } catch (error) {
    console.error('[getEarlyAdopterCount] Error:', error.message);
    return Response.json({ count: 0 }, { headers: { 'cache-control': 'public, max-age=60' } });
  }
});