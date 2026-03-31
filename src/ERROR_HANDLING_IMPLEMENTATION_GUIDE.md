# Error Handling Implementation Guide

This guide provides standardized patterns for error handling across the SurfCoast platform.

## Frontend Error Handling

### Global Error Boundary

The `ErrorBoundary` component in `lib/ErrorBoundary.jsx` automatically catches rendering errors:

```jsx
// Already wrapped in App.jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Features:**
- Catches unhandled rendering errors
- Logs errors to backend ErrorLog entity
- Provides user-friendly UI with recovery options
- Shows error details in development mode
- Auto-escalates to "critical" after 2+ errors

### Using ErrorAlert Component

Display user-friendly error messages in your components:

```jsx
import ErrorAlert from '@/components/ui/ErrorAlert';

export default function MyComponent() {
  const [error, setError] = useState(null);

  const handleAction = async () => {
    try {
      const response = await base44.functions.invoke('myFunction', {});
    } catch (err) {
      setError(err);
    }
  };

  return (
    <>
      <ErrorAlert 
        error={error}
        title="Operation Failed"
        onDismiss={() => setError(null)}
        showDetails={true}
      />
      <button onClick={handleAction}>Do Action</button>
    </>
  );
}
```

## Backend Error Handling Pattern

### Template for All Backend Functions

```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  let base44 = null;
  let user = null;

  try {
    base44 = createClientFromRequest(req);
    user = await base44.auth.me();

    // --- AUTHENTICATION CHECK ---
    if (!user) {
      return Response.json(
        { 
          error: 'Authentication required. Please log in to proceed.',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // --- AUTHORIZATION CHECK (if needed) ---
    if (user.role !== 'admin') {
      return Response.json(
        { 
          error: 'Admin access required. You do not have permission to perform this action.',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // --- PARSE REQUEST ---
    const body = await req.json();
    const { field1, field2 } = body;

    // --- VALIDATE INPUT ---
    if (!field1 || !field2) {
      return Response.json(
        { 
          error: 'Missing required fields: field1, field2.',
          code: 'BAD_REQUEST'
        },
        { status: 400 }
      );
    }

    // --- YOUR BUSINESS LOGIC ---
    const result = await base44.entities.SomeEntity.create({
      field1,
      field2
    });

    // --- SUCCESS RESPONSE ---
    return Response.json({ success: true, data: result });

  } catch (error) {
    // --- ERROR LOGGING ---
    console.error('[functionName] Error:', error.message, error.stack);

    if (base44) {
      try {
        await base44.asServiceRole.entities.ErrorLog.create({
          message: error.message || 'Unknown error',
          stack: error.stack || '',
          level: 'error',
          type: 'functionName',
          metadata: {
            userId: user?.email || 'anonymous',
            timestamp: new Date().toISOString(),
            errorType: error.constructor.name
          }
        }).catch(() => {}); // Silently fail if logging fails
      } catch (logError) {
        console.error('[functionName] Failed to log error:', logError.message);
      }
    }

    // --- ERROR RESPONSE ---
    return Response.json(
      { 
        error: 'An unexpected server error occurred. Please try again later.',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
});
```

## Error Response Format

All backend functions should return responses in this format:

### Success Response (200/201)
```json
{
  "success": true,
  "data": { /* actual data */ }
}
```

### Error Response
```json
{
  "error": "User-friendly error message",
  "code": "ERROR_CODE"
}
```

## HTTP Status Codes

- **400 Bad Request**: Invalid input, missing fields, validation failed
- **401 Unauthorized**: User not authenticated
- **403 Forbidden**: User authenticated but lacks permission
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Resource already exists or conflict
- **500 Internal Server Error**: Unexpected server error

## User-Friendly Error Messages

**DO:**
- "Authentication required. Please log in to proceed."
- "Admin access required. You do not have permission to perform this action."
- "Missing required fields: email, password."
- "An unexpected server error occurred. Please try again later."

**DON'T:**
- "NullPointerException in line 42"
- "Stripe API returned 402"
- "Database connection timeout"
- Expose internal implementation details

## Error Codes

Use these standardized error codes:

| Code | Status | Meaning |
|------|--------|---------|
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Permission denied |
| BAD_REQUEST | 400 | Invalid input |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| INTERNAL_SERVER_ERROR | 500 | Server error |

## Migration Checklist

When updating existing backend functions:

- [ ] Add `try-catch` wrapper around entire handler
- [ ] Move authentication check to top (after `base44` init)
- [ ] Move authorization check after authentication
- [ ] Add input validation with clear error messages
- [ ] Add error logging to ErrorLog entity
- [ ] Return standardized error responses
- [ ] Use user-friendly error messages
- [ ] Add error code to responses
- [ ] Test 401, 403, and 500 error paths
- [ ] Test with invalid input
- [ ] Verify error logging works

## Testing Error Scenarios

### Test 401 (Unauthorized)
```javascript
// Function should return 401 if user is not authenticated
const response = await fetch('/api/myFunction', {
  method: 'POST',
  body: JSON.stringify({})
});
// Should return 401 with UNAUTHORIZED code
```

### Test 403 (Forbidden)
```javascript
// Function should return 403 if user is not admin
const response = await fetch('/api/adminFunction', {
  method: 'POST',
  headers: { Authorization: 'Bearer user-token' },
  body: JSON.stringify({})
});
// Should return 403 with FORBIDDEN code
```

### Test Input Validation
```javascript
// Function should return 400 if required fields missing
const response = await fetch('/api/myFunction', {
  method: 'POST',
  body: JSON.stringify({})
});
// Should return 400 with BAD_REQUEST code
```

## References

- ErrorLog Entity: stores all errors with level, type, and metadata
- ErrorBoundary Component: catches frontend rendering errors
- ErrorAlert Component: displays user-friendly error messages
- backendErrorHandler Utility: provides helper functions (can be extended)