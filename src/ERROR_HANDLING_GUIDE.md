# Error Handling & User Feedback Guide

## Overview
This guide establishes consistent error handling patterns across SurfCoast Marketplace to improve user experience and debugging.

## Core Components

### 1. Error Classification (`lib/errorHandler.js`)
Automatically classifies errors into types:
- **NETWORK**: Connection issues
- **VALIDATION**: Invalid input/data
- **AUTH**: Authentication/login failures
- **PAYMENT**: Stripe or payment processing errors
- **PERMISSION**: Insufficient permissions
- **SERVER**: 5xx errors
- **UNKNOWN**: Unclassified errors

### 2. Error Display Component (`components/ui/ErrorAlert.jsx`)
Reusable alert component for displaying errors to users:
```jsx
<ErrorAlert 
  message="Payment failed. Please try again."
  title="Payment Error"
  onDismiss={() => setError(null)}
  autoClose={true}
  autoCloseDelay={5000}
/>
```

### 3. Form Error Hook (`hooks/useFormErrors.js`)
Manage form-level and field-level errors:
```jsx
const { formError, setError, setFieldError, getFieldError, clearAllErrors } = useFormErrors();
```

## Critical Paths to Implement

### Payment Flows
- [ ] Stripe checkout: Network & payment error handling
- [ ] Payment confirmation: Validation & server error handling
- [ ] Payout setup: Auth & permission checks

### Form Submissions
- [ ] Contractor onboarding: Field validation feedback
- [ ] Job posting: Validation & permission checks
- [ ] Messaging: Rate limits & auth errors

### Authentication
- [ ] Login: Network, credential validation, server errors
- [ ] Signup: Email validation, duplicate account checks
- [ ] Account recovery: Email verification, rate limits

### File Uploads
- [ ] Document uploads: File type/size validation
- [ ] Photo uploads: Format, dimension validation
- [ ] Resume handling: Network retry on failure

## Implementation Pattern

### For Async Operations
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  clearAllErrors();
  
  try {
    const result = await base44.entities.Task.create(data);
    // Success handling
  } catch (error) {
    setError(error, 'Task Creation');
  }
};
```

### For Mutations
```jsx
const mutation = useMutation({
  mutationFn: async (data) => {
    return base44.entities.Contractor.create(data);
  },
  onError: (error) => {
    setError(error, 'Contractor Creation');
  },
  onSuccess: (data) => {
    // Reset and redirect
  },
});
```

### For Field Validation
```jsx
const handleEmailChange = (value) => {
  setEmail(value);
  
  if (!value.includes('@')) {
    setFieldError('email', 'Invalid email format');
  } else {
    clearFieldError('email');
  }
};
```

## Testing Checklist

### Network Errors
- [ ] Offline mode triggers appropriate error
- [ ] Retry mechanism works
- [ ] User can dismiss and retry

### Validation Errors
- [ ] Required field shows specific error
- [ ] Format validation shows guidance
- [ ] Multiple errors display clearly

### Payment Errors
- [ ] Stripe errors show user-friendly message
- [ ] Failed payment doesn't create duplicate
- [ ] User can retry without re-entering full info

### Auth Errors
- [ ] 401 redirects to login
- [ ] 403 shows permission message
- [ ] Session expiry handled gracefully

## Logging & Debugging

All errors are logged via `logError()` with:
- Timestamp
- Context/location
- Error message & stack
- Error type classification
- Additional metadata

Logs appear in browser console with `[Context]` prefix:
```
[Payment Checkout] {
  timestamp: "2026-03-26T14:32:10.000Z",
  type: "PAYMENT",
  message: "Invalid token",
  ...
}
```

## Migration Path

1. **Phase 1a** (Current): Core error utilities in place
2. **Phase 1b** (Next): Refactor payment flows (highest impact)
3. **Phase 1c**: Refactor auth flows
4. **Phase 1d**: Refactor form submissions
5. **Phase 1e**: Refactor file uploads

## Future Enhancements

- [ ] Error tracking service (Sentry integration)
- [ ] User-reported error feedback
- [ ] Error analytics dashboard
- [ ] Automatic retry with exponential backoff
- [ ] Error recovery suggestions