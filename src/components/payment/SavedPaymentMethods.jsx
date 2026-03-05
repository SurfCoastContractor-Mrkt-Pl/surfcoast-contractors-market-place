import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CreditCard, Trash2, Plus, Loader2, Shield, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function SavedPaymentMethods({ userEmail }) {
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [cardName, setCardName] = useState('');
  const [loading, setLoading] = useState(false);
  const [stripeElementsReady, setStripeElementsReady] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  const { data: paymentMethods, isLoading, refetch } = useQuery({
    queryKey: ['paymentMethods', userEmail],
    queryFn: () => base44.functions.invoke('getPaymentMethods', { userEmail }),
    enabled: !!userEmail,
  });

  const addPaymentMethodMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.functions.invoke('setupPaymentMethod', data);
    },
    onSuccess: () => {
      refetch();
      setShowAddMethod(false);
      setCardName('');
    },
  });

  const deletePaymentMethodMutation = useMutation({
    mutationFn: (paymentMethodId) =>
      base44.functions.invoke('deletePaymentMethod', { paymentMethodId }),
    onSuccess: () => {
      refetch();
    },
  });

  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Request setup intent from backend
      const setupData = await base44.functions.invoke('createSetupIntent', { userEmail });

      // Load Stripe
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripePublishableKey = await base44.functions.invoke('getStripePublicKey');
      const stripe = await loadStripe(stripePublishableKey.publishableKey);

      if (!stripe) {
        alert('Payment processing is not available');
        setLoading(false);
        return;
      }

      // Redirect to Stripe's hosted payment page for setup
      const { error } = await stripe.confirmCardSetup(setupData.client_secret, {
        return_url: window.location.origin,
      });

      if (error) {
        alert('Error: ' + error.message);
      }
    } catch (error) {
      console.error('Payment method error:', error);
      alert('Error adding payment method: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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
          <form onSubmit={handleAddPaymentMethod} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Card Nickname
              </label>
              <Input
                placeholder="e.g., My Visa, Personal Card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                disabled={loading}
              />
            </div>

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

            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <Lock className="w-4 h-4 text-slate-500 shrink-0" />
              <p className="text-xs text-slate-500">
                You'll be securely redirected to Stripe's hosted payment page to enter your card details.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddMethod(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600"
                disabled={loading}
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
        </DialogContent>
      </Dialog>
    </div>
  );
}