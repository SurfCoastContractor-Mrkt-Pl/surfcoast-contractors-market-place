import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const providedPassword = body?.password;
    const serviceKey = body?.service_key;
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';

    const dashboardPassword = Deno.env.get('ADMIN_DASHBOARD_PASSWORD');
    const expectedServiceKey = Deno.env.get('INTERNAL_SERVICE_KEY');

    // Verify password if configured
    if (!dashboardPassword) {
      console.error(`[${requestId}] ADMIN_DASHBOARD_PASSWORD not configured`);
      return Response.json({ success: false, error: 'Admin dashboard not configured' }, { status: 500 });
    }

    // Rate limiting key (prioritize authenticated user, fall back to IP)
    let rateLimitKey = clientIP;
    let isAuthenticatedUser = false;
    let isAdmin = false;
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const user = await base44.auth.me();
        if (user?.email) {
          rateLimitKey = user.email;
          isAuthenticatedUser = true;
          isAdmin = user.role === 'admin';
        }
      }
    } catch {
      // Fall through to IP-based rate limiting
    }

    // Grant instant access to authenticated admins (no password needed)
    if (isAdmin) {
      console.log(`[${requestId}] Admin dashboard access granted for ${rateLimitKey} (authenticated admin)`);
      return Response.json({ success: true });
    }

    // Check rate limit (max 5 attempts per hour)
    const now = new Date();
    const windowStart = new Date(now.getTime() - 3600000); // 1 hour ago

    const existingLimit = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key: rateLimitKey,
      limit_type: 'admin_contact',
      window_start: { $gte: windowStart.toISOString() }
    });

    if (existingLimit?.length > 0) {
      const tracker = existingLimit[0];
      if (tracker.request_count >= 5) {
        console.warn(`[${requestId}] Rate limit exceeded for ${rateLimitKey} (${tracker.request_count} attempts)`);
        return Response.json({ 
          success: false, 
          error: 'Too many login attempts. Please try again later.' 
        }, { status: 429 });
      }

      // Increment attempt counter
      await base44.asServiceRole.entities.RateLimitTracker.update(tracker.id, {
        request_count: tracker.request_count + 1
      });
    } else {
      // Create new rate limit record
      await base44.asServiceRole.entities.RateLimitTracker.create({
        key: rateLimitKey,
        limit_type: 'admin_contact',
        request_count: 1,
        window_start: now.toISOString(),
        window_duration_seconds: 3600
      });
    }

    // Verify password (only password required, no service key needed)
    if (providedPassword !== dashboardPassword) {
      console.warn(`[${requestId}] Invalid admin dashboard password attempt from ${rateLimitKey}`);
      return Response.json({ success: false, error: 'Invalid password.' }, { status: 403 });
    }

    // Password validated successfully
    console.log(`[${requestId}] Admin dashboard access granted for ${rateLimitKey}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error(`[${requestId}] adminAuth error:`, error.message);
    return Response.json({ success: false, error: 'Server error.' }, { status: 500 });
  }
});