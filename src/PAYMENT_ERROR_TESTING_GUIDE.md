# Payment Error Handling — Testing Guide

## Phase 1b: Payment Flow Error Handling & Logging

This guide outlines comprehensive test scenarios for validating error handling, user feedback, and logging across all payment critical paths.

---

## Test Scenarios

### 1. Missing Configuration (Backend)

**Condition**: `STRIPE_QUOTE_PRICE_ID` or tier-specific price ID is missing from environment variables.

**Expected Behavior**:
- Backend logs error with context: `Missing price ID for tier 'quote' - check environment variables`
- Returns HTTP 500 with user-friendly message: `"Payment configuration error. Please contact support."`
- Error code: `CONFIG_ERROR`

**Frontend**:
- User sees `PaymentErrorDisplay` with message
- No retry button (non-retryable error)

**Test Command**:
```bash
# Temporarily unset STRIPE_QUOTE_PRICE_ID, trigger payment, check logs
```

---

### 2. Network Error During Session Creation

**Condition**: Network timeout or connectivity loss when calling `stripe.checkout.sessions.create()`.

**Expected Behavior**:
- Backend logs Stripe error with full context:
  ```
  Payment checkout: Stripe session creation failed for user@example.com
  {
    stripeErrorCode: "api_connection_error",
    stripeErrorMessage: "...",
    tier: "quote"
  }
  ```
- Returns HTTP 500 with message: `"Failed to create checkout session. Please try again."`
- Error code: `STRIPE_SESSION_ERROR`

**Frontend**:
- User sees error alert with "Try Again" button
- Retry button triggers new payment attempt

**Test Command**:
```bash
# Use browser dev tools to throttle network, trigger payment
```

---

### 3. Database Save Failure (Non-Critical)

**Condition**: Payment record update fails after session creation succeeds.

**Expected Behavior**:
- Backend logs warning:
  ```
  Payment checkout: Failed to save session to database for user@example.com
  {
    sessionId: "cs_test_...",
    paymentId: "...",
    dbErrorMessage: "..."
  }
  ```
- **Does NOT fail the request** — session is created, user can still proceed
- Returns success response with session ID and checkout URL

**Frontend**:
- Payment proceeds normally
- User is redirected to Stripe checkout

**Note**: This graceful degradation ensures users aren't blocked if the DB is temporarily unavailable.

---

### 4. Iframe Detection (Frontend)

**Condition**: User attempts checkout from within an iframe (admin preview).

**Expected Behavior**:
- Frontend detects iframe via `checkCheckoutEnvironment()`
- **Blocks** checkout before backend call
- User sees alert: `"Checkout must be accessed from the published app, not an embedded preview."`

**Frontend**:
- `PaymentGate` component renders error state
- No payment request is made

**Test Command**:
```bash
# Try payment in app preview (iframe) vs published app
```

---

### 5. Missing Required Fields (Validation)

**Condition**: Payment request missing `payerEmail`, `payerName`, or `payerType`.

**Expected Behavior**:
- Backend validates input before API calls
- Returns HTTP 400 with validation error message
- Error code: `VALIDATION_ERROR`

**Frontend**:
- User sees error message: `"Please check your payment information."`
- No retry button (validation errors aren't retryable)

**Test Command**:
```javascript
// Manually call initiatePaymentCheckout with missing fields
```

---

### 6. Duplicate Payment Detection

**Condition**: User clicks payment button twice (rapid clicks).

**Expected Behavior**:
- Backend detects duplicate via `idempotencyKey` (email + timestamp + random)
- Returns existing session instead of creating new one
- Logs: `Duplicate payment detected, reusing checkout session`

**Frontend**:
- User is redirected to same checkout URL
- No double charge occurs

**Test Command**:
```bash
# Rapidly click payment button, verify only 1 Stripe session created
```

---

### 7. Stripe Rate Limit

**Condition**: Stripe API rate limit exceeded (100+ requests/second).

**Expected Behavior**:
- Backend logs Stripe error: `"rate_limit_error"`
- Returns HTTP 429 (Too Many Requests)
- Error code: `STRIPE_ERROR`

**Frontend**:
- User sees: `"Payment provider error. Please try again."`
- Retry button available

**Note**: This is rare in production but important to handle gracefully.

---

### 8. Authentication Check (When Required)

**Condition**: Payment requires authentication, user not logged in.

**Expected Behavior**:
- Frontend checks `base44.auth.isAuthenticated()` in `PaymentGate`
- Shows login prompt: `"You must be logged in to proceed with this payment."`

**Frontend**:
- Button says "Login Now"
- Redirects to login flow on click

**Test Command**:
```bash
# Log out, trigger payment that requires auth
```

---

### 9. Invalid Tier/Price Configuration

**Condition**: Tier passed to backend doesn't exist in `PRICE_MAP`.

**Expected Behavior**:
- Backend logs warning: `No tier specified, using default 'quote'`
- Falls back to quote price
- OR returns error if tier is explicitly invalid

**Frontend**:
- Payment proceeds with default tier
- OR shows error if tier is required

---

### 10. Checkout Session Retrieval Failure

**Condition**: Stripe.checkout.sessions.retrieve() fails after redirect from Stripe.

**Expected Behavior**:
- Backend logs error during verification
- User sees message: `"Failed to verify payment. Contact support."`

**Frontend**:
- Webhook handler gracefully handles missing session
- Payment is marked as pending pending verification

---

## Manual Testing Workflow

### Test Flow for Full Payment Journey

1. **Setup**:
   - Ensure all `STRIPE_*_PRICE_ID` secrets are set
   - Test in published app (not preview/iframe)
   - Use Stripe test mode: `sk_test_...`

2. **Happy Path**:
   ```bash
   - Navigate to payment page
   - Click "Pay" button
   - Verify: logs show successful session creation
   - Verify: redirected to Stripe checkout
   - Complete test payment with card: 4242 4242 4242 4242
   - Verify: webhook processes payment
   - Verify: user sees success message
   ```

3. **Error Paths**:
   ```bash
   - Missing env var: Unset STRIPE_QUOTE_PRICE_ID, trigger payment
   - Network error: Throttle network, trigger payment mid-request
   - Duplicate: Rapidly click payment button twice
   - Invalid tier: Call backend with tier="invalid_tier"
   ```

4. **Check Logs**:
   - Server logs: Full error context with user email, error code, tier
   - Browser console: Client-side error handling and user feedback
   - Stripe dashboard: Session creation logged

---

## Logging Validation Checklist

- [ ] Backend logs include user email (for debugging)
- [ ] Backend logs include error code (for categorization)
- [ ] Backend logs include tier/service type
- [ ] Backend logs include Stripe error details (if applicable)
- [ ] Frontend logs user-friendly messages (no internal details)
- [ ] PaymentErrorDisplay shows appropriate retry buttons
- [ ] Auto-dismiss works for transient errors
- [ ] All errors appear in server logs with timestamps

---

## Expected Log Format

**Successful Payment**:
```
✓ Payment checkout: Created session cs_test_... for user@example.com (tier: quote)
```

**Configuration Error**:
```
✗ Payment checkout: Missing price ID for tier 'quote' - check environment variables
  User: user@example.com | Error: CONFIG_ERROR
```

**Stripe Error**:
```
✗ Payment checkout: Stripe session creation failed for user@example.com
  Code: api_connection_error | Message: Connection timeout
  Tier: quote | Retry: YES
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Payment configuration error" | Missing `STRIPE_*_PRICE_ID` | Check dashboard → Settings → Environment Variables |
| "Checkout blocked from preview" | Running in iframe | Publish app or access directly |
| Double charge | Rapid clicks | Idempotency key implemented in backend |
| Missing session in DB | DB connection error | Non-critical; session is created in Stripe |

---

## Monitoring & Alerts

**Key Metrics to Monitor**:
- Payment error rate (should be <1%)
- Average time to session creation
- Retry rate (indicates transient errors)
- Iframe/preview block rate

**Alert Conditions**:
- Error rate > 5% in 1 hour
- CONFIG_ERROR appears (indicates misconfiguration)
- Duplicate payment detected repeatedly

---

## Next Steps

- [ ] Integration tests for all 10 scenarios
- [ ] E2E tests with Stripe mock
- [ ] Load testing (100+ concurrent payments)
- [ ] Sentry/error tracking integration
- [ ] Payment analytics dashboard

---