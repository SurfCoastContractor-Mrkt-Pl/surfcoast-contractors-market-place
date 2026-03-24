/**
 * Secure Payment Validation Utility
 * Prevents sensitive data exposure in logs/errors
 */

export function validatePaymentRequest(body) {
  const errors = [];

  // Reject raw card data
  if (body.card || body.cardNumber || body.cvv || body.token) {
    errors.push('Invalid request structure');
  }

  // Required fields
  if (!body.payerEmail?.trim()) errors.push('Missing payer email');
  if (!body.payerName?.trim()) errors.push('Missing payer name');
  if (!body.payerType) errors.push('Missing payer type');
  if (!body.idempotencyKey?.trim()) errors.push('Missing idempotency key');

  // Email format
  if (body.payerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.payerEmail)) {
    errors.push('Invalid email format');
  }

  return { valid: errors.length === 0, errors };
}

export function sanitizePaymentError(error) {
  const message = String(error?.message || '').toLowerCase();
  
  // Log generic version internally, return safe version to client
  if (message.includes('stripe')) {
    console.error('Payment processing error - Stripe API');
    return 'Payment processing failed';
  }
  if (message.includes('database') || message.includes('entity')) {
    console.error('Payment processing error - Database');
    return 'Payment processing failed';
  }
  if (message.includes('auth') || message.includes('unauthorized')) {
    console.error('Payment processing error - Authorization');
    return 'Unauthorized';
  }
  
  console.error('Payment processing error - Unknown');
  return 'Payment processing failed';
}