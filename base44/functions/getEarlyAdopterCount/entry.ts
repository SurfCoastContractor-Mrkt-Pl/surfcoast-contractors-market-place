import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const RATE_LIMIT_THRESHOLD = 20; // max 20 checks per IP per minute
const RATE_LIMIT_WINDOW = 60000; // 1 minute

// Simple in-memory rate limiter (no database dependency)
const rateLimitCache = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const key = `early_adopter:${ip}`;
  const limit = rateLimitCache.get(key);

  if (limit && now < limit.resetTime) {
    if (limit.count >= RATE_LIMIT_THRESHOLD) {
      return true;
    }
    limit.count++;
  } else {
    rateLimitCache.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  }

  // Cleanup old entries every 100 requests
  if (Math.random() < 0.01) {
    for (const [k, v] of rateLimitCache.entries()) {
      if (now > v.resetTime) rateLimitCache.delete(k);
    }
  }

  return false;
}

// Public endpoint — returns cached count of approved early adopter waivers (non-sensitive metric)
Deno.serve(async (req) => {
  const clientIp = req.headers.get('cf-connecting-ip') || 
                   req.headers.get('x-forwarded-for') || 
                   'unknown';

  // Check rate limit (in-memory, no DB calls)
  if (isRateLimited(clientIp)) {
    return Response.json({ error: 'Rate limited' }, { status: 429 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const waivers = await base44.asServiceRole.entities.EarlyAdopterWaiver.filter({ is_eligible: true });
    const count = waivers ? waivers.length : 0;
    // Return only count, never expose individual data
    return Response.json({ count }, { headers: { 'cache-control': 'public, max-age=300' } });
  } catch (error) {
    console.error('[getEarlyAdopterCount] Error:', error.message);
    return Response.json({ count: 0 }, { headers: { 'cache-control': 'public, max-age=60' } });
  }
});