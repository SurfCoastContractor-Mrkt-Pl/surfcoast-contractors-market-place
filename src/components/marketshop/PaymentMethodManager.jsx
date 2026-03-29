import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CreditCard, Loader2 } from 'lucide-react';

export default function PaymentMethodManager({ shopId, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('updateVendorPaymentMethod', {
        shopId: shopId
      });

      if (response.status !== 200 || !response.data?.success) {
        throw new Error(response.data?.error || 'Failed to update payment method');
      }

      setSuccess(true);
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Payment method update failed:', err);
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
          <CardDescription>Your payment method is managed securely through Stripe</CardDescription>
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
          <p className="text-sm text-slate-600 mb-4">
            Click below to securely update your payment method through Stripe's secure portal.
          </p>

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
              {loading ? 'Redirecting...' : 'Update Payment Method'}
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