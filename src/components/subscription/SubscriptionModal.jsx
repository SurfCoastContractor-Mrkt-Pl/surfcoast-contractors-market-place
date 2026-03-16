import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, CreditCard } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SubscriptionModal({ open, onClose, userEmail, userType }) {
  const [stripePromise, setStripePromise] = useState(null);
  const [priceId, setPriceId] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [useNewCard, setUseNewCard] = useState(false);

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

  const { data: paymentMethods } = useQuery({
    queryKey: ['paymentMethods', userEmail],
    queryFn: async () => {
      const res = await base44.functions.invoke('getPaymentMethods', { userEmail });
      return res?.data || [];
    },
    enabled: !!userEmail && open,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (usePaymentMethodId = null) => {
      if (!priceId) {
        throw new Error('Price not configured yet');
      }

      const { data } = await base44.functions.invoke('createSubscriptionCheckout', {
        priceId,
        email: userEmail,
        userType,
        paymentMethodId: usePaymentMethodId,
      });

      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      console.error('Checkout error:', error);
    },
  });

  const handlePayWithSavedCard = () => {
    if (selectedPaymentMethod) {
      checkoutMutation.mutate(selectedPaymentMethod);
    }
  };

  const handlePayWithNewCard = () => {
    checkoutMutation.mutate(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby="subscription-description">
        <DialogHeader>
          <DialogTitle>Unlimited Communication</DialogTitle>
          <DialogDescription id="subscription-description">
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
              <span className="text-sm text-slate-600">Unlimited messaging with any contractor or customer</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm text-slate-600">Skip per-message fees for 30 days</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm text-slate-600">Cancel anytime — no commitment</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm text-slate-600">Auto-renews monthly until cancelled</span>
            </li>
          </ul>

          {!priceId && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700">Subscription not yet configured</p>
            </div>
          )}

          {paymentMethods && paymentMethods.length > 0 ? (
            <Tabs defaultValue="saved" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="saved">Saved Cards</TabsTrigger>
                <TabsTrigger value="new">New Card</TabsTrigger>
              </TabsList>

              <TabsContent value="saved" className="space-y-4">
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <label key={method.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input
                        type="radio"
                        name="payment-method"
                        value={method.stripe_payment_method_id}
                        checked={selectedPaymentMethod === method.stripe_payment_method_id}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{method.card_name || 'Unnamed Card'}</p>
                        <p className="text-sm text-slate-600">{method.card_brand?.toUpperCase()} ending in {method.card_last4}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <Button
                  onClick={handlePayWithSavedCard}
                  disabled={!selectedPaymentMethod || !priceId || checkoutMutation.isPending}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  {checkoutMutation.isPending ? 'Processing...' : `Pay $50 with Selected Card`}
                </Button>
              </TabsContent>

              <TabsContent value="new" className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <p><strong>Note:</strong> Your card details will not be saved. You'll enter them in the next step.</p>
                </div>
                <Button
                  onClick={handlePayWithNewCard}
                  disabled={!priceId || checkoutMutation.isPending}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  {checkoutMutation.isPending ? 'Processing...' : 'Continue with New Card'}
                </Button>
              </TabsContent>
            </Tabs>
          ) : (
            <Button
              onClick={handlePayWithNewCard}
              disabled={!priceId || checkoutMutation.isPending}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {checkoutMutation.isPending ? 'Processing...' : 'Subscribe Now'}
            </Button>
          )}

          <Button onClick={onClose} variant="outline" className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}