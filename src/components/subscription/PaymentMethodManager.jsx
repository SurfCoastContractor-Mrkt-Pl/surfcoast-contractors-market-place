import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CreditCard, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentMethodManager({ userEmail }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const methods = await base44.entities.SavedPaymentMethod.filter({ user_email: userEmail });
        setPaymentMethods(methods);
      } catch (err) {
        console.error('Error fetching payment methods:', err);
        setError('Failed to load payment methods');
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchPaymentMethods();
    }
  }, [userEmail]);

  const handleAddPaymentMethod = async () => {
    try {
      const response = await base44.functions.invoke('setupPaymentMethod', {
        userEmail,
      });

      if (response.data?.setupUrl) {
        if (window.self !== window.top) {
          alert('Payment setup must be completed from the published app.');
          return;
        }
        window.location.href = response.data.setupUrl;
      }
    } catch (err) {
      setError('Failed to setup payment method');
    }
  };

  const handleDeletePaymentMethod = async (methodId) => {
    if (!confirm('Remove this payment method?')) return;

    try {
      await base44.functions.invoke('deletePaymentMethod', { methodId });
      setPaymentMethods(paymentMethods.filter((m) => m.id !== methodId));
    } catch (err) {
      setError('Failed to delete payment method');
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Methods
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border-2 border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold capitalize">{method.card_brand} •••• {method.card_last4}</p>
                    <p className="text-sm text-muted-foreground">Expires {method.card_exp_month}/{method.card_exp_year}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePaymentMethod(method.id)}
                  className="p-2 hover:bg-destructive/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No payment methods saved.</p>
        )}

        {error && <p className="text-destructive text-sm">{error}</p>}

        <button
          onClick={handleAddPaymentMethod}
          className="w-full px-4 py-3 border-2 border-primary rounded-lg font-semibold text-primary hover:bg-primary/5 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Payment Method
        </button>
      </CardContent>
    </Card>
  );
}