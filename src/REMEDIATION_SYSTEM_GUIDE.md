# Automated Response & Remediation System

## Overview
Automated response engine that executes remediation actions based on alert conditions, health checks, and custom rules. Enables self-healing systems and reduces manual intervention.

## Components

### 1. Remediation Engine (`lib/remediationEngine.js`)
Core remediation logic and action execution.

**Usage:**
```javascript
import {
  remediationEngine,
  ACTION_TYPES,
  ACTION_STATUS,
  setupDefaultRemediationRules,
  enableAutoRemediation
} from '@/lib/remediationEngine';

// Setup default remediation rules
setupDefaultRemediationRules();

// Process an alert and execute matching responses
const result = await remediationEngine.processAlert({
  id: 'alert_123',
  title: 'High API Latency',
  metric: 'api_latency',
  severity: 'critical',
  value: 2500
});

console.log(`Matched ${result.rulesMatched} rules`);
console.log(`Executed ${result.actionsExecuted} actions`);

// Register custom response rule
remediationEngine.registerResponseRule(
  'database_slow_rule',
  (alert) => alert.metric === 'db_query_time' && alert.value > 5000,
  [
    {
      type: ACTION_TYPES.NOTIFY_TEAM,
      title: 'Notify on slow database',
      description: 'Alert team of slow database queries'
    },
    {
      type: ACTION_TYPES.PURGE_CACHE,
      title: 'Clear database cache',
      description: 'Purge cache to reduce load',
      cacheKey: 'database_cache'
    }
  ]
);

// Register custom action handler
remediationEngine.registerActionHandler(
  ACTION_TYPES.RESTART_SERVICE,
  async (action) => {
    try {
      const result = await fetch('/api/services/restart', {
        method: 'POST',
        body: JSON.stringify({ service: action.serviceName })
      });
      return { success: result.ok, result: await result.json() };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
);

// Disable/enable rules
remediationEngine.disableRule('database_slow_rule');
remediationEngine.enableRule('database_slow_rule');

// Get execution statistics
const stats = remediationEngine.getStats();
console.log(`Total actions: ${stats.total}`);
console.log(`Successful: ${stats.successful}`);
console.log(`Failed: ${stats.failed}`);
console.log(`Success rate: ${remediationEngine.getSuccessRate()}%`);

// Get execution history
const history = remediationEngine.getExecutionHistory(50);
```

### 2. Remediation Action Entity (`entities/RemediationAction.json`)
Database schema for tracking executed remediation actions.

**Fields:**
- `title` - Action title
- `type` - Action type
- `status` - Execution status
- `alert_id` - Associated alert
- `rule_name` - Rule that triggered action
- `parameters` - Action-specific parameters
- `result` - Action result/output
- `error` - Error message if failed
- `started_at` - Execution start time
- `completed_at` - Execution completion time

### 3. Remediation Dashboard (`pages/RemediationDashboard.jsx`)
Dashboard for monitoring remediation actions and outcomes.

**Features:**
- Action statistics and success rate
- Action type distribution
- Recent action history
- Status and result tracking
- Error tracking and analysis

## Setup

### 1. Initialize in App.jsx
```jsx
import { 
  setupDefaultRemediationRules,
  enableAutoRemediation 
} from '@/lib/remediationEngine';
import { alertingSystem } from '@/lib/alertingSystem';

useEffect(() => {
  setupDefaultRemediationRules();
  
  // Integration with alerting system
  // When alert is triggered, execute remediation
}, []);
```

### 2. Add Route
```jsx
import RemediationDashboard from './pages/RemediationDashboard';

<Route path="/remediation" element={
  <LayoutWrapper currentPageName="RemediationDashboard">
    <RemediationDashboard />
  </LayoutWrapper>
} />
```

## Default Remediation Rules

### 1. High Latency Remediation
**Trigger:** API latency metric > 2000ms, critical severity
**Actions:**
- Notify team
- Purge response cache

### 2. High Error Rate Remediation
**Trigger:** Error rate > 5%
**Actions:**
- Notify team
- Apply request throttling

### 3. Health Check Failure Remediation
**Trigger:** Health check failure detected
**Actions:**
- Notify team

## Action Types

### Notification Actions
```javascript
// Notify Team
remediationEngine.registerResponseRule('alert_rule', 
  (alert) => alert.severity === 'critical',
  [{
    type: ACTION_TYPES.NOTIFY_TEAM,
    title: 'Notify on critical alert',
    description: 'Alert team immediately',
    recipient: 'oncall@example.com'
  }]
);
```

### Resource Management Actions
```javascript
// Purge Cache
{
  type: ACTION_TYPES.PURGE_CACHE,
  title: 'Clear cache',
  cacheKey: 'api_responses'
}

// Scale Resources
{
  type: ACTION_TYPES.SCALE_RESOURCES,
  title: 'Scale up API servers',
  resource: 'api-servers',
  action: 'scale-up',
  instances: 3
}

// Throttle Requests
{
  type: ACTION_TYPES.THROTTLE_REQUESTS,
  title: 'Rate limit API',
  endpoint: '/api',
  limit: 100,
  window: 60
}
```

### Service Management Actions
```javascript
// Restart Service
{
  type: ACTION_TYPES.RESTART_SERVICE,
  title: 'Restart API service',
  serviceName: 'api-service'
}

// Disable Feature
{
  type: ACTION_TYPES.DISABLE_FEATURE,
  title: 'Disable beta feature',
  featureFlag: 'new_dashboard'
}

// Enable Fallback
{
  type: ACTION_TYPES.ENABLE_FALLBACK,
  title: 'Enable read-only mode',
  mode: 'read_only'
}
```

### Recovery Actions
```javascript
// Retry Failed Operations
{
  type: ACTION_TYPES.RETRY_FAILED,
  title: 'Retry failed payments',
  operationType: 'payment',
  maxRetries: 3
}
```

## Creating Custom Action Handlers

```javascript
// Example: Database connection pool recovery
remediationEngine.registerActionHandler(
  'recover_db_pool',
  async (action) => {
    try {
      // Reset connection pool
      await base44.asServiceRole.functions.invoke('resetDatabasePool', {});
      
      // Verify connectivity
      const health = await base44.asServiceRole.functions.invoke('checkDatabaseHealth', {});
      
      if (health.connected) {
        return { 
          success: true, 
          message: 'Database pool recovered'
        };
      } else {
        return { 
          success: false, 
          error: 'Database still unavailable'
        };
      }
    } catch (err) {
      return { 
        success: false, 
        error: err.message 
      };
    }
  }
);

// Register response rule with custom action
remediationEngine.registerResponseRule(
  'db_pool_recovery',
  (alert) => alert.metric === 'db_connections' && alert.value > 90,
  [{
    type: 'recover_db_pool',
    title: 'Recover database connection pool',
    description: 'Reset and restore database connectivity'
  }]
);
```

## Integration with Alerting System

```javascript
// In alert handling
async function handleAlert(alert) {
  // Execute remediation
  const remediationResult = await remediationEngine.processAlert(alert);
  
  // Log execution
  if (remediationResult.actionsExecuted > 0) {
    console.log(
      `Executed ${remediationResult.actionsExecuted} remediation actions`
    );
    
    for (const execution of remediationResult.executions) {
      console.log(`${execution.title}: ${execution.status}`);
    }
  }
}
```

## Monitoring Remediation

```javascript
// Get success rate
const successRate = remediationEngine.getSuccessRate();
if (successRate < 80) {
  console.warn('Low remediation success rate');
}

// Get stats
const stats = remediationEngine.getStats();
if (stats.failed > 0) {
  console.warn(`${stats.failed} remediation actions failed`);
}

// Get execution history
const recent = remediationEngine.getExecutionHistory(10);
for (const action of recent) {
  if (action.status === 'failed') {
    console.error(`Failed action: ${action.title} - ${action.error}`);
  }
}
```

## Rollback Capabilities

```javascript
// Actions that support rollback
{
  type: ACTION_TYPES.DISABLE_FEATURE,
  title: 'Disable feature',
  featureFlag: 'feature_x',
  rollback: true,
  rollbackAfter: 5 * 60 * 1000 // 5 minutes
}
```

## Best Practices

1. **Conservative Actions First** - Start with notifications before resource changes
2. **Test Rules** - Test remediation rules in non-critical environments
3. **Monitor Success Rate** - Track which actions succeed/fail and adjust
4. **Escalation** - Use escalation for actions that don't resolve issues
5. **Rollback Safety** - Always implement rollback for risky actions
6. **Audit Trail** - Track all remediation actions and results
7. **Rule Conflicts** - Avoid rules that conflict or create loops
8. **Notifications** - Always notify on significant automatic actions

## Troubleshooting

**Actions not executing:**
- Verify rule condition matches alert
- Check action handler registration
- Review error logs in dashboard

**Actions failing:**
- Check action parameters
- Verify target service/resource exists
- Review error message in action result

**Too many actions:**
- Adjust rule conditions to be more specific
- Add suppressions for known false positives
- Reduce action chains

## Performance Considerations

- Async action execution to prevent blocking
- Action batching for bulk operations
- Rate limiting on remediation actions
- Caching of remediation results

## Next Steps

1. Deploy remediation system
2. Set up default rules and actions
3. Create environment-specific rules
4. Test remediation workflows
5. Set up dashboards and monitoring
6. Train team on remediation processes
7. Iterate on rules based on effectiveness