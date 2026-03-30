# System Health & Uptime Monitoring

## Overview
Comprehensive health monitoring system tracking service availability, system dependencies, and uptime metrics for operational visibility.

## Components

### 1. Health Monitor Library (`lib/healthMonitoring.js`)
Client/server-side health check coordination and status tracking.

**Health Status Levels:**
- HEALTHY - All systems operational
- DEGRADED - Some non-critical services down
- UNHEALTHY - Critical services failed
- UNKNOWN - No data collected

**Check Types:**
- DATABASE - Database connectivity
- API - API endpoint health
- FUNCTION - Backend function availability
- EXTERNAL_SERVICE - 3rd party integrations
- STORAGE - File storage systems
- AUTHENTICATION - Auth system health
- PAYMENT_GATEWAY - Payment processing

**Usage:**
```javascript
import {
  healthMonitor,
  HEALTH_STATUS,
  CHECK_TYPES,
  setupStandardHealthChecks,
  startHealthCheckSchedule
} from '@/lib/healthMonitoring';

// Register custom health check
healthMonitor.registerCheck('my_service', async () => {
  try {
    const result = await checkMyService();
    return result.isHealthy;
  } catch {
    return false;
  }
}, {
  name: 'My Custom Service',
  type: CHECK_TYPES.EXTERNAL_SERVICE,
  critical: false,
  interval: 300000 // 5 minutes
});

// Run single check
const result = await healthMonitor.runCheck('my_service');
// {
//   checkId: 'my_service',
//   status: 'healthy',
//   responseTime: 245,
//   error: null,
//   timestamp: '2026-03-30T...'
// }

// Run all checks
const allResults = await healthMonitor.runAllChecks();

// Get current system status
const status = healthMonitor.getStatus(); // 'healthy', 'degraded', etc.

// Get specific check status
const checkStatus = healthMonitor.getCheckStatus('database');
// {
//   id: 'database',
//   status: 'healthy',
//   avgResponseTime: 125,
//   successRate: 99.5,
//   recentResults: [...]
// }

// Setup standard checks and start monitoring
setupStandardHealthChecks();
startHealthCheckSchedule(60000); // Check every 60 seconds
```

### 2. Health Check Entity (`entities/HealthCheck.json`)
Database schema for health check results and history.

**Fields:**
- `check_id` - Unique check identifier
- `check_name` - Human-readable name
- `check_type` - Type of check (database, api, etc.)
- `status` - Current health status
- `response_time_ms` - Check execution time
- `error_message` - Failure reason if applicable
- `critical` - Whether check is critical
- `success_rate` - Percentage of successful checks
- `consecutive_failures` - Failure streak count

### 3. Backend Functions
**healthCheck.js** - Basic system health endpoint
**logHealthCheck.js** - Persists health results and alerts admins on critical failures

### 4. Admin Dashboard (`pages/SystemHealthDashboard.jsx`)
Real-time system status visualization.

**Features:**
- Overall system status with color coding
- Per-service health indicators
- Response time tracking
- Success rate monitoring
- Critical issue alerts
- Uptime statistics (24h, 7d, 30d)
- Error messages for failed checks

## Setup

### 1. Initialize in App.jsx
```jsx
import { 
  setupStandardHealthChecks, 
  startHealthCheckSchedule 
} from '@/lib/healthMonitoring';

useEffect(() => {
  setupStandardHealthChecks();
  startHealthCheckSchedule(60000); // Check every 60 seconds
}, []);
```

### 2. Add Route
```jsx
import SystemHealthDashboard from './pages/SystemHealthDashboard';

<Route path="/admin/system-health" element={
  <LayoutWrapper currentPageName="SystemHealthDashboard">
    <SystemHealthDashboard />
  </LayoutWrapper>
} />
```

## Custom Health Checks

### Database Health
```javascript
healthMonitor.registerCheck('database_custom', async () => {
  try {
    const result = await base44.asServiceRole.entities.ActivityLog.list('', 1);
    return result.length >= 0;
  } catch {
    return false;
  }
}, {
  name: 'Database Query Performance',
  type: CHECK_TYPES.DATABASE,
  critical: true,
  interval: 60000
});
```

### External API
```javascript
healthMonitor.registerCheck('external_api', async () => {
  try {
    const response = await fetch('https://api.example.com/health');
    return response.status === 200;
  } catch {
    return false;
  }
}, {
  name: 'External API',
  type: CHECK_TYPES.EXTERNAL_SERVICE,
  critical: false,
  interval: 300000,
  timeout: 5000
});
```

### Memory/CPU Usage
```javascript
healthMonitor.registerCheck('resource_usage', async () => {
  if (performance.memory) {
    const used = performance.memory.usedJSHeapSize;
    const limit = performance.memory.jsHeapSizeLimit;
    const percentage = (used / limit) * 100;
    return percentage < 85; // Alert if >85% used
  }
  return true;
}, {
  name: 'Resource Usage',
  type: CHECK_TYPES.API,
  critical: false,
  interval: 120000
});
```

## Querying Health Data

### Get latest check results
```javascript
const checks = await base44.asServiceRole.entities.HealthCheck.list('-created_date', 50);
```

### Get failed checks
```javascript
const failures = await base44.asServiceRole.entities.HealthCheck.filter({
  status: 'unhealthy'
}, '-created_date', 100);
```

### Get critical failures
```javascript
const critical = await base44.asServiceRole.entities.HealthCheck.filter({
  status: 'unhealthy',
  critical: true
}, '-created_date', 50);
```

## Alerting Strategy

### Alert on Critical Failure
```javascript
healthMonitor.registerCheck('critical_service', async () => {
  // If this returns false, email alert is sent to ADMIN_ALERT_EMAIL
  return await checkCriticalService();
}, {
  critical: true // Triggers alert on failure
});
```

### Manual Alert
```javascript
if (healthMonitor.getStatus() === HEALTH_STATUS.UNHEALTHY) {
  await base44.integrations.Core.SendEmail({
    to: Deno.env.get('ADMIN_ALERT_EMAIL'),
    subject: '[ALERT] System Health Critical',
    body: 'Critical system failure detected. Check dashboard immediately.'
  });
}
```

## SLA Tracking

Monitor uptime metrics:
```javascript
const healthChecks = await base44.asServiceRole.entities.HealthCheck.filter({
  check_id: 'database'
}, '-created_date', 1440); // Last 24 hours at 1-min intervals

const healthyCount = healthChecks.filter(c => c.status === 'healthy').length;
const uptime = (healthyCount / healthChecks.length) * 100;
console.log(`Database uptime: ${uptime.toFixed(2)}%`);
```

## Best Practices

1. **Appropriate Intervals** - Don't check too frequently (uses resources), but frequently enough to catch issues
   - Critical services: 30-60 seconds
   - Important services: 1-5 minutes
   - Optional services: 10-30 minutes

2. **Meaningful Checks** - Check what matters to users
   - Database connectivity (critical)
   - API functionality (critical)
   - Payment gateway (critical if selling)
   - External integrations (important)

3. **Fast Timeouts** - Don't wait too long for checks to complete
   - Default: 10 seconds
   - Critical: 5 seconds
   - Non-critical: 30 seconds

4. **Monitor Response Times** - Track performance degradation
   - Healthy: < 100ms
   - Acceptable: 100-500ms
   - Slow: 500-2000ms
   - Failing: > 2000ms or timeout

5. **Alert Appropriately** - Only critical failures should trigger alerts
   - Don't alert on every degradation
   - Batch alerts to prevent spam
   - Include context in alerts

## Troubleshooting

**Checks not running:**
- Verify `setupStandardHealthChecks()` called
- Check `startHealthCheckSchedule()` interval
- Review browser console for errors

**Missing data in dashboard:**
- Verify `logHealthCheck` function deployed
- Check HealthCheck entity exists
- Allow time for checks to execute

**False positives:**
- Increase timeout for slow operations
- Check actual service health manually
- Review check logic for edge cases

## Integration Points

### With Error Monitoring
```javascript
// Log health check failure as error
if (result.status === HEALTH_STATUS.UNHEALTHY) {
  errorMonitor.logError({
    message: `Health check failed: ${result.checkId}`,
    category: ERROR_CATEGORIES.NETWORK,
    error: new Error(result.error),
    level: ERROR_LEVELS.CRITICAL
  });
}
```

### With Performance Monitoring
```javascript
// Track check performance
performanceMonitor.recordMetric(
  METRIC_TYPES.API_LATENCY,
  result.responseTime,
  { check: result.checkId, status: result.status }
);
```

### With Audit Logging
```javascript
// Log critical health failures
await logSecurityEvent(
  `Critical service failure: ${checkName}`,
  null,
  SEVERITY_LEVELS.CRITICAL,
  { checkType, checkId, error }
);
```

## Next Steps

1. Deploy health monitoring
2. Configure standard checks for your services
3. Set appropriate check intervals
4. Create alert rules for critical failures
5. Monitor uptime metrics
6. Optimize check logic based on real data