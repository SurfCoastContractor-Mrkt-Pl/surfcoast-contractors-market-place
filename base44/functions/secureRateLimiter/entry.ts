import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// In-memory rate limit tracker (resets on function restart, so also use DB for persistence)
const rateLimitMap = new Map();

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const payload = await req.json();
    const { action, identifier, maxAttempts = 5, windowSeconds = 300 } = payload;

    if (!action || !identifier) {
      return Response.json({ error: 'Missing action or identifier' }, { status: 400 });
    }

    const key = `${action}:${identifier}`;
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    // Get or create tracker
    let tracker = rateLimitMap.get(key) || { attempts: [], blocked: false, blockUntil: 0 };

    // Check if currently blocked
    if (tracker.blocked && now < tracker.blockUntil) {
      const remainingSeconds = Math.ceil((tracker.blockUntil - now) / 1000);
      return Response.json(
        { allowed: false, reason: 'Rate limit exceeded', retryAfter: remainingSeconds },
        { status: 429 }
      );
    }

    // Clean old attempts outside window
    tracker.attempts = tracker.attempts.filter(time => now - time < windowMs);

    // Check if over limit
    if (tracker.attempts.length >= maxAttempts) {
      tracker.blocked = true;
      tracker.blockUntil = now + windowMs;
      rateLimitMap.set(key, tracker);

      return Response.json(
        { allowed: false, reason: 'Rate limit exceeded', retryAfter: windowSeconds },
        { status: 429 }
      );
    }

    // Record attempt
    tracker.attempts.push(now);
    tracker.blocked = false;
    rateLimitMap.set(key, tracker);

    return Response.json({
      allowed: true,
      attempts: tracker.attempts.length,
      remaining: maxAttempts - tracker.attempts.length
    });
  } catch (error) {
    console.error('[secureRateLimiter] Error:', error.message);
    return Response.json({ error: 'Rate limit check failed' }, { status: 500 });
  }
});