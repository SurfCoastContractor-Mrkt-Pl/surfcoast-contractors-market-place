import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DollarSign, Loader2, CheckCircle, Shield, AlertTriangle } from 'lucide-react';
import { logError } from '@/components/utils/logError';

export default function PaymentGate({ open, onClose, onPaid, payerType, contractorId, contractorEmail, contractorName, tier = 'quote', priceId, quoteMetaParam = '' }) {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [paid, setPaid] = useState(false);
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [checkingout, setCheckingout] = useState(false);

  const tierConfigs = {
    quote: { amount: 1.75, label: 'Quote Request Fee', description: 'Blind written estimate' },
    timed: { amount: 1.50, label: '10-Minute Chat', description: 'Real-time communication session' },
    subscription: { amount: 50, label: 'Monthly Subscription', description: 'Up to 15 contacts, 5 sessions each' },
  };
  const tierConfig = tierConfigs[tier] || tierConfigs.quote;

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (tier === 'quote' && !quoteMetaParam) {
        throw new Error('Quote details are missing. Please go back and select a project.');
      }

      // Check for duplicate confirmed payment
      const existing = await base44.entities.Payment.filter({
        payer_email: data.email,
        payer_type: payerType,
        contractor_id: contractorId ?? null,
        status: 'confirmed',
      });
      if (existing && existing.length > 0) {
        setAlreadyPaid(true);
        onPaid(existing[0]);
        return existing[0];
      }

      // Determine amount in cents
      const amountCents = tier === 'timed' ? 150 : 175;

      // Create checkout session first (atomic operation)
      const response = await base44.functions.invoke('createJobPayment', {
        amount_cents: amountCents,
        contractor_id: contractorId || null,
        customer_email: data.email,
        customer_name: data.name,
        purpose: tier === 'timed' ? 'chat' : 'estimate',
      });

      if (!response.data?.checkout_url || !response.data?.payment_id) {
        throw new Error('Failed to create checkout session');
      }

      if (window.self !== window.top) {
        alert('Stripe checkout is not available in preview mode. Please view this app from a published URL to complete payment.');
        throw new Error('Checkout not available in iframe');
      }

      window.location.href = response.data.checkout_url;
      return response.data;
    },
    onSuccess: (record) => {
      setPaid(true);
      onPaid(record);
      setCheckingout(false);
    },
    onError: (error) => {
      setCheckingout(false);
      console.error('Payment checkout error:', error.message);
      logError({
        error_type: 'payment',
        severity: 'high',
        user_email: formData.email || 'unknown',
        user_type: payerType || 'unknown',
        action: 'Create payment checkout session',
        error_message: error.message,
        context: { payerType, contractorId, contractorEmail },
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setCheckingout(true);
    mutation.mutate(formData);
  };

  const handleClose = () => {
    setPaid(false);
    setFormData({ name: '', email: '' });
    onClose();
  };

  const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email);
  const canSubmit = !checkingout && formData.name.length >= 2 && isValidEmail;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" aria-describedby="payment-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-500" />
            {tierConfig.label} — ${tierConfig.amount.toFixed(2)}
          </DialogTitle>
          <DialogDescription id="payment-description">
            {tierConfig.description}
          </DialogDescription>
        </DialogHeader>

        {alreadyPaid ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Already Verified</h3>
            <p className="text-slate-600 text-sm mb-4">
              A confirmed payment already exists for this account. Your access is active.
            </p>
            <Button onClick={handleClose} className="bg-amber-500 hover:bg-amber-600 text-slate-900">Continue</Button>
          </div>
        ) : paid ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Access Granted</h3>
            <p className="text-slate-600 text-sm mb-4">
              A receipt has been sent to your email. You now have access to communicate with this {payerType === 'customer' ? 'contractor' : 'customer'}.
            </p>
            <Button onClick={handleClose} className="bg-amber-500 hover:bg-amber-600 text-slate-900">Continue</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-2">

            {/* Cost Responsibility Notice — customers only */}
            {payerType === 'customer' && (
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-sm text-amber-900 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <strong className="text-amber-900">Important — Please Read Before Proceeding</strong>
                </div>
                <p className="leading-relaxed">
                  Any amounts agreed upon with the contractor are <strong>solely between you and the contractor</strong>. SurfCoast Contractor Market Place is not a party to any payment arrangement between you and the contractor.
                </p>
                <p className="leading-relaxed">
                  By proceeding, you acknowledge that <strong>full payment to the contractor is due immediately upon completion of the agreed work</strong>.
                </p>
              </div>
            )}

            {/* Fee Disclosure */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 space-y-2">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
                <div>
                  <strong className="text-slate-900">{tierConfig.label}: ${tierConfig.amount.toFixed(2)} (USD)</strong>
                  <p className="mt-1">
                    {tier === 'quote' && `This one-time fee allows ${contractorName} to review your project and provide a blind written estimate. A separate $1.75 fee applies for each contractor you request a quote from.`}
                    {tier === 'timed' && `This one-time fee grants you a 10-minute real-time messaging session with ${contractorName} to discuss and negotiate work terms.`}
                    {tier === 'subscription' && `This monthly subscription grants you access to message up to 15 unique contacts, with up to 5 sessions per relationship.`}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {tier === 'quote' && 'Fee disclosed as required by California SB 478. '}
                    Secure payment via Stripe. A receipt will be emailed to you.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="pay_name">Your Full Name *</Label>
              <Input
                id="pay_name"
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="John Doe"
                minLength="2"
                maxLength="100"
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="pay_email">Your Email *</Label>
              <Input
                id="pay_email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                required
                className="mt-1.5"
              />
              {formData.email && !isValidEmail && (
                <p className="text-xs text-red-600 mt-1">Please enter a valid email address</p>
              )}
            </div>

            {mutation.isError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <strong>Error:</strong> {mutation.error?.message || 'Payment failed. Please try again.'}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1" disabled={checkingout}>Cancel</Button>
              <Button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                disabled={!canSubmit}
              >
                {checkingout ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redirecting to Stripe...</>
                ) : (
                  `Pay $${tierConfig.amount.toFixed(2)} via Stripe`
                )}
              </Button>
            </div>

            <p className="text-center text-xs text-slate-400">
              You'll enter card details securely on Stripe's checkout page. All fees are non-refundable.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}