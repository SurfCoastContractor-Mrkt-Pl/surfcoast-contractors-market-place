import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Log API usage to database
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { calls } = await req.json();

    if (!calls || !Array.isArray(calls)) {
      return Response.json({ error: 'calls array required' }, { status: 400 });
    }

    // Log each call
    let created = 0;
    let failed = 0;

    for (const call of calls) {
      try {
        await base44.asServiceRole.entities.APIUsage.create({
          endpoint: call.endpoint,
          method: call.method,
          status_code: call.status,
          response_time_ms: call.responseTime,
          metadata: JSON.stringify(call.metadata),
          date: call.date
        });
        created++;
      } catch (err) {
        console.error('Failed to log API call:', err);
        failed++;
      }
    }

    console.log(`API usage logged: ${created} success, ${failed} failed`);

    return Response.json({
      success: true,
      created,
      failed,
      total: calls.length
    });
  } catch (error) {
    console.error('logAPIUsage error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});