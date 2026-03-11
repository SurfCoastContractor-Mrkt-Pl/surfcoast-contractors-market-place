import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only allow admin or service calls
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
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

    return Response.json({ cleaned });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});