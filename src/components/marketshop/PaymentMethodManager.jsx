import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CreditCard, Loader2 } from 'lucide-react';

export default function PaymentMethodManager({ subscription, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Call backend function to update payment method via Stripe
      const response = await fetch('/api/update-payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.stripe_subscription_id,
          cardData
        })
      });

      if (!response.ok) throw new Error('Failed to update payment method');

      setSuccess(true);
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update payment method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-blue-600 bg-blue-50">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Update Payment Method</CardTitle>
          <CardDescription>Add or change your payment information</CardDescription>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700 font-bold text-xl leading-none"
        >
          ×
        </button>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200 text-green-900">
            <AlertDescription>Payment method updated successfully!</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Card Number
            </label>
            <Input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardData.cardNumber}
              onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Month
              </label>
              <Input
                type="text"
                placeholder="MM"
                value={cardData.expiryMonth}
                onChange={(e) => setCardData({ ...cardData, expiryMonth: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Year
              </label>
              <Input
                type="text"
                placeholder="YY"
                value={cardData.expiryYear}
                onChange={(e) => setCardData({ ...cardData, expiryYear: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                CVC
              </label>
              <Input
                type="text"
                placeholder="123"
                value={cardData.cvc}
                onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {loading ? 'Updating...' : 'Update Payment Method'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}