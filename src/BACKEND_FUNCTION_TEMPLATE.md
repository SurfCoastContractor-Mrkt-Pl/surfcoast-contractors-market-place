# Backend Function Template & Standards

Use this template for all new backend functions and when refactoring existing ones.

## Basic Template (with requestHandler utility)

```javascript
import { createRequestHandler } from '../lib/backendRequestHandler.js';
import { validators } from '../lib/validators.js';

const handler = async ({ base44, user, body, req }) => {
  // Your business logic here
  const result = await base44.entities.SomeEntity.create({
    field: body.field
  });

  return Response.json({ success: true, data: result });
};

export default createRequestHandler({
  requireAuth: true,
  requireAdmin: false,
  validateSchema: {
    field: (value) => validators.required(value, 'Field')
  },
  handler
});
```

## Advanced Template (custom validation & processing)

```javascript
import { createRequestHandler } from '../lib/backendRequestHandler.js';
import { validators, sanitize } from '../lib/validators.js';

const handler = async ({ base44, user, body, req }) => {
  // Sanitize input
  const email = sanitize.email(body.email);
  const amount = sanitize.toNumber(body.amount);

  // Additional business validation (beyond schema)
  if (amount < 100) {
    return Response.json(
      { error: 'Amount must be at least $100', code: 'BAD_REQUEST' },
      { status: 400 }
    );
  }

  // Your business logic
  const payment = await base44.asServiceRole.entities.Payment.create({
    email,
    amount,
    status: 'pending'
  });

  return Response.json({ success: true, data: payment });
};

export default createRequestHandler({
  requireAuth: true,
  requireAdmin: false,
  validateSchema: {
    email: (value) => validators.email(value),
    amount: (value) => validators.required(value, 'Amount')
  },
  handler
});
```

## Migration Steps for Existing Functions

1. **Import utilities**
   ```javascript
   import { createRequestHandler } from '../lib/backendRequestHandler.js';
   import { validators } from '../lib/validators.js';
   ```

2. **Extract handler logic** into a separate function

3. **Define validation schema** with validators

4. **Wrap with createRequestHandler**

5. **Remove manual auth/validation** checks (handler does this)

6. **Test error scenarios** (401, 403, 400)

## Validation Schema Examples

```javascript
validateSchema: {
  email: (value) => validators.email(value),
  password: (value) => validators.stringLength(value, 8, 128),
  age: (value) => validators.numberRange(value, 13, 120),
  website: (value) => validators.url(value),
  birthDate: (value) => validators.futureDate(value)
}
```

## Error Responses (automatic via handler)

- **401 Unauthorized**: User not authenticated
- **403 Forbidden**: User lacks permission
- **400 Bad Request**: Validation failed
- **500 Internal Server Error**: Unexpected error (logged to ErrorLog)

## Response Format

```javascript
// Success
{ success: true, data: { ... } }

// Error (automatic)
{ error: "User-friendly message", code: "ERROR_CODE" }
```

## Priority Functions to Migrate

1. Payment functions (`createPaymentCheckout`, `stripe-webhook`)
2. Auth functions (`contractorSignup`, `customerSignup`)
3. Data mutation functions (create, update, delete)
4. Integration functions (Stripe, Notion, HubSpot)
5. Admin functions (bulk operations, cleanups)

## Checklist for Each Migration

- [ ] Import utilities
- [ ] Wrap with createRequestHandler
- [ ] Define validateSchema
- [ ] Extract handler logic
- [ ] Remove manual auth checks
- [ ] Remove manual validation code
- [ ] Test with invalid input (400)
- [ ] Test without auth (401)
- [ ] Test with non-admin user (403)
- [ ] Verify error logging to ErrorLog