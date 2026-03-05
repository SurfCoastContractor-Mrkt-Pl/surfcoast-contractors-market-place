import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CreditCard, Trash2, Plus, Loader2, Shield, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';



function CardInputForm({ userEmail, cardName, setCardName, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cardholderName, setCardholderName] = useState('');

  const sendVerificationCode = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setError('');
    setVerifying(true);

    try {
      const response = await base44.functions.invoke('sendPhoneVerification', {
        phone: phone.replace(/\D/g, ''),
        userEmail,
      });

      if (response?.data?.success || response?.success) {
        setShowVerification(true);
      } else {
        setError('Failed to send verification code');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      setError('Please enter a valid verification code');
      return;
    }

    setError('');
    setVerifying(true);

    try {
      const response = await base44.functions.invoke('verifyPhoneCode', {
        phone: phone.replace(/\D/g, ''),
        code: verificationCode,
        userEmail,
      });

      if (response?.data?.success || response?.success) {
        setPhoneVerified(true);
        setShowVerification(false);
        setVerificationCode('');
      } else {
        setError('Invalid verification code');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (!phoneVerified) {
      setError('Please verify your phone number first');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const setupResponse = await base44.functions.invoke('createSetupIntent', { userEmail });
      const setupData = setupResponse?.data || setupResponse;
      const clientSecret = setupData?.client_secret;

      if (!clientSecret) {
        setError('Failed to initialize payment form');
        setLoading(false);
        return;
      }

      const cardElement = elements.getElement(CardElement);
      const { setupIntent, error: setupError } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: cardName || 'Card', phone: phone.replace(/\D/g, '') },
        },
      });

      if (setupError) {
        setError(setupError.message);
      } else if (setupIntent?.status === 'succeeded') {
        const paymentMethodId = setupIntent.payment_method;
        await base44.functions.invoke('setupPaymentMethod', {
          userEmail,
          paymentMethodId,
          cardName: cardName || 'Unnamed Card',
          phone: phone.replace(/\D/g, ''),
        });
        onSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Card Nickname</label>
        <Input
          placeholder="e.g., My Visa, Personal Card"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Phone Number {phoneVerified && <span className="text-green-600">✓ Verified</span>}
        </label>
        <div className="flex gap-2">
          <Input
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading || verifying || phoneVerified}
          />
          {!phoneVerified && (
            <Button
              type="button"
              variant="outline"
              onClick={sendVerificationCode}
              disabled={loading || verifying}
            >
              {verifying ? 'Sending...' : 'Send Code'}
            </Button>
          )}
        </div>
      </div>

      {showVerification && !phoneVerified && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Verification Code</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter 4-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
              disabled={loading || verifying}
              maxLength="6"
            />
            <Button
              type="button"
              variant="outline"
              onClick={verifyCode}
              disabled={loading || verifying || verificationCode.length < 4}
            >
              {verifying ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Card Details</label>
        <div className="p-3 border border-slate-300 rounded-md bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1e293b',
                  '::placeholder': {
                    color: '#cbd5e1',
                  },
                },
                invalid: {
                  color: '#dc2626',
                },
              },
            }}
            disabled={loading || !phoneVerified}
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm font-semibold text-green-800">Stripe Secured — PCI DSS Compliant</p>
        </div>
        <ul className="text-xs text-green-700 space-y-1 ml-6 list-disc">
          <li>Card numbers are <strong>never stored</strong> on our servers</li>
          <li>All card data is handled directly by Stripe (PCI Level 1 certified)</li>
          <li>We only save the last 4 digits and card brand for display</li>
          <li>Transfers are encrypted end-to-end with TLS</li>
        </ul>
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading || verifying}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-amber-500 hover:bg-amber-600"
          disabled={loading || !stripe || !elements || !phoneVerified}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Card'
          )}
        </Button>
      </div>
    </form>
  );
}

export default function SavedPaymentMethods({ userEmail }) {
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [cardName, setCardName] = useState('');
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    const initStripe = async () => {
      const keyResponse = await base44.functions.invoke('getStripePublicKey');
      const keyData = keyResponse?.data || keyResponse;
      const publishableKey = keyData?.publishableKey;

      if (publishableKey) {
        const stripe = await loadStripe(publishableKey);
        setStripePromise(stripe);
      }
    };

    initStripe();
  }, []);

  const { data: paymentMethods, isLoading, refetch } = useQuery({
    queryKey: ['paymentMethods', userEmail],
    queryFn: () => base44.functions.invoke('getPaymentMethods', { userEmail }),
    enabled: !!userEmail,
  });

  const deletePaymentMethodMutation = useMutation({
    mutationFn: (paymentMethodId) =>
      base44.functions.invoke('deletePaymentMethod', { paymentMethodId }),
    onSuccess: () => {
      refetch();
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Saved Payment Methods</h3>
          </div>
          <Button
            onClick={() => setShowAddMethod(true)}
            size="sm"
            className="bg-amber-500 hover:bg-amber-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </Button>
        </div>

        {isLoading ? (
          <div className="text-slate-500 text-sm">Loading payment methods...</div>
        ) : paymentMethods && paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <Card key={method.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900">{method.card_name}</p>
                    <p className="text-sm text-slate-600">
                      {method.card_brand?.toUpperCase()} ending in {method.card_last4}
                    </p>
                    <p className="text-xs text-slate-500">
                      Expires {method.card_exp_month}/{method.card_exp_year}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deletePaymentMethodMutation.mutate(method.id)}
                  disabled={deletePaymentMethodMutation.isPending}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 text-sm">No payment methods saved</p>
            <p className="text-slate-500 text-xs mt-1">Add one to quickly pay platform fees</p>
          </div>
        )}
      </div>

      <Dialog open={showAddMethod} onOpenChange={setShowAddMethod}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>Add a new saved payment method to your account for quick access.</DialogDescription>
          </DialogHeader>
          {stripePromise ? (
            <Elements stripe={stripePromise}>
              <CardInputForm
                userEmail={userEmail}
                cardName={cardName}
                setCardName={setCardName}
                onSuccess={() => {
                  setShowAddMethod(false);
                  setCardName('');
                  refetch();
                }}
                onCancel={() => setShowAddMethod(false)}
              />
            </Elements>
          ) : (
            <div className="text-center py-4 text-slate-500">Loading payment form...</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}