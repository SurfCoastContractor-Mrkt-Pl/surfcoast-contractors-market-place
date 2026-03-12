import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  try {
    const base44 = createClientFromRequest(req);

    // Verify internal service key for unauthenticated requests (scheduled tasks)
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (!isAuthenticated) {
      const body = await req.json().catch(() => ({}));
      const serviceKey = body.service_key;
      const expectedKey = Deno.env.get('INTERNAL_SERVICE_KEY');
      
      if (!expectedKey || !serviceKey || serviceKey !== expectedKey) {
        console.warn(`[${requestId}] Unauthorized cleanup attempt - invalid service key`);
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else {
      // Authenticated users must be admins
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        console.warn(`[${requestId}] Forbidden: user ${user?.email} attempted cleanup`);
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const now = new Date();
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