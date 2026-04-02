import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CreditCard, Trash2, Plus, Loader2 } from 'lucide-react';

export default function SavedPaymentMethodsManager({ userEmail }) {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const result = await base44.functions.invoke('manageSavedPayment', {
          action: 'list',
          userEmail,
        });
        setMethods(result.methods || []);
      } catch (error) {
        console.error('Failed to fetch payment methods:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) fetchMethods();
  }, [userEmail]);

  const handleDelete = async (methodId) => {
    setDeleting(methodId);
    try {
      await base44.functions.invoke('manageSavedPayment', {
        action: 'delete',
        userEmail,
        paymentMethodId: methodId,
      });
      setMethods(methods.filter(m => m.id !== methodId));
    } catch (error) {
      console.error('Failed to delete payment method:', error);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Saved Payment Methods</h3>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Add Card
        </button>
      </div>

      {methods.length === 0 ? (
        <p className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg text-center">No saved payment methods yet.</p>
      ) : (
        <div className="space-y-2">
          {methods.map(method => (
            <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{method.card_brand} ending in {method.card_last4}</p>
                  <p className="text-xs text-gray-500">Expires {method.card_exp_month}/{method.card_exp_year}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(method.id)}
                disabled={deleting === method.id}
                className="text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}