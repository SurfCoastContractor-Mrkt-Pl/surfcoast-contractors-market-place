# Advanced Analytics Engine

## Overview
Comprehensive analytics system that aggregates data from all monitoring systems to generate actionable insights, calculate system health scores, and identify trends and anomalies.

## Components

### 1. Analytics Engine Library (`lib/analyticsEngine.js`)
Core analytics processing for insights generation.

**Insight Types:**
- TREND - Performance or usage trend
- ANOMALY - Unusual behavior detected
- OPPORTUNITY - Optimization opportunity
- WARNING - Non-critical issue
- CRITICAL_ALERT - Critical issue requiring immediate attention

**Usage:**
```javascript
import { 
  analyticsEngine, 
  INSIGHT_TYPES,
  startAnalyticsSchedule 
} from '@/lib/analyticsEngine';

// Generate all insights
const insights = await analyticsEngine.getAllInsights();

// Get critical insights only
const critical = analyticsEngine.getCriticalInsights();

// Get insights by type
const trends = analyticsEngine.getInsightsByType(INSIGHT_TYPES.TREND);

// Generate summary report
const report = analyticsEngine.generateSummaryReport();
// {
//   timestamp: '2026-03-30T...',
//   totalInsights: 15,
//   critical: 3,
//   warning: 5,
//   info: 7,
//   byType: { trend: 2, anomaly: 1, warning: 5, critical_alert: 3, opportunity: 4 },
//   topIssues: [...]
// }

// Calculate health score (0-100)
const score = analyticsEngine.calculateHealthScore();
// 75 (healthy but with some issues)

// Set custom thresholds
analyticsEngine.setThreshold('api_latency', { 
  warning: 500,    // Alert if avg > 500ms
  critical: 2000   // Critical if avg > 2000ms
});

// Start automatic insights generation
startAnalyticsSchedule(300000); // Every 5 minutes
```

### 2. Advanced Analytics Dashboard (`pages/AdvancedAnalyticsDashboard.jsx`)
Comprehensive visualization of all insights and system health.

**Features:**
- System health score (0-100)
- Insight categorization by severity
- Real-time critical issue tracking
- Aggregated metrics
- Timestamp tracking for each insight

### 3. Backend Insights Generator (`functions/generateAnalyticsInsights.js`)
Server-side insights generation from all monitoring data.

## Setup

### 1. Initialize in App.jsx
```jsx
import { startAnalyticsSchedule } from '@/lib/analyticsEngine';

useEffect(() => {
  startAnalyticsSchedule(300000); // Every 5 minutes
}, []);
```

### 2. Add Route
```jsx
import AdvancedAnalyticsDashboard from './pages/AdvancedAnalyticsDashboard';

<Route path="/advanced-analytics" element={
  <LayoutWrapper currentPageName="AdvancedAnalyticsDashboard">
    <AdvancedAnalyticsDashboard />
  </LayoutWrapper>
} />
```

## Insight Generation

### Performance Insights
Analyzes API latency and response times:
- Average response time tracking
- P95 and P99 percentile monitoring
- Slow endpoint identification
- Error rate calculation

```javascript
// Automatically checks:
// - avgLatency > 2000ms → Critical alert
// - avgLatency > 500ms → Warning
// - errorRate > 5% → Critical alert
// - errorRate > 2% → Warning
```

### Health Insights
Monitors system health checks:
- Critical service failures
- Degraded service detection
- Check status tracking

```javascript
// Alerts on:
// - Critical health check failures
// - Multiple failing health checks
// - Repeated service issues
```

### Error Insights
Analyzes error patterns:
- Critical error detection
- Unresolved error tracking
- Error rate monitoring

```javascript
// Identifies:
// - Critical errors in system
// - Unresolved errors
// - Error rate spikes
```

### Activity Insights
Monitors system activities:
- Action failure tracking
- Critical activity detection
- User action analysis

```javascript
// Detects:
// - Critical system actions
// - Action failure rates
// - Unusual activity patterns
```

## Health Score Calculation

Formula:
```
healthScore = 100
healthScore -= (criticalCount × 10)
healthScore -= (warningCount × 2)
healthScore = clamp(0, 100)
```

**Interpretation:**
- 80-100: Excellent health
- 60-79: Good health with minor issues
- 40-59: Poor health, needs attention
- 0-39: Critical issues, immediate action needed

## Querying Insights

### Get critical insights
```javascript
const critical = analyticsEngine.getCriticalInsights();
```

### Filter by metric
```javascript
const latencyIssues = analyticsEngine.insights.filter(
  i => i.metric === 'api_latency'
);
```

### Get recent insights
```javascript
const recent = analyticsEngine.insights
  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  .slice(0, 10);
```

## Generating Reports

### Summary Report
```javascript
const report = analyticsEngine.generateSummaryReport();
console.log(`System has ${report.critical} critical issues`);
console.log(`Health breakdown: ${report.critical} critical, ${report.warning} warnings, ${report.info} info`);
```

### Email Report
```javascript
async function sendHealthReport() {
  const report = analyticsEngine.generateSummaryReport();
  const score = analyticsEngine.calculateHealthScore();

  await base44.integrations.Core.SendEmail({
    to: 'admin@example.com',
    subject: `System Health Report - Score: ${score}/100`,
    body: `
Critical Issues: ${report.critical}
Warnings: ${report.warning}
Info Items: ${report.info}

Top Issues:
${report.topIssues.map(i => `- ${i.title} (${i.severity})`).join('\n')}
    `
  });
}
```

## Setting Custom Thresholds

```javascript
// API latency
analyticsEngine.setThreshold('api_latency', {
  warning: 500,   // 500ms warning
  critical: 2000  // 2s critical
});

// Error rate
analyticsEngine.setThreshold('error_rate', {
  warning: 2,     // 2% warning
  critical: 5     // 5% critical
});

// Uptime
analyticsEngine.setThreshold('uptime', {
  warning: 99.0,   // 99% warning
  critical: 95.0   // 95% critical
});

// Custom metrics
analyticsEngine.setThreshold('database_connections', {
  warning: 80,  // 80 connections warning
  critical: 95  // 95 connections critical
});
```

## Integrating with Other Systems

### With Alerting
```javascript
async function checkAndAlert() {
  const insights = await analyticsEngine.getAllInsights();
  const critical = analyticsEngine.getCriticalInsights();

  if (critical.length > 0) {
    // Send alert
    await notifyAdmins(critical);
  }
}
```

### With Logging
```javascript
// Log all critical insights
const critical = analyticsEngine.getCriticalInsights();
for (const insight of critical) {
  console.log(`[${insight.severity.toUpperCase()}] ${insight.title}: ${insight.description}`);
}
```

### With Dashboards
```javascript
// Display health score prominently
const score = analyticsEngine.calculateHealthScore();
updateDashboardHealthIndicator(score);
```

## Best Practices

1. **Appropriate Thresholds** - Set thresholds based on your system's SLA
2. **Regular Reviews** - Review insights daily for trends
3. **Action on Insights** - Don't just view insights, act on them
4. **Threshold Tuning** - Adjust thresholds based on false positive rate
5. **Alert on Critical Only** - Only alert on critical insights to reduce noise
6. **Batch Reports** - Send consolidated daily/weekly reports
7. **Archive Resolved** - Track which insights have been addressed

## Common Insight Patterns

### Performance Degradation
```
Pattern: avgLatency increasing over time
Action: Investigate slow endpoints, check database performance
```

### Resource Leak
```
Pattern: Memory/CPU gradually increasing
Action: Profile application, check for memory leaks
```

### Error Spike
```
Pattern: Sudden increase in error rate
Action: Check recent deployments, review error logs
```

### Availability Issues
```
Pattern: Health checks failing
Action: Restart services, check infrastructure
```

## Next Steps

1. Deploy advanced analytics
2. Set appropriate thresholds
3. Review insights regularly
4. Implement automated responses to critical insights
5. Fine-tune thresholds based on false positive rate
6. Create dashboards for stakeholders
7. Generate periodic reports