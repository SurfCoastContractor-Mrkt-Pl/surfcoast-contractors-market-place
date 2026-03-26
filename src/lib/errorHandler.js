/**
 * Centralized error handling utility
 * Provides consistent error formatting and messaging across the app
 */

export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTH: 'AUTH',
  PAYMENT: 'PAYMENT',
  PERMISSION: 'PERMISSION',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN',
};

export const ERROR_MESSAGES = {
  NETWORK: 'Connection failed. Please check your internet and try again.',
  VALIDATION: 'Please check your input and try again.',
  AUTH: 'You must be logged in to perform this action.',
  AUTH_FAILED: 'Login failed. Please check your credentials.',
  PAYMENT: 'Payment processing failed. Please try again or contact support.',
  PERMISSION: 'You do not have permission to perform this action.',
  SERVER: 'Something went wrong on our end. Please try again later.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
  FILE_UPLOAD: 'File upload failed. Please try a different file or try again.',
  STRIPE_IFRAME: 'Checkout is only available on the published app. Please visit our website.',
};

/**
 * Classify error type
 */
export function classifyError(error) {
  if (!error) return ERROR_TYPES.UNKNOWN;

  const message = error?.message?.toLowerCase() || '';
  const status = error?.status;

  // Network errors
  if (message.includes('network') || message.includes('fetch') || !navigator.onLine) {
    return ERROR_TYPES.NETWORK;
  }

  // Auth errors
  if (status === 401 || message.includes('unauthorized') || message.includes('not logged in')) {
    return ERROR_TYPES.AUTH;
  }

  // Permission errors
  if (status === 403 || message.includes('forbidden') || message.includes('permission')) {
    return ERROR_TYPES.PERMISSION;
  }

  // Validation errors
  if (status === 400 || message.includes('validation') || message.includes('required')) {
    return ERROR_TYPES.VALIDATION;
  }

  // Payment errors
  if (message.includes('payment') || message.includes('stripe') || message.includes('charge')) {
    return ERROR_TYPES.PAYMENT;
  }

  // Server errors
  if (status >= 500) {
    return ERROR_TYPES.SERVER;
  }

  return ERROR_TYPES.UNKNOWN;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error, customMessage = null) {
  if (customMessage) return customMessage;

  const errorType = classifyError(error);
  return ERROR_MESSAGES[errorType] || ERROR_MESSAGES.UNKNOWN;
}

/**
 * Log error for debugging
 */
export function logError(context, error, additionalInfo = {}) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    context,
    message: error?.message || 'Unknown error',
    type: classifyError(error),
    stack: error?.stack,
    ...additionalInfo,
  };

  console.error(`[${context}]`, errorLog);

  // In production, you could send to error tracking service
  // e.g., Sentry, LogRocket, etc.
  return errorLog;
}

/**
 * Safe async wrapper
 */
export async function tryCatch(asyncFn, context = 'Operation') {
  try {
    return await asyncFn();
  } catch (error) {
    logError(context, error);
    throw {
      type: classifyError(error),
      message: getErrorMessage(error),
      originalError: error,
    };
  }
}