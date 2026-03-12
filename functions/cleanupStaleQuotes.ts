import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Verify internal service key for unauthenticated requests (scheduled tasks)
    const isAuthenticated = await base44.auth.isAuthenticated();
    let authorizedUser = null;

    if (!isAuthenticated) {
      const serviceKey = body.service_key;
      const expectedKey = Deno.env.get('INTERNAL_SERVICE_KEY');
      
      if (!expectedKey || !serviceKey || serviceKey !== expectedKey) {
        console.warn(`[${requestId}] Unauthorized cleanup attempt - invalid service key`);
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      authorizedUser = 'system';
    } else {
      // Authenticated users must be admins
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        console.warn(`[${requestId}] Forbidden: user ${user?.email} attempted cleanup`);
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      authorizedUser = user.email;
    }

    // Rate limit: max 1 cleanup per 5 minutes per caller
    const now = new Date();
    const recentWindow = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes
    
    const recentAttempts = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key: authorizedUser,
      limit_type: 'admin_cleanup',
      window_start: { $gte: recentWindow.toISOString() }
    });

    if (recentAttempts?.length > 0) {
      console.warn(`[${requestId}] Cleanup rate limit exceeded for ${authorizedUser}`);
      return Response.json({ error: 'Cleanup already in progress or recently executed. Please wait.' }, { status: 429 });
    }

    // Record this cleanup attempt
    await base44.asServiceRole.entities.RateLimitTracker.create({
      key: authorizedUser,
      limit_type: 'admin_cleanup',
      request_count: 1,
      window_start: now.toISOString(),
      window_duration_seconds: 300
    });

    const staleThreshold = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 48 hours ago

    // Find pending quotes older than 48 hours
    const staleQuotes = await base44.asServiceRole.entities.QuoteRequest.filter({
      status: 'pending',
      created_at: { $lt: staleThreshold.toISOString() }
    });

    if (!staleQuotes || staleQuotes.length === 0) {
      return Response.json({ cleaned: 0 });
    }

    // Mark them as expired
    let cleaned = 0;
    for (const quote of staleQuotes) {
      await base44.asServiceRole.entities.QuoteRequest.update(quote.id, {
        status: 'rejected',
        customer_notes: 'Quote request expired after 48 hours with no response from contractor'
      });
      cleaned++;
    }

    console.log(`[${requestId}] Cleanup complete: ${cleaned} stale quotes expired`);
    return Response.json({ cleaned });
  } catch (error) {
    console.error(`[${requestId}] Cleanup error:`, error.message);
    return Response.json({ error: error.message, requestId }, { status: 500 });
  }
});