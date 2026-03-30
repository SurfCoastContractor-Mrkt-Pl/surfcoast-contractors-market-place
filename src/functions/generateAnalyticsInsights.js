import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - admin only' }, { status: 403 });
    }

    const metrics = await base44.asServiceRole.entities.PerformanceMetric.list('-created_date', 100);
    const apiUsage = await base44.asServiceRole.entities.APIUsage.list('-created_date', 100);
    const errors = await base44.asServiceRole.entities.ErrorLog.list('-created_date', 50);

    const insights = {
      totalMetrics: metrics.length,
      avgResponseTime: metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length || 0,
      errorRate: (errors.length / (apiUsage.length + 1)) * 100,
      topErrorCategories: [...new Set(errors.map(e => e.category))],
      generatedAt: new Date().toISOString(),
      generatedBy: user.email
    };

    return Response.json(insights);
  } catch (error) {
    console.error('generateAnalyticsInsights error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});