import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus, Trash2, Check } from 'lucide-react';

export default function PaymentMethods({ userEmail }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ['paymentMethods', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      try {
        return await base44.entities.SavedPaymentMethod.filter({ user_email: userEmail });
      } catch (err) {
        console.error('Error fetching payment methods:', err);
        return [];
      }
    },
    enabled: !!userEmail
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (methodId) => base44.entities.SavedPaymentMethod.delete(methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods', userEmail] });
    }
  });

  const handleDelete = (methodId) => {
    if (confirm('Remove this payment method?')) {
      deletePaymentMutation.mutate(methodId);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-900">Your Payment Methods</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Method
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <p className="text-sm text-slate-600 mb-2">Payment method management is handled securely through Stripe.</p>
          <p className="text-xs text-slate-500">Contact support to add a new payment method.</p>
        </Card>
      )}

      {paymentMethods && paymentMethods.length > 0 ? (
        <div className="space-y-3">
          {paymentMethods.map(method => (
            <Card key={method.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <CreditCard className="w-6 h-6 text-slate-400" />
                <div>
                  <p className="font-semibold text-slate-900 capitalize">{method.card_brand} ending in {method.card_last4}</p>
                  <p className="text-sm text-slate-600">Expires {method.card_exp_month}/{method.card_exp_year}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(method.id)}
                disabled={deletePaymentMutation.isPending}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No payment methods saved yet. Add one for faster checkout!</p>
        </Card>
      )}
    </div>
  );
}