# Stripe Secret Management Security Pattern

## Context
This app uses Stripe for payment processing. The `STRIPE_SECRET_KEY` is accessed via `Deno.env.get('STRIPE_SECRET_KEY')` in multiple backend functions.

## Security Status
✅ **ACCEPTABLE** for serverless environments like Base44/Deno Deploy:
- Each function runs in an isolated process
- Environment variables are injected at runtime, not compiled into code
- Secrets are never logged or exposed in error messages
- All Stripe operations validate the secret exists before using it

## Implementation Pattern
All Stripe-dependent functions follow this pattern:

```javascript
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!secretKey) {
      console.error('STRIPE_SECRET_KEY not configured');
      return Response.json({ error: 'Stripe not configured' }, { status: 500 });
    }
    
    const stripe = new Stripe(secretKey);
    // ... use stripe API
  } catch (error) {
    // Never log the secret or full error details
    console.error('Stripe operation failed:', error.message);
    return Response.json({ error: 'Payment processing failed' }, { status: 500 });
  }
});
```

## Key Security Measures
1. ✅ Secret validation - check for existence before use
2. ✅ Never log secrets - error messages are sanitized
3. ✅ Runtime injection - secrets obtained at function invocation time
4. ✅ Isolated execution - each function runs in separate process
5. ✅ HTTPS only - all Stripe API calls are over HTTPS
6. ✅ Webhook verification - all webhooks verified with STRIPE_WEBHOOK_SECRET

## Monitoring & Auditing
- All payment operations are logged with timestamps
- No sensitive data (secret keys, full card numbers) are logged
- Failed transactions are tracked and reported to admin alerts
- Webhook events are deduplicated to prevent duplicate charges

## References
- [Stripe Security Best Practices](https://stripe.com/docs/security/best-practices)
- [OWASP: Secrets Management](https://owasp.org/www-community/attacks/Sensitive_Data_Exposure)