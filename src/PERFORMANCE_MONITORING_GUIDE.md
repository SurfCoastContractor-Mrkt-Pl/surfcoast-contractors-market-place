# Performance Analytics & Monitoring System

## Overview
Comprehensive performance tracking system measuring API latency, function execution times, page load metrics, and Core Web Vitals for system health visibility.

## Components

### 1. Performance Monitor Library (`lib/performanceMonitoring.js`)
Client-side metrics collection with automatic offline queuing.

**Metric Types:**
- API_LATENCY - API call response times
- FUNCTION_EXECUTION - Backend function execution time
- PAGE_LOAD - Full page load timing
- USER_ACTION - User interaction responsiveness
- DATABASE_QUERY - Query execution time
- ERROR_RATE - Error tracking
- MEMORY_USAGE - Memory consumption
- CPU_USAGE - CPU utilization

**Usage:**
```javascript
import { 
  performanceMonitor, 
  METRIC_TYPES,
  setupWebVitalsMonitoring 
} from '@/lib/performanceMonitoring';

// Manual timing
performanceMonitor.startTimer('operation_1');
// ... do work
const duration = performanceMonitor.stopTimer(
  'operation_1', 
  METRIC_TYPES.API_LATENCY,
  { endpoint: '/api/users' }
);

// Measure async operation
const { result, duration } = await performanceMonitor.measureApiCall(
  '/api/users',
  () => base44.functions.invoke('getUsers', {}),
  { userId: '123' }
);

// Measure function execution
const { result, duration } = await performanceMonitor.measureFunction(
  'process_data',
  () => processLargeDataset(data),
  { dataSize: data.length }
);

// Record metric directly
await performanceMonitor.recordMetric(
  METRIC_TYPES.PAGE_LOAD,
  2500,
  { page: '/dashboard' }
);

// Setup Core Web Vitals monitoring
setupWebVitalsMonitoring();

// Get current stats
const stats = performanceMonitor.getStats();
console.log(stats);
// {
//   total: 150,
//   byType: { api_latency: {...}, page_load: {...} },
//   averageLatency: 245
// }
```

### 2. Performance Metric Entity (`entities/PerformanceMetric.json`)
Database schema for storing performance data.

**Fields:**
- `metric_type` - Type of performance metric
- `value` - Measured value (usually ms)
- `url` - Page where metric was recorded
- `metadata` - JSON context (endpoint, function name, etc.)
- `status` - success/error
- `browser` / `device` / `network` - Environment details

### 3. Backend Logger (`functions/logPerformanceMetrics.js`)
Server-side persistence of metrics with batching support.

### 4. Analytics Dashboard (`pages/PerformanceAnalyticsDashboard.jsx`)
Admin UI for viewing performance trends.

**Features:**
- Timeframe selection (1h, 24h, 7d, 30d)
- Filter by metric type
- Key metrics summary (avg latency, max latency, error rate)
- Per-type statistics (min, max, avg, count)
- Recent metrics timeline

## Setup

### 1. Initialize in App.jsx
```jsx
import { setupWebVitalsMonitoring } from '@/lib/performanceMonitoring';

useEffect(() => {
  setupWebVitalsMonitoring();
}, []);
```

### 2. Add Route
```jsx
import PerformanceAnalyticsDashboard from './pages/PerformanceAnalyticsDashboard';

<Route path="/admin/performance-analytics" element={
  <LayoutWrapper currentPageName="PerformanceAnalyticsDashboard">
    <PerformanceAnalyticsDashboard />
  </LayoutWrapper>
} />
```

## Measurement Patterns

### Measure API calls
```javascript
import { performanceMonitor } from '@/lib/performanceMonitoring';

const fetchData = async () => {
  return performanceMonitor.measureApiCall(
    'fetchUsers',
    () => base44.entities.Contractor.list(),
    { entity: 'Contractor' }
  );
};

const { result: contractors, duration } = await fetchData();
console.log(`Fetched ${contractors.length} contractors in ${duration}ms`);
```

### Measure React component lifecycle
```javascript
import { performanceMonitor } from '@/lib/performanceMonitoring';

export default function MyComponent() {
  useEffect(() => {
    performanceMonitor.startTimer('component_mount');
    
    return () => {
      performanceMonitor.stopTimer(
        'component_mount',
        METRIC_TYPES.PAGE_LOAD,
        { component: 'MyComponent' }
      );
    };
  }, []);

  // ... component code
}
```

### Measure expensive operations
```javascript
import { performanceMonitor } from '@/lib/performanceMonitoring';

async function processPayments(payments) {
  const { result, duration } = await performanceMonitor.measureFunction(
    'batch_payments',
    () => batchProcessPayments(payments),
    { count: payments.length }
  );
  
  console.log(`Processed ${payments.length} payments in ${duration}ms`);
  return result;
}
```

### Debounce metric recording
```javascript
import { performanceMonitor, debounce } from '@/lib/rateLimiter';

const recordSearchMetric = debounce((query) => {
  performanceMonitor.recordMetric(
    METRIC_TYPES.USER_ACTION,
    Date.now() - searchStartTime,
    { query, results: resultCount }
  );
}, 500);
```

## Performance Thresholds

### Ideal Performance
- API Response: < 200ms
- Page Load: < 2s
- Function Execution: < 100ms
- FID (First Input Delay): < 100ms
- LCP (Largest Contentful Paint): < 2.5s
- CLS (Cumulative Layout Shift): < 0.1

### Acceptable Performance
- API Response: 200-500ms
- Page Load: 2-5s
- Function Execution: 100-500ms

### Poor Performance (Alert)
- API Response: > 500ms
- Page Load: > 5s
- Function Execution: > 500ms

## Core Web Vitals

Automatically measured when `setupWebVitalsMonitoring()` is called:

1. **Largest Contentful Paint (LCP)**
   - Measures visual completeness
   - Good: < 2.5s

2. **First Input Delay (FID)**
   - Measures interactivity
   - Good: < 100ms

3. **Cumulative Layout Shift (CLS)**
   - Measures visual stability
   - Good: < 0.1

## Querying Metrics

### Get all API latency metrics
```javascript
const apiMetrics = await base44.asServiceRole.entities.PerformanceMetric.filter({
  metric_type: 'api_latency'
}, '-created_date', 100);
```

### Get recent error metrics
```javascript
const errors = await base44.asServiceRole.entities.PerformanceMetric.filter({
  status: 'error'
}, '-created_date', 50);
```

### Get page load times
```javascript
const pageLoads = await base44.asServiceRole.entities.PerformanceMetric.filter({
  metric_type: 'page_load'
}, '-created_date', 100);

const avgPageLoad = pageLoads.reduce((sum, m) => sum + m.value, 0) / pageLoads.length;
```

## Alerting

Set up alerts for performance degradation:

```javascript
async function checkPerformance() {
  const recent = await base44.asServiceRole.entities.PerformanceMetric.filter({
    metric_type: 'api_latency'
  }, '-created_date', 50);

  const avg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;

  if (avg > 500) {
    await base44.integrations.Core.SendEmail({
      to: 'admin@example.com',
      subject: '[ALERT] High API Latency',
      body: `Average API latency: ${avg}ms`
    });
  }
}
```

## Best Practices

1. **Measure strategically** - Focus on user-impacting operations
2. **Use batching** - Metrics are batched and flushed automatically
3. **Include context** - Add metadata to understand what was measured
4. **Monitor trends** - Track performance over time, not just individual requests
5. **Set thresholds** - Know what "slow" means for your app
6. **Act on data** - Use metrics to identify and fix performance bottlenecks
7. **Segment metrics** - Track performance by endpoint, user type, device
8. **Archive old data** - Keep dashboard responsive with retention policy

## Troubleshooting

**Metrics not appearing:**
- Check browser dev tools for console errors
- Verify `logPerformanceMetrics` function deployed
- Check PerformanceMetric entity exists

**Missing Core Web Vitals:**
- Call `setupWebVitalsMonitoring()` in App
- Check browser supports PerformanceObserver
- Allow time for metrics to accumulate

**High error rate:**
- Review what operations are failing
- Check if operations are actually timing out
- Verify metrics are being recorded correctly

## Next Steps

1. Deploy performance monitoring
2. Establish performance baselines
3. Set up alert thresholds
4. Review dashboard weekly
5. Optimize identified bottlenecks
6. Monitor improvements