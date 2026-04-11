import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Log performance metrics from frontend
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const serviceKey = req.headers.get('x-internal-key');
    const validServiceKey = serviceKey && serviceKey === Deno.env.get('INTERNAL_SERVICE_KEY');
    if (!validServiceKey) {
      const user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    const { metrics } = await req.json();

    if (!metrics || !Array.isArray(metrics)) {
      return Response.json({ error: 'metrics array required' }, { status: 400 });
    }

    // Process metrics
    let created = 0;
    let failed = 0;

    for (const metric of metrics) {
      try {
        await base44.asServiceRole.entities.PerformanceMetric.create({
          metric_type: metric.metric_type,
          value: metric.value,
          unit: 'ms',
          url: metric.url,
          metadata: metric.metadata,
          status: metric.metadata?.includes('"error":true') ? 'error' : 'success'
        });
        created++;
      } catch (err) {
        console.error('Failed to create metric:', err);
        failed++;
      }
    }

    // Log summary
    console.log(`Performance metrics: ${created} created, ${failed} failed`);

    // Alert if error rate is high
    if (failed > created * 0.5) {
      const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL');
      if (adminEmail) {
        try {
          await base44.integrations.Core.SendEmail({
            to: adminEmail,
            subject: '[ALERT] High Performance Metric Error Rate',
            body: `High error rate detected: ${failed}/${metrics.length} metrics failed to log.`
          });
        } catch {}
      }
    }

    return Response.json({
      success: true,
      created,
      failed,
      total: metrics.length
    });
  } catch (error) {
    console.error('logPerformanceMetrics error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});