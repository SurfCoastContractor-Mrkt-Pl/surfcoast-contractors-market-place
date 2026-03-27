import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const rateLimitMap = new Map();
const RATE_LIMIT_THRESHOLD = 20; // max 20 checks per IP per minute
const RATE_LIMIT_WINDOW = 60000; // 1 minute

function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return false;
  }
  
  record.count++;
  if (record.count > RATE_LIMIT_THRESHOLD) {
    return true;
  }
  return false;
}

// Public endpoint — returns cached count of approved early adopter waivers (non-sensitive metric)
Deno.serve(async (req) => {
  const clientIp = req.headers.get('cf-connecting-ip') || 
                   req.headers.get('x-forwarded-for') || 
                   'unknown';

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