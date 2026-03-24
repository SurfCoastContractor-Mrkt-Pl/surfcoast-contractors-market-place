import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const now = new Date();
    const staleThreshold = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 48 hours ago

    // Find pending quotes older than 48 hours (limit to 100 to prevent CPU timeout)
    const staleQuotes = await base44.asServiceRole.entities.QuoteRequest.filter({
      status: 'pending',
      created_date: { $lt: staleThreshold.toISOString() }
    }, '-created_date', 100);

    if (!staleQuotes || staleQuotes.length === 0) {
      console.log('No stale quotes found for cleanup');
      return Response.json({ cleaned: 0 });
    }

    // Mark them as expired
    let cleaned = 0;
    for (const quote of staleQuotes) {
      try {
        await base44.asServiceRole.entities.QuoteRequest.update(quote.id, {
          status: 'rejected',
          customer_notes: 'Quote request expired after 48 hours with no response from contractor'
        });
        cleaned++;
      } catch (e) {
        console.error(`Error updating quote ${quote.id}:`, e.message);
      }
    }

    console.log(`Cleanup complete: ${cleaned} stale quotes expired`);
    return Response.json({ cleaned });
  } catch (error) {
    console.error('Cleanup error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});