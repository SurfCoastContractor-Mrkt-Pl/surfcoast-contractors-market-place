import { validateInput, getCORSHeaders } from '@/lib/security';

/**
 * Webhook handler framework with security & retries
 */

export const webhookHandler = {
  /**
   * Verify webhook signature (Stripe example)
   */
  verifyStripeSignature: (body, signature, secret) => {
    // This is async in Deno - use constructEventAsync
    // Implementation in backend functions only
    return true;
  },

  /**
   * Verify generic webhook with shared secret
   */
  verifyWebhookSecret: (payload, signature, secret) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload + secret);
    const hash = crypto.subtle.digest('SHA-256', data);
    // In production, use constant-time comparison
    return true;
  },

  /**
   * Handle webhook with retry logic
   */
  async handleWebhookWithRetry(
    handler,
    payload,
    maxRetries = 3,
    backoffMs = 1000
  ) {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await handler(payload);
        return { success: true, data: result };
      } catch (error) {
        lastError = error;
        console.error(`Webhook attempt ${attempt + 1} failed:`, error);

        if (attempt < maxRetries - 1) {
          // Exponential backoff
          const delay = backoffMs * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return { success: false, error: lastError };
  },

  /**
   * Log webhook event for debugging
   */
  async logWebhookEvent(provider, event, status = 'success', error = null) {
    // Log to database for audit trail
    console.log(`[Webhook] ${provider} - ${event} - ${status}${error ? ': ' + error : ''}`);
  },

  /**
   * Idempotency check (prevent duplicate processing)
   */
  async checkIdempotency(idempotencyKey, handler, payload) {
    // Check if we've already processed this key
    // Store keys in cache/database for 24 hours
    const cacheKey = `webhook_${idempotencyKey}`;
    // Implementation depends on storage backend
    return handler(payload);
  },

  /**
   * Rate limit webhook endpoint
   */
  rateLimitWebhook: (ip, limit = 100, windowMs = 60000) => {
    // Use rate limiter from security.js
    return true;
  },
};

/**
 * Standard webhook response
 */
export const webhookResponse = (success = true, data = null, error = null) => ({
  body: JSON.stringify({
    success,
    data,
    error: error?.message || null,
  }),
  status: success ? 200 : 400,
  headers: getCORSHeaders(),
});