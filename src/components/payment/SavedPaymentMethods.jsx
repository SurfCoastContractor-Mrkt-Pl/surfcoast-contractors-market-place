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
  const [error, setError] = useState('');

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
          {stripePromise && (
            <Elements stripe={stripePromise}>
              <AddPaymentMethodForm
                userEmail={userEmail}
                onSuccess={() => {
                  setShowAddMethod(false);
                  refetch();
                }}
                onCancel={() => setShowAddMethod(false)}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}