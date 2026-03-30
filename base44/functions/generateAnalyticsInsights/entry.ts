import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Generate analytics insights from all monitoring data
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const insights = [];

    // Fetch all data in parallel
    const [metrics, checks, errors, activities] = await Promise.all([
      base44.asServiceRole.entities.PerformanceMetric.list('-created_date', 500).catch(() => []),
      base44.asServiceRole.entities.HealthCheck.list('-created_date', 100).catch(() => []),
      base44.asServiceRole.entities.ErrorLog.list('-created_date', 200).catch(() => []),
      base44.asServiceRole.entities.ActivityLog.list('-created_date', 1000).catch(() => [])
    ]);

    // Generate performance insights
    if (metrics.length > 0) {
      const avgLatency = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
      const errorRate = (metrics.filter(m => m.status === 'error').length / metrics.length) * 100;

      if (avgLatency > 2000) {
        insights.push({
          type: 'critical_alert',
          title: 'Critical API Latency',
          description: `Average response time: ${avgLatency.toFixed(0)}ms`,
          metric: 'api_latency',
          value: avgLatency,
          severity: 'critical',
          timestamp: new Date().toISOString()
        });
      }

      if (errorRate > 5) {
        insights.push({
          type: 'critical_alert',
          title: 'High Error Rate',
          description: `System error rate: ${errorRate.toFixed(1)}%`,
          metric: 'error_rate',
          value: errorRate,
          severity: 'critical',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Generate health insights
    if (checks.length > 0) {
      const unhealthy = checks.filter(c => c.status === 'unhealthy');
      if (unhealthy.length > 0) {
        insights.push({
          type: 'critical_alert',
          title: 'Health Checks Failing',
          description: `${unhealthy.length} service(s) unhealthy`,
          metric: 'health_status',
          value: unhealthy.length,
          severity: unhealthy.some(c => c.critical) ? 'critical' : 'warning',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Generate error insights
    if (errors.length > 0) {
      const critical = errors.filter(e => e.level === 'critical');
      if (critical.length > 0) {
        insights.push({
          type: 'critical_alert',
          title: 'Critical Errors',
          description: `${critical.length} critical error(s) detected`,
          metric: 'critical_errors',
          value: critical.length,
          severity: 'critical',
          timestamp: new Date().toISOString()
        });
      }

      const unresolved = errors.filter(e => !e.resolved);
      if (unresolved.length > 0) {
        insights.push({
          type: 'opportunity',
          title: 'Unresolved Errors',
          description: `${unresolved.length} error(s) need attention`,
          metric: 'unresolved_errors',
          value: unresolved.length,
          severity: 'info',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Generate activity insights
    if (activities.length > 0) {
      const failures = activities.filter(a => a.status === 'failure');
      if (failures.length > 0) {
        const failureRate = (failures.length / activities.length) * 100;
        insights.push({
          type: 'warning',
          title: 'Action Failures',
          description: `${failureRate.toFixed(1)}% of actions failed`,
          metric: 'action_failures',
          value: failureRate,
          severity: failureRate > 5 ? 'critical' : 'warning',
          timestamp: new Date().toISOString()
        });
      }

      const critical = activities.filter(a => a.severity === 'critical');
      if (critical.length > 0) {
        insights.push({
          type: 'critical_alert',
          title: 'Critical Activities',
          description: `${critical.length} critical action(s) in system`,
          metric: 'critical_activities',
          value: critical.length,
          severity: 'critical',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Calculate health score
    const criticalCount = insights.filter(i => i.severity === 'critical').length;
    const warningCount = insights.filter(i => i.severity === 'warning').length;
    let healthScore = 100;
    healthScore -= criticalCount * 10;
    healthScore -= warningCount * 2;
    healthScore = Math.max(0, Math.min(100, healthScore));

    return Response.json({
      success: true,
      data: insights.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
      healthScore,
      summary: {
        total: insights.length,
        critical: criticalCount,
        warning: warningCount,
        info: insights.filter(i => i.severity === 'info').length
      }
    });
  } catch (error) {
    console.error('generateAnalyticsInsights error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});