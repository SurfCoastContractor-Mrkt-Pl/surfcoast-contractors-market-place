# Activity & Audit Logging System

## Overview
Comprehensive audit trail tracking all user actions, data changes, and security events for compliance, debugging, and forensic analysis.

## Components

### 1. Audit Logger Library (`lib/auditLogging.js`)
Client-side logging with offline queue persistence.

**Action Types:**
- CREATE, READ, UPDATE, DELETE
- LOGIN, LOGOUT, EXPORT, IMPORT
- PAYMENT, APPROVE, REJECT
- DOWNLOAD, UPLOAD, SHARE, ACCESS

**Entity Types:**
- User, Contractor, Customer, Job, Scope
- Payment, Message, Review, Document
- Proposal, Quote, Dispute, System

**Severity Levels:**
- LOW - Normal user actions
- MEDIUM - Data modifications
- HIGH - Security-sensitive operations
- CRITICAL - System changes, breaches

**Usage:**
```javascript
import { 
  auditLogger, 
  ACTION_TYPES, 
  ENTITY_TYPES,
  SEVERITY_LEVELS,
  logUserAction,
  logDataChange,
  logSecurityEvent
} from '@/lib/auditLogging';

// Log custom action
await auditLogger.log({
  actionType: ACTION_TYPES.UPDATE,
  entityType: ENTITY_TYPES.CONTRACTOR,
  entityId: 'contractor-123',
  entityName: 'John Smith',
  userId: 'user-456',
  userEmail: 'admin@example.com',
  description: 'Updated contractor profile',
  severity: SEVERITY_LEVELS.MEDIUM,
  changes: { field: 'phone_number' },
  metadata: { region: 'California' }
});

// Log user action (helper)
await logUserAction(
  ACTION_TYPES.APPROVE,
  { type: ENTITY_TYPES.QUOTE, id: 'quote-123', name: 'Quote #456' },
  'user-789'
);

// Log data change with before/after
await logDataChange(
  { type: ENTITY_TYPES.JOB, id: 'job-123', name: 'Kitchen Remodel' },
  { status: true },
  'user-789',
  { status: 'pending' },
  { status: 'approved' }
);

// Log security event
await logSecurityEvent(
  'Multiple failed login attempts detected',
  'user-789',
  SEVERITY_LEVELS.HIGH,
  { attempts: 5, timeframe: '5 minutes' }
);
```

### 2. Activity Log Entity (`entities/ActivityLog.json`)
Database schema for storing audit records.

**Key Fields:**
- `action_type` - What action was taken
- `entity_type` - What was affected
- `entity_id` / `entity_name` - Which specific record
- `user_id` / `user_email` - Who did it
- `description` - Human-readable summary
- `severity` - LOW to CRITICAL
- `changes` - JSON of what changed (before/after)
- `ip_address` - Client IP for forensics
- `user_agent` - Browser info
- `reviewed` - Admin review status
- `review_notes` - Admin notes

### 3. Backend Logger (`functions/logActivity.js`)
Secure server-side logging with critical alerts.

**Features:**
- Logs all activity to database
- Captures client IP from headers
- Sends email alerts for critical events
- Validates required fields
- Graceful degradation if logging fails

### 4. Admin Dashboard (`pages/ActivityAuditDashboard.jsx`)
UI for reviewing and auditing activities.

**Features:**
- Filter by severity, action type, entity
- Track review status
- Add review notes
- Statistics dashboard
- Timestamp tracking

## Setup

### 1. Initialize in App.jsx
```jsx
import { auditLogger } from '@/lib/auditLogging';

useEffect(() => {
  auditLogger.loadQueueFromLocalStorage();
}, []);
```

### 2. Add Route
```jsx
import ActivityAuditDashboard from './pages/ActivityAuditDashboard';

<Route path="/admin/audit-log" element={
  <LayoutWrapper currentPageName="ActivityAuditDashboard">
    <ActivityAuditDashboard />
  </LayoutWrapper>
} />
```

### 3. Log Actions in Components
```jsx
import { logUserAction, ACTION_TYPES, ENTITY_TYPES } from '@/lib/auditLogging';

async function handleApproveQuote(quote, userId) {
  await approveQuote(quote.id);
  
  await logUserAction(
    ACTION_TYPES.APPROVE,
    { type: ENTITY_TYPES.QUOTE, id: quote.id, name: quote.title },
    userId
  );
}
```

## Common Patterns

### Log on create
```javascript
const newJob = await base44.entities.Job.create(jobData);
await logUserAction(
  ACTION_TYPES.CREATE,
  { type: ENTITY_TYPES.JOB, id: newJob.id, name: newJob.title },
  currentUser.id
);
```

### Log on update with changes
```javascript
const oldData = existingRecord;
const newData = { ...oldData, ...updates };

await base44.entities.Job.update(jobId, updates);

await logDataChange(
  { type: ENTITY_TYPES.JOB, id: jobId, name: newData.title },
  updates,
  currentUser.id,
  oldData,
  newData
);
```

### Log on delete
```javascript
await base44.entities.Job.delete(jobId);

await logUserAction(
  ACTION_TYPES.DELETE,
  { type: ENTITY_TYPES.JOB, id: jobId, name: oldData.title },
  currentUser.id
);
```

### Log security event
```javascript
import { logSecurityEvent, SEVERITY_LEVELS } from '@/lib/auditLogging';

await logSecurityEvent(
  `Unauthorized access attempt to sensitive document ${docId}`,
  currentUser.id,
  SEVERITY_LEVELS.HIGH,
  { documentId: docId, attempt: 'view' }
);
```

### Log payments
```javascript
await logUserAction(
  ACTION_TYPES.PAYMENT,
  { type: ENTITY_TYPES.PAYMENT, id: payment.id, name: `$${payment.amount}` },
  currentUser.id
);
```

## Compliance & Retention

### Data Retention
- Keep all logs indefinitely (storage is cheap)
- Or implement archival: logs older than 1 year → archive storage
- Or implement retention: delete logs after X years per compliance

### Audit Requirements
- GDPR: Right to be forgotten (archive instead of delete)
- SOC 2: 1 year retention recommended
- HIPAA: 6 years minimum
- PCI-DSS: 1 year minimum

### Export for Compliance
```javascript
// Query all activities for a user in date range
const logs = await base44.asServiceRole.entities.ActivityLog.filter({
  user_email: 'user@example.com',
  created_date: { $gte: '2026-01-01', $lte: '2026-03-31' }
});

// Export to CSV for audit
exportToCSV(logs);
```

## Best Practices

1. **Log at the right level** - Create/update/delete, not every read
2. **Include context** - Add metadata to understand the "why"
3. **Review regularly** - Set aside time to review critical events
4. **Archive old logs** - Keep system responsive
5. **Protect log integrity** - Admin-only access
6. **Track changes** - Always log before/after for updates
7. **Security first** - Log security events with high severity
8. **User-friendly** - Use ACTION_LABELS in UI

## Querying Examples

### Find all deletions
```javascript
const deletions = await base44.asServiceRole.entities.ActivityLog.filter({
  action_type: 'delete'
}, '-created_date', 100);
```

### Find critical events
```javascript
const critical = await base44.asServiceRole.entities.ActivityLog.filter({
  severity: 'critical'
}, '-created_date', 100);
```

### Find user's recent activity
```javascript
const userActivity = await base44.asServiceRole.entities.ActivityLog.filter({
  user_email: 'user@example.com'
}, '-created_date', 50);
```

### Find unreviewed activity
```javascript
const unreviewed = await base44.asServiceRole.entities.ActivityLog.filter({
  reviewed: false
}, '-created_date', 100);
```

## Integration Points

### Payment System
```javascript
// In payment webhook handler
await logUserAction(
  ACTION_TYPES.PAYMENT,
  { type: ENTITY_TYPES.PAYMENT, id: payment.id, name: `$${amount}` },
  null, // system action
  { status: paymentStatus, amount, currency: 'USD' }
);
```

### Authentication
```javascript
// On login success
await logSecurityEvent(`User login from IP ${ip}`, userId, SEVERITY_LEVELS.LOW);

// On login failure
await logSecurityEvent(
  `Failed login attempt from IP ${ip}`,
  null,
  SEVERITY_LEVELS.MEDIUM,
  { ip, email, attempts }
);
```

### Document Management
```javascript
// On export
await logUserAction(
  ACTION_TYPES.EXPORT,
  { type: ENTITY_TYPES.DOCUMENT, id: docId, name: docName },
  userId,
  { format: 'pdf', pages: 15 }
);
```

## Troubleshooting

**Logs not appearing:**
- Check that `logActivity` function deployed
- Verify ActivityLog entity created
- Check browser console for errors

**Too many logs:**
- Consider raising thresholds for what gets logged
- Filter out low-importance READ actions
- Archive older logs

**Performance issues:**
- Add indexes on common query fields (user_email, action_type, severity)
- Archive/delete old logs
- Implement pagination on dashboard

## Next Steps

1. Integrate logging into core workflows (create, update, delete)
2. Set up admin review process for critical events
3. Configure email alerts for critical actions
4. Create audit reports for compliance
5. Implement log retention policy