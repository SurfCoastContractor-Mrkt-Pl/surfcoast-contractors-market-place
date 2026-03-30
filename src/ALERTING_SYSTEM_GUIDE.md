# Comprehensive Alerting & Notification System

## Overview
Multi-channel alert management system with customizable rules, escalation policies, deduplication, and comprehensive alert lifecycle management.

## Components

### 1. Alerting System Library (`lib/alertingSystem.js`)
Core alert management and notification orchestration.

**Usage:**
```javascript
import {
  alertingSystem,
  ALERT_SEVERITY,
  ALERT_CHANNELS,
  ALERT_STATUS,
  setupDefaultAlertRules,
  startAlertingSchedule
} from '@/lib/alertingSystem';

// Trigger an alert
await alertingSystem.triggerAlert({
  title: 'High API Latency',
  message: 'Average response time: 2500ms',
  severity: ALERT_SEVERITY.CRITICAL,
  source: 'performance_monitor',
  metric: 'api_latency',
  value: 2500,
  recipient: 'admin@example.com'
});

// Register custom notification channel
alertingSystem.registerChannel(ALERT_CHANNELS.SLACK, async (alert) => {
  // Send to Slack webhook
  const response = await fetch(process.env.SLACK_WEBHOOK, {
    method: 'POST',
    body: JSON.stringify({
      text: `[${alert.severity}] ${alert.title}`,
      attachments: [{
        text: alert.message,
        color: alert.severity === 'critical' ? 'danger' : 'warning'
      }]
    })
  });
  return response.ok;
});

// Register custom alert rule
alertingSystem.registerRule('custom_metric_alert',
  (config) => config.metric === 'custom_metric' && config.value > 100,
  {
    channels: [ALERT_CHANNELS.EMAIL, ALERT_CHANNELS.SLACK],
    escalateAfter: 10 * 60 * 1000 // 10 minutes
  }
);

// Acknowledge alert
alertingSystem.acknowledgeAlert('alert_123');

// Resolve alert
alertingSystem.resolveAlert('alert_123', 'Fixed database connection pool');

// Get alerts
const activeAlerts = alertingSystem.getActiveAlerts();
const critical = alertingSystem.getAlertsBySeverity(ALERT_SEVERITY.CRITICAL);

// Suppress alert to reduce noise
alertingSystem.suppressAlert('metric_alert_key', 3600000); // 1 hour

// Get statistics
const stats = alertingSystem.getStats();

// Setup and start
setupDefaultAlertRules();
startAlertingSchedule(60000); // Check every 60 seconds
```

### 2. Alert Entity (`entities/Alert.json`)
Database schema for alert history and management.

**Fields:**
- `title` - Alert title
- `message` - Alert message
- `severity` - Alert severity (info, warning, critical, emergency)
- `status` - Current status (triggered, escalated, acknowledged, resolved)
- `source` - System component that triggered alert
- `metric` - What metric triggered the alert
- `value` - Metric value that triggered alert
- `recipient` - Email/user to notify
- `rule` - Alert rule that triggered this
- `channels` - Notification channels used

### 3. Alert Management Dashboard (`pages/AlertManagementDashboard.jsx`)
UI for viewing, acknowledging, and resolving alerts.

**Features:**
- Alert statistics and overview
- Status and severity filtering
- Alert acknowledgement and resolution
- Resolution notes tracking
- Alert timeline view

## Setup

### 1. Initialize in App.jsx
```jsx
import { 
  setupDefaultAlertRules, 
  startAlertingSchedule 
} from '@/lib/alertingSystem';

useEffect(() => {
  setupDefaultAlertRules();
  startAlertingSchedule(60000); // Check every minute
}, []);
```

### 2. Add Route
```jsx
import AlertManagementDashboard from './pages/AlertManagementDashboard';

<Route path="/alert-management" element={
  <LayoutWrapper currentPageName="AlertManagementDashboard">
    <AlertManagementDashboard />
  </LayoutWrapper>
} />
```

## Alert Rules

### Default Rules
- **performance_degradation** - API latency > 2000ms
- **high_error_rate** - Error rate > 5%
- **critical_failure** - Critical severity alerts
- **health_check_failure** - Health checks failing

### Creating Custom Rules
```javascript
alertingSystem.registerRule('database_slow',
  (config) => config.source === 'database' && config.value > 1000,
  {
    channels: [ALERT_CHANNELS.EMAIL, ALERT_CHANNELS.IN_APP],
    escalateAfter: 5 * 60 * 1000,
    customAction: (alert) => {
      console.log('Custom handling for:', alert.title);
    }
  }
);
```

## Notification Channels

### Email
```javascript
// Configured by default
// Uses base44.integrations.Core.SendEmail
```

### In-App Notifications
```javascript
// Configured by default
// Stores alerts in database
```

### Custom Channels (Slack Example)
```javascript
alertingSystem.registerChannel('slack', async (alert) => {
  const slackWebhook = Deno.env.get('SLACK_WEBHOOK_URL');
  
  const response = await fetch(slackWebhook, {
    method: 'POST',
    body: JSON.stringify({
      text: `🚨 ${alert.severity.toUpperCase()}: ${alert.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${alert.title}*\n${alert.message}`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Source: ${alert.source} | Severity: ${alert.severity}`
            }
          ]
        }
      ]
    })
  });
  
  return response.ok;
});
```

## Alert Lifecycle

1. **Triggered** - Alert condition detected
2. **Escalated** (optional) - Alert not acknowledged after escalateAfter duration
3. **Acknowledged** - Admin acknowledges the alert
4. **Resolved** - Issue fixed and alert closed

## Suppression & Deduplication

```javascript
// Suppress duplicate alerts for 1 hour
alertingSystem.suppressAlert('api_latency_alert', 3600000);

// Check if alert is suppressed
if (alertingSystem.isSuppressed('api_latency_alert')) {
  console.log('Alert is suppressed');
}
```

## Integrating with Monitoring Systems

### From Performance Monitoring
```javascript
const metrics = await base44.asServiceRole.entities.PerformanceMetric.list();
const avgLatency = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;

if (avgLatency > 2000) {
  await alertingSystem.triggerAlert({
    title: 'High API Latency Detected',
    message: `Average response time: ${avgLatency.toFixed(0)}ms`,
    severity: ALERT_SEVERITY.CRITICAL,
    source: 'performance_monitor',
    metric: 'api_latency',
    value: avgLatency,
    recipient: 'admin@example.com'
  });
}
```

### From Health Checks
```javascript
const unhealthyChecks = await base44.asServiceRole.entities.HealthCheck
  .filter({ status: 'unhealthy' });

if (unhealthyChecks.length > 0) {
  await alertingSystem.triggerAlert({
    title: 'Critical Service Failure',
    message: `${unhealthyChecks.length} service(s) unhealthy`,
    severity: ALERT_SEVERITY.CRITICAL,
    source: 'health_monitor',
    metric: 'health_status',
    value: unhealthyChecks.length,
    recipient: 'admin@example.com'
  });
}
```

### From Error Logs
```javascript
const criticalErrors = await base44.asServiceRole.entities.ErrorLog
  .filter({ level: 'critical', resolved: false });

if (criticalErrors.length > 0) {
  await alertingSystem.triggerAlert({
    title: 'Unresolved Critical Errors',
    message: `${criticalErrors.length} critical error(s) in system`,
    severity: ALERT_SEVERITY.CRITICAL,
    source: 'error_monitor',
    metric: 'critical_errors',
    value: criticalErrors.length,
    recipient: 'admin@example.com'
  });
}
```

## Escalation

```javascript
// Setup escalation to notify additional recipients
alertingSystem.registerRule('critical_escalation',
  (config) => config.severity === ALERT_SEVERITY.CRITICAL,
  {
    channels: [ALERT_CHANNELS.EMAIL],
    escalateAfter: 2 * 60 * 1000, // 2 minutes
    escalationRecipients: ['admin@example.com', 'oncall@example.com']
  }
);
```

## Reporting

### Alert History
```javascript
const alertHistory = await base44.asServiceRole.entities.Alert.list('-created_date', 1000);
```

### Alert Statistics
```javascript
const stats = alertingSystem.getStats();
console.log(`
Active: ${stats.active}
Acknowledged: ${stats.acknowledged}
Resolved: ${stats.resolved}
By Severity: ${JSON.stringify(stats.bySeverity)}
`);
```

### Alert by Source
```javascript
const bySource = {};
for (const alert of alertHistory) {
  if (!bySource[alert.source]) bySource[alert.source] = 0;
  bySource[alert.source]++;
}
```

## Best Practices

1. **Avoid Alert Fatigue** - Use thresholds that don't trigger constantly
2. **Suppress Duplicates** - Use suppression for known temporary issues
3. **Escalation** - Implement escalation for critical alerts
4. **Resolution Tracking** - Always add notes when resolving alerts
5. **Rule Testing** - Test alert rules before deployment
6. **Alert SLA** - Define SLA for acknowledging and resolving alerts
7. **Grouping** - Group related alerts to reduce notification count
8. **Context** - Include relevant metrics and context in alert messages

## Troubleshooting

**Alerts not triggering:**
- Verify rule condition matches alert config
- Check if alert is suppressed
- Review alerting schedule startup

**Notifications not received:**
- Verify channel is registered
- Check recipient email/configuration
- Review channel handler errors

**Alert spam:**
- Adjust thresholds to reduce false positives
- Enable suppression for non-critical issues
- Review and consolidate redundant rules

## Next Steps

1. Deploy alerting system
2. Configure alert rules for your systems
3. Test notification channels
4. Set up alert dashboards
5. Define SLAs for alert response
6. Monitor alert trends and refine rules