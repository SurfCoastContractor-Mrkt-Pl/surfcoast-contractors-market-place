// Advanced Analytics Engine
// Aggregates data from all monitoring systems for comprehensive insights

import { base44 } from '@/api/base44Client';

export const INSIGHT_TYPES = {
  TREND: 'trend',
  ANOMALY: 'anomaly',
  OPPORTUNITY: 'opportunity',
  WARNING: 'warning',
  CRITICAL_ALERT: 'critical_alert'
};

class AnalyticsEngine {
  constructor() {
    this.insights = [];
    this.thresholds = new Map();
    this.setupDefaultThresholds();
  }

  setupDefaultThresholds() {
    // Performance thresholds
    this.setThreshold('api_latency', { warning: 500, critical: 2000 });
    this.setThreshold('page_load', { warning: 3000, critical: 5000 });
    this.setThreshold('error_rate', { warning: 2, critical: 5 });
    
    // Availability thresholds
    this.setThreshold('uptime', { warning: 99.0, critical: 95.0 });
    this.setThreshold('health_degraded', { warning: 1, critical: 3 });
  }

  setThreshold(metric, thresholds) {
    this.thresholds.set(metric, thresholds);
  }

  // Generate insights from performance metrics
  async generatePerformanceInsights() {
    try {
      const metrics = await base44.asServiceRole.entities.PerformanceMetric
        .list('-created_date', 500);

      if (metrics.length === 0) return [];

      const insights = [];

      // Calculate statistics
      const avgLatency = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
      const errorMetrics = metrics.filter(m => m.status === 'error');
      const errorRate = (errorMetrics.length / metrics.length) * 100;

      const latencyThreshold = this.thresholds.get('api_latency');
      const errorThreshold = this.thresholds.get('error_rate');

      // Check latency
      if (avgLatency > latencyThreshold.critical) {
        insights.push({
          type: INSIGHT_TYPES.CRITICAL_ALERT,
          title: 'Critical API Latency',
          description: `Average API response time is ${avgLatency.toFixed(0)}ms (threshold: ${latencyThreshold.critical}ms)`,
          metric: 'api_latency',
          value: avgLatency,
          severity: 'critical',
          timestamp: new Date().toISOString()
        });
      } else if (avgLatency > latencyThreshold.warning) {
        insights.push({
          type: INSIGHT_TYPES.WARNING,
          title: 'High API Latency',
          description: `Average API response time is ${avgLatency.toFixed(0)}ms`,
          metric: 'api_latency',
          value: avgLatency,
          severity: 'warning',
          timestamp: new Date().toISOString()
        });
      }

      // Check error rate
      if (errorRate > errorThreshold.critical) {
        insights.push({
          type: INSIGHT_TYPES.CRITICAL_ALERT,
          title: 'Critical Error Rate',
          description: `Error rate is ${errorRate.toFixed(1)}% (threshold: ${errorThreshold.critical}%)`,
          metric: 'error_rate',
          value: errorRate,
          severity: 'critical',
          timestamp: new Date().toISOString()
        });
      } else if (errorRate > errorThreshold.warning) {
        insights.push({
          type: INSIGHT_TYPES.WARNING,
          title: 'High Error Rate',
          description: `Error rate is ${errorRate.toFixed(1)}%`,
          metric: 'error_rate',
          value: errorRate,
          severity: 'warning',
          timestamp: new Date().toISOString()
        });
      }

      return insights;
    } catch (err) {
      console.error('Error generating performance insights:', err);
      return [];
    }
  }

  // Generate insights from health checks
  async generateHealthInsights() {
    try {
      const checks = await base44.asServiceRole.entities.HealthCheck
        .list('-created_date', 100);

      const insights = [];
      const criticalChecks = checks.filter(c => c.critical);
      const unhealthyChecks = checks.filter(c => c.status === 'unhealthy');

      if (unhealthyChecks.length > 0) {
        insights.push({
          type: INSIGHT_TYPES.CRITICAL_ALERT,
          title: 'System Health Issues',
          description: `${unhealthyChecks.length} health check(s) failing`,
          metric: 'health_status',
          value: unhealthyChecks.length,
          severity: unhealthyChecks.some(c => c.critical) ? 'critical' : 'warning',
          details: unhealthyChecks.map(c => ({
            name: c.check_name,
            error: c.error_message
          })),
          timestamp: new Date().toISOString()
        });
      }

      return insights;
    } catch (err) {
      console.error('Error generating health insights:', err);
      return [];
    }
  }

  // Generate insights from error logs
  async generateErrorInsights() {
    try {
      const errors = await base44.asServiceRole.entities.ErrorLog
        .list('-created_date', 200);

      const insights = [];
      const unresolved = errors.filter(e => !e.resolved);
      const critical = errors.filter(e => e.level === 'critical');

      if (critical.length > 0) {
        insights.push({
          type: INSIGHT_TYPES.CRITICAL_ALERT,
          title: 'Critical Errors Detected',
          description: `${critical.length} critical error(s) in system`,
          metric: 'critical_errors',
          value: critical.length,
          severity: 'critical',
          timestamp: new Date().toISOString()
        });
      }

      if (unresolved.length > 0) {
        const byCategory = {};
        for (const error of unresolved) {
          byCategory[error.category] = (byCategory[error.category] || 0) + 1;
        }

        insights.push({
          type: INSIGHT_TYPES.OPPORTUNITY,
          title: 'Unresolved Errors',
          description: `${unresolved.length} error(s) awaiting resolution`,
          metric: 'unresolved_errors',
          value: unresolved.length,
          details: byCategory,
          severity: 'info',
          timestamp: new Date().toISOString()
        });
      }

      return insights;
    } catch (err) {
      console.error('Error generating error insights:', err);
      return [];
    }
  }

  // Generate activity insights
  async generateActivityInsights() {
    try {
      const activities = await base44.asServiceRole.entities.ActivityLog
        .list('-created_date', 1000);

      const insights = [];
      const criticalActivities = activities.filter(a => a.severity === 'critical');
      const failures = activities.filter(a => a.status === 'failure');

      if (criticalActivities.length > 0) {
        insights.push({
          type: INSIGHT_TYPES.CRITICAL_ALERT,
          title: 'Critical Actions Detected',
          description: `${criticalActivities.length} critical action(s) in past period`,
          metric: 'critical_actions',
          value: criticalActivities.length,
          severity: 'critical',
          timestamp: new Date().toISOString()
        });
      }

      if (failures.length > 0) {
        const failureRate = (failures.length / activities.length) * 100;
        insights.push({
          type: INSIGHT_TYPES.WARNING,
          title: 'Action Failures',
          description: `${failureRate.toFixed(1)}% of actions failed`,
          metric: 'action_failure_rate',
          value: failureRate,
          severity: 'warning',
          timestamp: new Date().toISOString()
        });
      }

      return insights;
    } catch (err) {
      console.error('Error generating activity insights:', err);
      return [];
    }
  }

  // Get all insights
  async getAllInsights() {
    const results = await Promise.all([
      this.generatePerformanceInsights(),
      this.generateHealthInsights(),
      this.generateErrorInsights(),
      this.generateActivityInsights()
    ]);

    this.insights = results.flat();
    return this.insights.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  // Get critical insights
  getCriticalInsights() {
    return this.insights.filter(i => 
      i.type === INSIGHT_TYPES.CRITICAL_ALERT
    );
  }

  // Get insights by type
  getInsightsByType(type) {
    return this.insights.filter(i => i.type === type);
  }

  // Generate summary report
  generateSummaryReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalInsights: this.insights.length,
      critical: this.insights.filter(i => i.severity === 'critical').length,
      warning: this.insights.filter(i => i.severity === 'warning').length,
      info: this.insights.filter(i => i.severity === 'info').length,
      byType: {},
      topIssues: []
    };

    // Count by type
    for (const insight of this.insights) {
      report.byType[insight.type] = (report.byType[insight.type] || 0) + 1;
    }

    // Top issues
    report.topIssues = this.insights
      .filter(i => i.severity !== 'info')
      .slice(0, 10)
      .map(i => ({
        title: i.title,
        metric: i.metric,
        severity: i.severity
      }));

    return report;
  }

  // Calculate health score (0-100)
  calculateHealthScore() {
    const totalInsights = this.insights.length;
    if (totalInsights === 0) return 100;

    const criticalCount = this.insights.filter(i => i.severity === 'critical').length;
    const warningCount = this.insights.filter(i => i.severity === 'warning').length;

    let score = 100;
    score -= criticalCount * 10;
    score -= warningCount * 2;

    return Math.max(0, Math.min(100, score));
  }
}

export const analyticsEngine = new AnalyticsEngine();

// Start automatic insights generation
export function startAnalyticsSchedule(intervalMs = 300000) {
  setInterval(async () => {
    await analyticsEngine.getAllInsights();
  }, intervalMs);

  // Initial run
  analyticsEngine.getAllInsights();
}