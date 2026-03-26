/**
 * Payment-specific error handling
 * Wraps Stripe and payment processing errors with user-friendly messages
 */

import { logError } from './errorHandler';

export const PAYMENT_ERROR_TYPES = {
  IFRAME_CHECKOUT: 'iframe_checkout',
  INVALID_TOKEN: 'invalid_token',
  DECLINED: 'card_declined',
  INSUFFICIENT_FUNDS: 'insufficient_funds',
  EXPIRED_TOKEN: 'expired_token',
  PROCESSING: 'processing_error',
  NETWORK: 'network_error',
  INVALID_AMOUNT: 'invalid_amount',
  DUPLICATE_CHARGE: 'duplicate_charge',
};

export const PAYMENT_ERROR_MESSAGES = {
  iframe_checkout: 'Checkout only works on the published app. Please visit our website to complete your purchase.',
  invalid_token: 'Invalid payment method. Please try again or use a different card.',
  card_declined: 'Your card was declined. Please check your card details or use a different payment method.',
  insufficient_funds: 'Insufficient funds. Please check your account or use a different payment method.',
  expired_token: 'Your payment method has expired. Please update your card information.',
  processing_error: 'Payment processing failed. Please try again in a few moments.',
  network_error: 'Connection failed during payment. Please check your internet and try again.',
  invalid_amount: 'Invalid payment amount. Please contact support.',
  duplicate_charge: 'This payment may have already been processed. Please check your account.',
};

/**
 * Detect if running in iframe and block checkout
 */
export function isInIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

/**
 * Check for iframe before opening checkout
 */
export function checkCheckoutEnvironment() {
  if (isInIframe()) {
    const error = new Error(PAYMENT_ERROR_MESSAGES.iframe_checkout);
    error.type = PAYMENT_ERROR_TYPES.IFRAME_CHECKOUT;
    throw error;
  }
}

/**
 * Classify Stripe error
 */
export function classifyPaymentError(error) {
  if (!error) return PAYMENT_ERROR_TYPES.PROCESSING;

  const message = error?.message?.toLowerCase() || '';
  const code = error?.code?.toLowerCase() || '';

  if (message.includes('iframe') || message.includes('checkout only')) {
    return PAYMENT_ERROR_TYPES.IFRAME_CHECKOUT;
  }

  if (code === 'card_declined' || message.includes('declined')) {
    return PAYMENT_ERROR_TYPES.DECLINED;
  }

  if (message.includes('insufficient') || code === 'insufficient_funds') {
    return PAYMENT_ERROR_TYPES.INSUFFICIENT_FUNDS;
  }

  if (message.includes('expired') || code === 'expired_token') {
    return PAYMENT_ERROR_TYPES.EXPIRED_TOKEN;
  }

  if (code === 'invalid_token' || message.includes('invalid token')) {
    return PAYMENT_ERROR_TYPES.INVALID_TOKEN;
  }

  if (message.includes('duplicate') || code === 'duplicate') {
    return PAYMENT_ERROR_TYPES.DUPLICATE_CHARGE;
  }

  if (message.includes('network') || message.includes('fetch')) {
    return PAYMENT_ERROR_TYPES.NETWORK;
  }

  return PAYMENT_ERROR_TYPES.PROCESSING;
}

/**
 * Get payment error message
 */
export function getPaymentErrorMessage(error) {
  const errorType = classifyPaymentError(error);
  return PAYMENT_ERROR_MESSAGES[errorType] || PAYMENT_ERROR_MESSAGES.processing_error;
}

/**
 * Log payment error with context
 */
export function logPaymentError(context, error, metadata = {}) {
  const errorType = classifyPaymentError(error);
  logError(context, error, {
    paymentErrorType: errorType,
    ...metadata,
  });
}

/**
 * Safe payment operation wrapper
 */
export async function safePaymentOperation(operation, context = 'Payment') {
  try {
    checkCheckoutEnvironment();
    return await operation();
  } catch (error) {
    logPaymentError(context, error);
    throw {
      type: classifyPaymentError(error),
      message: getPaymentErrorMessage(error),
      originalError: error,
    };
  }
}