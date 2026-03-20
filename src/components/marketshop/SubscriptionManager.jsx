import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check, X, Calendar, DollarSign } from 'lucide-react';
import PaymentMethodManager from './PaymentMethodManager';
import ConfirmationDialog from './ConfirmationDialog';

export default function SubscriptionManager({ shop, onSubscriptionUpdate }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentManager, setShowPaymentManager] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSubscription();
  }, [shop]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      if (shop?.email) {
        const subs = await base44.entities.Subscription.filter({
          user_email: shop.email,
          user_type: 'contractor'
        });
        setSubscription(subs?.[0] || null);
      }
    } catch (err) {
      console.error('Failed to load subscription:', err);
      setError('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const canSwitch = () => {
    if (!subscription) return false;
    return subscription.status === 'active' && shop?.status === 'active';
  };

  const canRenew = () => {
    if (!subscription) return false;
    return subscription.status === 'cancelled' && shop?.status === 'active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'cancelled':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'past_due':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-900';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading subscription details...</div>;
  }

  if (!subscription) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No subscription found. Please set up a payment model first.</AlertDescription>
      </Alert>
    );
  }

  const statusLabel = subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1);

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {subscription.status === 'past_due' && (
        <Alert className="bg-yellow-50 border-yellow-200 text-yellow-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your subscription is overdue. Please update your payment method to continue listing services.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Status</p>
              <div className={`mt-1 px-3 py-2 rounded-lg inline-block text-sm font-medium ${getStatusColor(subscription.status)}`}>
                {statusLabel}
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600">Amount</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">
                ${(subscription.amount_paid / 100).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Started</p>
              <p className="text-sm text-slate-900 mt-1">
                {new Date(subscription.start_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Next Billing</p>
              <p className="text-sm text-slate-900 mt-1">
                {subscription.current_period_end
                  ? new Date(subscription.current_period_end).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className="border-t pt-4 flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPaymentManager(true)}
              className="flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Update Payment Method
            </Button>
            {canRenew() && (
              <Button
                onClick={() => setShowRenewModal(true)}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Renew Subscription
              </Button>
            )}
            {canSwitch() && (
              <Button
                variant="outline"
                onClick={() => setShowSwitchModal(true)}
              >
                Switch Payment Model
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showPaymentManager && (
        <PaymentMethodManager
          subscription={subscription}
          onClose={() => setShowPaymentManager(false)}
          onUpdate={loadSubscription}
        />
      )}

      {showRenewModal && (
        <ConfirmationDialog
          title="Renew Subscription?"
          description="Your subscription will be renewed at $35/month. Charges will appear on your next billing date."
          confirmText="Renew"
          onConfirm={() => {
            setShowRenewModal(false);
            // Handle renewal
          }}
          onClose={() => setShowRenewModal(false)}
        />
      )}

      {showSwitchModal && (
        <ConfirmationDialog
          title="Switch Payment Model?"
          description="You can switch to a facilitation fee model. This change will take effect after your current billing cycle ends."
          confirmText="Switch"
          onConfirm={() => {
            setShowSwitchModal(false);
            // Handle switch
          }}
          onClose={() => setShowSwitchModal(false)}
        />
      )}
    </div>
  );
}