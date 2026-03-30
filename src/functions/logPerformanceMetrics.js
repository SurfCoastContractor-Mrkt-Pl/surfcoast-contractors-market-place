import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { metric_type, value, url, endpoint, metadata, browser, device, network, status } = body;

    if (!metric_type || value === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const metricRecord = await base44.asServiceRole.entities.PerformanceMetric.create({
      metric_type,
      value,
      unit: 'ms',
      url: url || null,
      endpoint: endpoint || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      browser: browser || null,
      device: device || null,
      network: network || null,
      status: status || 'success'
    });

    return Response.json({ success: true, id: metricRecord.id });
  } catch (error) {
    console.error('logPerformanceMetrics error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});