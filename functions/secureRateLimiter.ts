/**
 * Secure Rate Limiting Utility
 * Tracks sensitive operations per user with configurable windows
 * Never exposes rate limit info in error messages
 */

export async function checkRateLimit(base44, key, limitType, maxRequests, windowSeconds) {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowSeconds * 1000);

    const existing = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key,
      limit_type: limitType,
      created_date: { $gte: windowStart.toISOString() }
    });

    if (existing && existing.length > 0) {
      const tracker = existing[0];
      if (tracker.request_count >= maxRequests) {
        return { allowed: false, retryAfter: Math.ceil(windowSeconds / 60) };
      }
      // Increment counter
      await base44.asServiceRole.entities.RateLimitTracker.update(tracker.id, {
        request_count: tracker.request_count + 1
      });
      return { allowed: true };
    }

    // Create new tracker
    await base44.asServiceRole.entities.RateLimitTracker.create({
      key,
      limit_type: limitType,
      request_count: 1,
      window_start: now.toISOString(),
      window_duration_seconds: windowSeconds
    });

    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check failed:', limitType);
    // Fail open on database errors (allow request)
    return { allowed: true };
  }
}