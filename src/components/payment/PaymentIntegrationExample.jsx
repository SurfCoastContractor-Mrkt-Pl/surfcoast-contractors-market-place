/**
 * Payment Integration Example
 * Demonstrates how to integrate payment flows in any component
 */

import React, { useState } from 'react';
import PaymentButton from './PaymentButton';
import PaymentGate from './PaymentGate';
import { Loader2 } from 'lucide-react';

/**
 * Example 1: Simple Payment Button
 * Use this for one-off payment actions
 */
export function SimplePaymentExample() {
  return (
    <PaymentButton
      payerEmail="user@example.com"
      payerName="John Doe"
      payerType="customer"
      tier="quote"
      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
      onSuccess={(checkout) => {
        console.log('Payment initiated:', checkout);
      }}
      onError={(error) => {
        console.error('Payment error:', error);
      }}
    >
      Send Quote Request ($1.75)
    </PaymentButton>
  );
}

/**
 * Example 2: Payment with Validation
 * Validate data before initiating payment
 */
export function ValidatedPaymentExample({ userEmail, userName }) {
  const [validationError, setValidationError] = useState(null);

  const validatePaymentData = async () => {
    setValidationError(null);

    // Validate required fields
    if (!userEmail || !userName) {
      setValidationError('Email and name are required');
      return false;
    }

    // Validate email format
    if (!userEmail.includes('@')) {
      setValidationError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handlePaymentClick = async () => {
    const isValid = await validatePaymentData();
    if (!isValid) return;

    // PaymentButton will handle the rest
  };

  return (
    <div className="space-y-4">
      {validationError && (
        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
          {validationError}
        </div>
      )}
      <PaymentButton
        payerEmail={userEmail}
        payerName={userName}
        payerType="customer"
        tier="quote"
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
      >
        Proceed to Payment
      </PaymentButton>
    </div>
  );
}

/**
 * Example 3: Conditional Payment Gate
 * Gate payment access based on user state
 */
export function ConditionalPaymentExample({
  isUserVerified,
  userEmail,
  userName,
}) {
  const [paymentState, setPaymentState] = useState('idle');

  const initiatePayment = async () => {
    setPaymentState('processing');
    // PaymentGate will handle loading/error states
  };

  return (
    <PaymentGate
      requireAuth={true}
      loadingMessage="Preparing secure checkout..."
      onPaymentInitiate={initiatePayment}
      onPaymentSuccess={(checkout) => {
        setPaymentState('success');
        console.log('Payment successful:', checkout);
      }}
      onPaymentError={(error) => {
        setPaymentState('error');
        console.error('Payment error:', error);
      }}
    >
      <div className="p-6 rounded-lg border border-slate-200">
        {!isUserVerified && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 mb-4 text-sm text-amber-800">
            ⚠️ Please verify your identity before proceeding with payment.
          </div>
        )}

        <button
          disabled={!isUserVerified}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Complete Payment
        </button>
      </div>
    </PaymentGate>
  );
}

/**
 * Example 4: Multi-Tier Payment
 * Allow user to select payment tier
 */
export function MultiTierPaymentExample({ userEmail, userName }) {
  const [selectedTier, setSelectedTier] = useState('quote');

  const tiers = [
    {
      id: 'quote',
      label: 'Send Quote Request',
      price: '$1.75',
      description: 'Basic communication through the platform',
    },
    {
      id: 'timed',
      label: 'Limited Communication',
      price: '$1.50',
      description: '1 hour of direct messaging with contractor',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tiers.map((tier) => (
          <button
            key={tier.id}
            onClick={() => setSelectedTier(tier.id)}
            className={`p-4 rounded-lg border-2 transition-colors text-left ${
              selectedTier === tier.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <h4 className="font-semibold text-slate-900">{tier.label}</h4>
            <p className="text-sm text-slate-600 mt-1">{tier.description}</p>
            <p className="text-lg font-bold text-blue-600 mt-2">{tier.price}</p>
          </button>
        ))}
      </div>

      <PaymentButton
        payerEmail={userEmail}
        payerName={userName}
        payerType="customer"
        tier={selectedTier}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
      >
        Proceed to Payment
      </PaymentButton>
    </div>
  );
}

/**
 * Example 5: Payment with Loading State
 * Handle loading state in parent component
 */
export function LoadingStatePaymentExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const handlePayment = async () => {
    setIsLoading(true);
    // Simulate pre-payment validation
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
        <span className="text-slate-600 font-medium">Preparing payment...</span>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="p-6 rounded-lg bg-green-50 border border-green-200">
        <p className="text-green-800 font-semibold">✓ Payment initiated successfully!</p>
        <p className="text-sm text-green-700 mt-2">You'll be redirected to checkout in a moment.</p>
      </div>
    );
  }

  return (
    <PaymentButton
      payerEmail="user@example.com"
      payerName="John Doe"
      payerType="customer"
      tier="quote"
      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
      onSuccess={() => setPaymentStatus('success')}
    >
      Continue to Payment
    </PaymentButton>
  );
}

/**
 * Usage Notes:
 *
 * 1. SIMPLE: Just use <PaymentButton /> for one-off payments
 *
 * 2. VALIDATION: Wrap PaymentButton and validate data before calling handler
 *
 * 3. CONDITIONAL: Use PaymentGate for access control (requires auth, etc)
 *
 * 4. MULTI-TIER: Let users select tier, pass it to tier prop
 *
 * 5. LOADING: Handle loading state in parent component
 *
 * Error handling is automatic:
 * - Iframe detection blocks checkout
 * - Network errors show retry button
 * - All errors are logged with context
 * - User-friendly messages shown always
 */