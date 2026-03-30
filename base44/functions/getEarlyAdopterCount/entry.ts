import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const RATE_LIMIT_THRESHOLD = 20; // max 20 checks per IP per minute
const RATE_LIMIT_WINDOW = 60000; // 1 minute

async function isRateLimited(base44, ip) {
  try {
    const now = new Date().toISOString();
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString();

    const records = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key: `early_adopter_count:${ip}`,
      window_start: { $gte: windowStart }
    });

    if (records && records.length > 0) {
      const record = records[0];
      if (record.request_count >= RATE_LIMIT_THRESHOLD) {
        return true;
      }
      try {
        await base44.asServiceRole.entities.RateLimitTracker.update(record.id, {
          request_count: record.request_count + 1
        });
      } catch (updateErr) {
        // Silently fail on update — rate limit still applies
        if (record.request_count >= RATE_LIMIT_THRESHOLD) return true;
      }
    } else {
      try {
        await base44.asServiceRole.entities.RateLimitTracker.create({
          key: `early_adopter_count:${ip}`,
          limit_type: 'early_adopter_count',
          request_count: 1,
          window_start: now,
          window_duration_seconds: Math.floor(RATE_LIMIT_WINDOW / 1000)
        });
      } catch (createErr) {
        // Silently fail on create — rate limit check still works
        console.debug('[RATE_LIMIT_CREATE] RateLimitTracker create skipped:', createErr.message);
      }
    }
    return false;
  } catch (error) {
    console.debug('[RATE_LIMIT_ERROR]', error.message);
    return false;
  }
}

// Public endpoint — returns cached count of approved early adopter waivers (non-sensitive metric)
Deno.serve(async (req) => {
  const clientIp = req.headers.get('cf-connecting-ip') || 
                   req.headers.get('x-forwarded-for') || 
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