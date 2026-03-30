# Admin Control Hub & API Usage Analytics

## Overview
Centralized administration platform providing unified access to all monitoring systems, dashboards, and administrative functions with comprehensive API usage tracking.

## Components

### 1. Admin Control Hub (`pages/AdminControlHub.jsx`)
Main entry point for all administrative functions and monitoring systems.

**Features:**
- Quick system status overview
- Organized dashboard sections (System Monitoring, Data Management, Operations)
- Recent errors and activities
- Quick links to all monitoring dashboards
- Real-time stats refresh

**Usage:**
Navigate to `/admin-control-hub` for the main admin interface.

**Dashboard Organization:**
```
System Monitoring
├── System Health
├── Performance Analytics
├── Error Monitoring
└── Activity Audit Log

Data Management
├── Database Management
└── API Usage Analytics

Operations
├── Rate Limit Management
└── System Settings
```

### 2. API Usage Tracking Library (`lib/apiUsageTracking.js`)
Frontend/backend API call tracking and quota management.

**Usage:**
```javascript
import { 
  apiUsageTracker, 
  API_ENDPOINTS,
  setupAPIInterception,
  startAPITrackingSchedule 
} from '@/lib/apiUsageTracking';

// Track a specific call
apiUsageTracker.trackCall('/api/users', 'GET', 200, 145, {
  userId: '123',
  cached: false
});

// Set quota for an endpoint
apiUsageTracker.setQuota('/api/expensive', 1000, 50000);

// Check quota status
const status = apiUsageTracker.getQuotaStatus('/api/expensive');
console.log(status);
// {
//   endpoint: '/api/expensive',
//   dailyLimit: 1000,
//   monthlyLimit: 50000,
//   dailyUsed: 247,
//   monthlyUsed: 5823
// }

// Check if quota exceeded
if (apiUsageTracker.isQuotaExceeded('/api/expensive')) {
  console.warn('Quota exceeded for this endpoint');
}

// Get usage statistics
const stats = apiUsageTracker.getStats('24h');
console.log(stats);
// {
//   total: 5234,
//   byEndpoint: { '/api/users': { count: 1200, errors: 5 }, ... },
//   byMethod: { GET: 3500, POST: 1200, ... },
//   byStatus: { 200: 5100, 404: 100, 500: 34, ... },
//   errorCount: 139,
//   avgResponseTime: 245,
//   p95ResponseTime: 1200,
//   p99ResponseTime: 2500
// }

// Setup automatic interception
setupAPIInterception();

// Start periodic flushing to backend
startAPITrackingSchedule(60000); // Flush every 60 seconds
```

### 3. API Usage Entity (`entities/APIUsage.json`)
Database schema for API call history.

**Fields:**
- `endpoint` - API endpoint called
- `method` - HTTP method (GET, POST, etc.)
- `status_code` - HTTP status code
- `response_time_ms` - Response time in milliseconds
- `user_email` - User who made the call
- `error_message` - Error if call failed
- `date` - Date of the call

### 4. API Analytics Dashboard (`pages/APIUsageAnalyticsDashboard.jsx`)
Visual analytics for API usage patterns.

**Metrics:**
- Total API calls
- Error rate percentage
- Average response time
- P95 and P99 response times
- Calls by HTTP method
- Calls by status code
- Slowest endpoints ranking

## Setup

### 1. Initialize in App.jsx
```jsx
import { 
  setupAPIInterception, 
  startAPITrackingSchedule 
} from '@/lib/apiUsageTracking';

useEffect(() => {
  setupAPIInterception();
  startAPITrackingSchedule(60000);
}, []);
```

### 2. Add Routes
```jsx
import AdminControlHub from './pages/AdminControlHub';
import APIUsageAnalyticsDashboard from './pages/APIUsageAnalyticsDashboard';

<Route path="/admin-control-hub" element={
  <LayoutWrapper currentPageName="AdminControlHub">
    <AdminControlHub />
  </LayoutWrapper>
} />

<Route path="/api-usage-analytics" element={
  <LayoutWrapper currentPageName="APIUsageAnalyticsDashboard">
    <APIUsageAnalyticsDashboard />
  </LayoutWrapper>
} />
```

## API Usage Patterns

### Track Function Calls
```javascript
import { apiUsageTracker } from '@/lib/apiUsageTracking';

async function callFunction() {
  const start = Date.now();
  
  try {
    const result = await base44.functions.invoke('myFunction', {});
    const duration = Date.now() - start;
    
    apiUsageTracker.trackCall('/functions/myFunction', 'POST', 200, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    apiUsageTracker.trackCall('/functions/myFunction', 'POST', 500, duration, {
      error: error.message
    });
    throw error;
  }
}
```

### Monitor Entity Operations
```javascript
async function listEntities() {
  const start = Date.now();
  
  try {
    const items = await base44.entities.MyEntity.list();
    const duration = Date.now() - start;
    
    apiUsageTracker.trackCall('/entities/MyEntity', 'READ', 200, duration, {
      count: items.length
    });
    
    return items;
  } catch (error) {
    const duration = Date.now() - start;
    apiUsageTracker.trackCall('/entities/MyEntity', 'READ', 500, duration);
    throw error;
  }
}
```

## Querying API Usage Data

### Get all API calls in timeframe
```javascript
const calls = await base44.asServiceRole.entities.APIUsage.list('-created_date', 1000);
```

### Get slow API calls
```javascript
const slowCalls = calls.filter(c => c.response_time_ms > 1000);
console.log(`${slowCalls.length} calls took >1s`);
```

### Get error calls
```javascript
const errors = await base44.asServiceRole.entities.APIUsage.filter({
  status_code: { $gte: 400 }
}, '-created_date', 100);
```

### Get by endpoint
```javascript
const userApiCalls = calls.filter(c => c.endpoint.includes('/api/users'));
const avgTime = userApiCalls.reduce((sum, c) => sum + c.response_time_ms, 0) / userApiCalls.length;
console.log(`/api/users average response: ${avgTime}ms`);
```

## Quota Management

### Set quotas for endpoints
```javascript
// Daily limit of 1000 calls, monthly limit of 50000
apiUsageTracker.setQuota('/api/expensive-operation', 1000, 50000);

// Reject calls that would exceed quota
async function callWithQuota(endpoint, fn) {
  if (apiUsageTracker.isQuotaExceeded(endpoint)) {
    throw new Error('API quota exceeded');
  }
  return fn();
}
```

### Track quota usage
```javascript
function logQuotaUsage() {
  for (const [endpoint, quota] of apiUsageTracker.quotas) {
    const usage = (quota.dailyUsed / quota.dailyLimit) * 100;
    console.log(`${endpoint}: ${usage.toFixed(1)}% of daily quota used`);
  }
}
```

## Performance Insights

### Identify slow endpoints
```javascript
const stats = apiUsageTracker.getStats('24h');
const slowEndpoints = Object.entries(stats.byEndpoint)
  .filter(([_, data]) => data.avgTime > 500)
  .sort((a, b) => b[1].avgTime - a[1].avgTime);

console.log('Slow endpoints:');
slowEndpoints.forEach(([endpoint, data]) => {
  console.log(`${endpoint}: ${data.avgTime}ms avg`);
});
```

### Monitor error rates
```javascript
const stats = apiUsageTracker.getStats();
const errorRate = (stats.errorCount / stats.total) * 100;

if (errorRate > 5) {
  console.warn(`High error rate: ${errorRate}%`);
}
```

### Calculate percentiles
```javascript
const stats = apiUsageTracker.getStats('24h');
console.log(`Average response: ${stats.avgResponseTime}ms`);
console.log(`95th percentile: ${stats.p95ResponseTime}ms`);
console.log(`99th percentile: ${stats.p99ResponseTime}ms`);
```

## Best Practices

1. **Track Strategically** - Focus on user-facing and expensive operations
2. **Set Reasonable Quotas** - Know your system capacity
3. **Monitor Trends** - Track performance over time
4. **Alert on Issues** - Set thresholds for error rates and response times
5. **Batch Operations** - Reduce API call frequency where possible
6. **Cache Results** - Avoid redundant calls
7. **Review Regularly** - Weekly analysis of API usage patterns

## Integration Points

### With Error Monitoring
```javascript
// Log slow API calls as performance warnings
if (responseTime > 2000) {
  errorMonitor.logError({
    message: `Slow API response: ${endpoint}`,
    level: ERROR_LEVELS.WARNING,
    context: { endpoint, responseTime }
  });
}
```

### With Performance Monitoring
```javascript
// Track API calls as performance metrics
performanceMonitor.recordMetric(
  METRIC_TYPES.API_LATENCY,
  responseTime,
  { endpoint, status }
);
```

### With Audit Logging
```javascript
// Log important API operations
auditLogger.log('api_call', {
  endpoint,
  method,
  status,
  responseTime,
  user: currentUser.email
});
```

## Troubleshooting

**Data not showing in dashboard:**
- Check browser console for errors
- Verify `setupAPIInterception()` was called
- Ensure `logAPIUsage` function deployed
- Check APIUsage entity exists

**Quota tracking not working:**
- Call `setQuota()` for the endpoint
- Verify `isQuotaExceeded()` is being checked
- Check quota values in memory

**Missing API calls:**
- Verify all fetch calls go through tracked endpoints
- Check that `startAPITrackingSchedule()` is flushing data
- Review browser console for interception errors

## Next Steps

1. Deploy admin control hub
2. Connect all monitoring dashboards
3. Configure API quota limits
4. Set performance thresholds
5. Review API usage weekly
6. Optimize identified bottlenecks
7. Monitor quota consumption