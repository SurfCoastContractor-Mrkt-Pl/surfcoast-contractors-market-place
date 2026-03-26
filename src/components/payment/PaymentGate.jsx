/**
 * PaymentGate Component
 * Wraps payment flows with error handling, authentication check, and iframe detection
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import PaymentErrorDisplay from './PaymentErrorDisplay';
import { checkCheckoutEnvironment } from '@/lib/paymentErrorHandler';

export default function PaymentGate({
  children,
  onPaymentInitiate,
  onPaymentSuccess,
  onPaymentError,
  paymentConfig = {},
  requireAuth = false,
  loadingMessage = 'Processing payment...',
}) {
  const [iframeError, setIframeError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(requireAuth);

  // Check iframe environment
  useEffect(() => {
    try {
      checkCheckoutEnvironment();
    } catch (err) {
      setIframeError({
        message: 'Checkout must be accessed from the published app, not an embedded preview.',
        code: 'IFRAME_BLOCKED',
      });
    }
  }, []);

  // Check authentication if required
  useEffect(() => {
    if (!requireAuth) {
      setCheckingAuth(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated?.();
        setIsAuthenticated(isAuth ?? true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [requireAuth]);

  const handlePaymentClick = async () => {
    setPaymentError(null);
    setIsLoading(true);

    try {
      if (onPaymentInitiate) {
        const result = await onPaymentInitiate();
        if (result?.checkoutUrl) {
          onPaymentSuccess?.(result);
        }
      }
    } catch (error) {
      const errorMessage = error?.message || 'Payment initialization failed';
      setPaymentError({
        message: errorMessage,
        code: error?.code,
        retryable: error?.retryable !== false,
      });
      onPaymentError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Iframe error state
  if (iframeError) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900 mb-1">Preview Mode</h4>
            <p className="text-sm text-red-800">{iframeError.message}</p>
            <p className="text-xs text-red-700 mt-2">
              📱 To use checkout, publish your app or access it directly from a web browser.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Authentication loading state
  if (checkingAuth) {
    return (
      <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
        <span className="text-sm text-slate-600">Verifying access...</span>
      </div>
    );
  }

  // Authentication required but not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900 mb-1">Login Required</h4>
            <p className="text-sm text-amber-800 mb-3">
              You must be logged in to proceed with this payment.
            </p>
            <button
              onClick={() => base44.auth.redirectToLogin()}
              className="inline-flex px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors"
            >
              Login Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment error state
  if (paymentError) {
    return (
      <PaymentErrorDisplay
        error={paymentError}
        onRetry={paymentError.retryable ? handlePaymentClick : null}
        onDismiss={() => setPaymentError(null)}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        <span className="text-sm text-blue-700 font-medium">{loadingMessage}</span>
      </div>
    );
  }

  // Render children with payment handler
  return React.cloneElement(children, {
    onPaymentClick: handlePaymentClick,
    isProcessing: isLoading,
    hasError: !!paymentError,
  });
}