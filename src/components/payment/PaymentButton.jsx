/**
 * PaymentButton Component
 * Reusable button for initiating payment with error handling
 */

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import PaymentErrorDisplay from './PaymentErrorDisplay';
import { initiatePaymentCheckout } from '@/lib/paymentUtils';
import { checkCheckoutEnvironment } from '@/lib/paymentErrorHandler';

export default function PaymentButton({
  payerEmail,
  payerName,
  payerType,
  contractorId = null,
  contractorEmail = null,
  contractorName = null,
  tier = 'quote',
  children = 'Pay Now',
  className = '',
  onSuccess,
  onError,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    try {
      // Check iframe environment first
      checkCheckoutEnvironment();
      setError(null);
      setIsLoading(true);

      const checkout = await initiatePaymentCheckout({
        payerEmail,
        payerName,
        payerType,
        contractorId,
        contractorEmail,
        contractorName,
        tier,
        onError: (msg) => setError({ message: msg }),
      });

      onSuccess?.(checkout);

      // Redirect to checkout
      if (checkout.checkoutUrl) {
        window.location.href = checkout.checkoutUrl;
      }
    } catch (err) {
      const errorMessage = err?.message || 'Payment initialization failed';
      setError({
        message: errorMessage,
        code: err?.code,
      });
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-3">
        <PaymentErrorDisplay
          error={error}
          onRetry={handleClick}
          onDismiss={() => setError(null)}
        />
        <button
          onClick={handleClick}
          disabled={isLoading}
          className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
              Processing...
            </>
          ) : (
            children
          )}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${className} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
}