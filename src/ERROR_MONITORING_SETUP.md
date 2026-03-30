# Error Monitoring System Setup

## Overview
Complete error monitoring infrastructure for tracking, logging, and managing platform errors in real-time.

## Components

### 1. Error Monitoring Library (`lib/errorMonitoring.js`)
Core error tracking with queue persistence and offline support.

**Features:**
- Automatic error capture and logging
- Offline queue with localStorage persistence
- Global error handlers (uncaught exceptions, promise rejections)
- Categorization and severity levels
- Configurable context enrichment

**Usage:**
```javascript
import { errorMonitor, ERROR_LEVELS, ERROR_CATEGORIES } from '@/lib/errorMonitoring';

// Log an error
errorMonitor.logError({
  message: 'Payment processing failed',
  level: ERROR_LEVELS.ERROR,
  category: ERROR_CATEGORIES.PAYMENT,
  error: err,
  context: { orderId: '123', amount: 99.99 },
  userId: 'user-id'
});

// Setup global handlers (in App.jsx)
import { setupGlobalErrorHandlers } from '@/lib/errorMonitoring';
setupGlobalErrorHandlers();
```

### 2. Backend Error Logging (`functions/logErrorEvent.js`)
Secure backend function to persist errors to database.

**Features:**
- Validates error data
- Creates database records
- Alerts admins for critical errors
- Prevents exposure of internal errors

### 3. Error Log Entity (`entities/ErrorLog.json`)
Database schema for storing error logs.

**Fields:**
- message (required)
- level (info, warning, error, critical)
- category (auth, validation, network, database, payment, etc.)
- stack trace and context
- resolution status and notes

**RLS:** Only admins can read/update errors

### 4. Enhanced Error Boundary (`components/errors/ErrorBoundaryEnhanced.jsx`)
React error boundary with automatic error logging.

**Features:**
- Catches React component errors
- Generates unique error IDs
- Logs to monitoring system
- Shows user-friendly error UI
- Dev mode error details

**Usage:**
```jsx
import ErrorBoundaryEnhanced from '@/components/errors/ErrorBoundaryEnhanced';

<ErrorBoundaryEnhanced>
  <MyComponent />
</ErrorBoundaryEnhanced>
```

### 5. Admin Dashboard (`pages/ErrorMonitoringDashboard.jsx`)
Admin interface for monitoring and resolving errors.

**Features:**
- Real-time error list
- Filter by level, category, status
- Stats (total, critical, unresolved)
- Mark errors as resolved with notes
- Unresolve errors

## Setup Instructions

### 1. Initialize in App.jsx
```jsx
import { setupGlobalErrorHandlers } from '@/lib/errorMonitoring';
import ErrorBoundaryEnhanced from '@/components/errors/ErrorBoundaryEnhanced';

useEffect(() => {
  setupGlobalErrorHandlers();
}, []);

return (
  <ErrorBoundaryEnhanced>
    <YourApp />
  </ErrorBoundaryEnhanced>
);
```

### 2. Add Route (in App.jsx)
```jsx
<Route path="/admin/error-monitoring" element={
  <LayoutWrapper currentPageName="ErrorMonitoringDashboard">
    <ErrorMonitoringDashboard />
  </LayoutWrapper>
} />
```

### 3. Verify Backend Function
- Check that `logErrorEvent` deployed successfully
- Verify `ADMIN_ALERT_EMAIL` is set in secrets

## Error Severity Levels

- **info** - Informational messages, no action needed
- **warning** - Potential issues, investigate
- **error** - Failures affecting users, needs attention
- **critical** - System failures, alerts admin immediately

## Error Categories

- **auth** - Authentication/authorization errors
- **validation** - Input validation failures
- **network** - Network/API failures
- **database** - Database errors
- **payment** - Payment processing errors
- **file_upload** - File upload failures
- **permission** - Permission/access errors
- **unknown** - Uncategorized errors

## Features

### Offline Support
Errors are queued locally and sent when online reconnects.

### Error Context
Rich context can be attached to errors:
```javascript
errorMonitor.logError({
  message: 'Quote creation failed',
  category: ERROR_CATEGORIES.DATABASE,
  context: {
    quoteId: '123',
    contractorId: 'c-456',
    phase: 'approval'
  }
});
```

### Critical Error Alerts
Critical errors trigger admin email notifications with full context.

### Development Mode
In dev mode, error details are logged to console and shown in error boundary.

## Monitoring Best Practices

1. **Log context with errors** - Include relevant IDs, data, and state
2. **Use appropriate levels** - Don't mark all errors as critical
3. **Review regularly** - Check dashboard for patterns
4. **Resolve promptly** - Mark investigated errors as resolved with notes
5. **Setup alerts** - Critical errors already trigger admin email

## Next Steps

1. Test error logging by triggering an error
2. Verify error appears in dashboard
3. Check error queue with offline mode
4. Monitor critical errors in production