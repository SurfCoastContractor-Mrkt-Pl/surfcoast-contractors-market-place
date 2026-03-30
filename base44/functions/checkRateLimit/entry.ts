import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Check if request is within rate limits
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { endpoint, userId } = await req.json();

    if (!endpoint) {
      return Response.json({ error: 'endpoint required' }, { status: 400 });
    }

    // Get client IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('cf-connecting-ip') ||
                     'unknown';

    // Define rate limits per endpoint
    const limits = {
      'createQuoteRequest': { limit: 5, window: 'minute' },
      'submitMessage': { limit: 20, window: 'minute' },
      'createPayment': { limit: 10, window: 'hour' },
      'submitReview': { limit: 3, window: 'hour' },
      'createJob': { limit: 10, window: 'day' },
      'default': { limit: 100, window: 'minute' }
    };

    const config = limits[endpoint] || limits.default;
    const now = new Date();
    let windowStart = new Date(now);
    
    // Calculate window start based on type
    if (config.window === 'minute') {
      windowStart.setSeconds(0, 0);
    } else if (config.window === 'hour') {
      windowStart.setMinutes(0, 0, 0);
    } else if (config.window === 'day') {
      windowStart.setHours(0, 0, 0, 0);
    }

    // Build unique key
    const key = userId ? `${endpoint}:${userId}` : `${endpoint}:${clientIp}`;

    // Check existing tracker
    let tracker = null;
    try {
      const trackers = await base44.asServiceRole.entities.RateLimitTracker.filter({
        endpoint,
        user_id: userId || null,
        ip_address: !userId ? clientIp : null,
        blocked: false
      });

      tracker = trackers[0];
    } catch (err) {
      console.error('Error checking tracker:', err);
    }

    // Check if in current window
    if (tracker) {
      const trackerWindowStart = new Date(tracker.window_start);
      
      if (trackerWindowStart.getTime() === windowStart.getTime()) {
        // Same window
        if (tracker.request_count >= config.limit) {
          // Exceeded limit
          const blockUntil = new Date(tracker.window_end);
          
          // Update violation count
          await base44.asServiceRole.entities.RateLimitTracker.update(tracker.id, {
            violation_count: (tracker.violation_count || 0) + 1,
            last_violation_at: now.toISOString(),
            blocked: true,
            blocked_until: blockUntil.toISOString()
          });

          return Response.json({
            allowed: false,
            reason: 'Rate limit exceeded',
            endpoint,
            limit: config.limit,
            window: config.window,
            blocked_until: blockUntil.toISOString(),
            retry_after: Math.ceil((blockUntil.getTime() - now.getTime()) / 1000)
          }, { status: 429 });
        } else {
          // Within limit, increment
          await base44.asServiceRole.entities.RateLimitTracker.update(tracker.id, {
            request_count: tracker.request_count + 1
          });

          return Response.json({
            allowed: true,
            endpoint,
            remaining: config.limit - tracker.request_count - 1,
            limit: config.limit,
            window: config.window,
            reset_at: tracker.window_end
          });
        }
      }
    }

    // New window or first request
    const windowEnd = new Date(windowStart);
    if (config.window === 'minute') {
      windowEnd.setMinutes(windowEnd.getMinutes() + 1);
    } else if (config.window === 'hour') {
      windowEnd.setHours(windowEnd.getHours() + 1);
    } else if (config.window === 'day') {
      windowEnd.setDate(windowEnd.getDate() + 1);
    }

    try {
      await base44.asServiceRole.entities.RateLimitTracker.create({
        endpoint,
        user_id: userId,
        ip_address: !userId ? clientIp : null,
        request_count: 1,
        limit: config.limit,
        window_type: config.window,
        window_start: windowStart.toISOString(),
        window_end: windowEnd.toISOString(),
        first_request_at: now.toISOString()
      });
    } catch (err) {
      console.error('Error creating tracker:', err);
    }

    return Response.json({
      allowed: true,
      endpoint,
      remaining: config.limit - 1,
      limit: config.limit,
      window: config.window,
      reset_at: windowEnd.toISOString()
    });
  } catch (error) {
    console.error('checkRateLimit error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});