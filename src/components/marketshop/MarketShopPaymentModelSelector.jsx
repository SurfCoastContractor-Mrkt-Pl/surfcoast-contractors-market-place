import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';

export default function MarketShopPaymentModelSelector({ shopId, shopName, ownerEmail, ownerName, shopType, onClose }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const models = [
    {
      id: 'facilitation',
      title: '5% Per-Transaction Fee',
      description: 'Pay only when you make a sale',
      price: '5%',
      details: 'Charged on each completed transaction',
      color: 'from-orange-50 to-orange-100',
      border: 'border-orange-200',
      buttonColor: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      id: 'subscription',
      title: '$35/Month Subscription',
      description: 'Unlimited transactions, fixed monthly cost',
      price: '$35',
      details: 'Billed monthly, cancel anytime',
      color: 'from-green-50 to-green-100',
      border: 'border-green-200',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    }
  ];

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const response = await fetch('/api/create-market-shop-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          paymentModel: selected,
          shopName,
          ownerEmail,
          ownerName,
          shopType
        })
      });

      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert('Error creating checkout session');
        setLoading(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Error proceeding to payment');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Choose Your Payment Model</h2>
          <p className="text-slate-600">Select how you'd like to pay for your market booth or space</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {models.map(model => (
            <button
              key={model.id}
              onClick={() => setSelected(model.id)}
              className={`relative rounded-xl p-5 sm:p-6 border-2 transition-all ${
                selected === model.id
                  ? `${model.border} bg-gradient-to-br ${model.color} ring-2 ring-offset-2`
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Selection Indicator */}
              {selected === model.id && (
                <div className={`absolute top-3 right-3 w-6 h-6 rounded-full ${model.buttonColor.split(' ')[0]} flex items-center justify-center`}>
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Title & Price */}
              <div className="text-left">
                <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">{model.title}</h3>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{model.price}</p>
                <p className="text-xs sm:text-sm text-slate-600 mb-3">{model.description}</p>
                <p className="text-xs text-slate-500">{model.details}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Warning for Subscription */}
        {selected === 'subscription' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-900">
              <strong>Payment Due Now:</strong> Your first $35 monthly charge will be processed immediately upon checkout completion.
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            type="button"
            disabled={!selected || loading}
            className={`flex-1 text-white font-semibold ${
              selected === 'subscription'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
            onClick={handleContinue}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </span>
            ) : (
              'Continue to Payment'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}