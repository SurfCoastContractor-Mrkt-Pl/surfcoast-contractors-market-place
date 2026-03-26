/**
 * Frontend payment utilities
 * Handles checkout initialization and error management
 */

import { checkCheckoutEnvironment, getPaymentErrorMessage, classifyPaymentError } from './paymentErrorHandler';

// Generate UUID in browser
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Initialize payment checkout
 */
export async function initiatePaymentCheckout({
  payerEmail,
  payerName,
  payerType,
  contractorId = null,
  contractorEmail = null,
  contractorName = null,
  tier = 'quote',
  quoteMetaParam = '',
  onError,
  onLoading,
}) {
  try {
    // Check iframe
    checkCheckoutEnvironment();
    onLoading?.(true);

    // Generate idempotency key
    const idempotencyKey = `${payerEmail}-${generateId()}`;

    // Call backend
    const response = await fetch('/functions/createPaymentCheckout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payerEmail,
        payerName,
        payerType,
        contractorId,
        contractorEmail,
        contractorName,
        idempotencyKey,
        tier,
        quoteMetaParam,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error || 'Payment initialization failed');
      error.code = data.code;
      throw error;
    }

    if (data.duplicate) {
      console.warn('Duplicate payment detected, reusing existing checkout');
    }

    return {
      sessionId: data.sessionId,
      paymentId: data.paymentId,
      checkoutUrl: data.url,
      isDuplicate: data.duplicate,
    };
  } catch (error) {
    const errorMsg = getPaymentErrorMessage(error);
    onError?.(errorMsg);
    throw {
      type: classifyPaymentError(error),
      message: errorMsg,
      originalError: error,
    };
  } finally {
    onLoading?.(false);
  }
}

/**
 * Redirect to Stripe checkout
 */
export function redirectToCheckout(checkoutUrl) {
  if (!checkoutUrl) {
    throw new Error('No checkout URL provided');
  }
  window.location.href = checkoutUrl;
}

/**
 * Handle payment with full flow
 */
export async function handlePayment(paymentConfig, callbacks = {}) {
  const { onError, onSuccess, onLoading } = callbacks;

  try {
    const checkout = await initiatePaymentCheckout({
      ...paymentConfig,
      onError,
      onLoading,
    });

    onSuccess?.(checkout);
    redirectToCheckout(checkout.checkoutUrl);
  } catch (error) {
    onError?.(error.message);
    console.error('Payment flow error:', error);
  }
}