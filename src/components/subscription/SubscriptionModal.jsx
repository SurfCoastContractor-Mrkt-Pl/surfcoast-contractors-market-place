import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

export default function SubscriptionModal({ open, onClose, userEmail, userType }) {
  const [stripePromise, setStripePromise] = useState(null);
  const [priceId, setPriceId] = useState(null);

  useEffect(() => {
    // Load Stripe publishable key and set up
    const loadStripeKey = async () => {
      const { data } = await base44.functions.invoke('getStripePublicKey');
      if (data?.publishableKey) {
        setStripePromise(loadStripe(data.publishableKey));
      }
      if (data?.subscriptionPriceId) {
        setPriceId(data.subscriptionPriceId);
      }
    };
    loadStripeKey();
  }, []);

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!priceId) {
        throw new Error('Price not configured yet');
      }

      const { data } = await base44.functions.invoke('createSubscriptionCheckout', {
        priceId,
        email: userEmail,
        userType,
      });

      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      console.error('Checkout error:', error);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Unlimited Communication</DialogTitle>
          <DialogDescription>
            Get unlimited messaging for one month
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-3xl font-bold text-slate-900">$50</p>
            <p className="text-sm text-slate-600">per month, cancel anytime</p>
          </div>

          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm text-slate-600">Unlimited messaging</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm text-slate-600">One month access</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm text-slate-600">Cancel anytime</span>
            </li>
          </ul>

          {!priceId && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700">Subscription not yet configured</p>
            </div>
          )}

          <Button
            onClick={() => checkoutMutation.mutate()}
            disabled={!priceId || checkoutMutation.isPending}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            {checkoutMutation.isPending ? 'Processing...' : 'Subscribe Now'}
          </Button>

          <Button onClick={onClose} variant="outline" className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}