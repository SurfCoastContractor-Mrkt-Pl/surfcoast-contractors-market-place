import React from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SubscriptionStatusCard({ subscription, onChangePlan = null, onCancel = null }) {
  if (!subscription) {
    return (
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Subscribe to unlock all features.</p>
          <a href="/SubscriptionUpgrade" className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90">
            View Plans
          </a>
        </CardContent>
      </Card>
    );
  }

  const statusIcon = {
    active: <CheckCircle2 className="w-5 h-5 text-secondary" />,
    past_due: <AlertCircle className="w-5 h-5 text-destructive" />,
    cancelled: <Clock className="w-5 h-5 text-muted-foreground" />,
  }[subscription.status];

  const statusColor = {
    active: 'text-secondary',
    past_due: 'text-destructive',
    cancelled: 'text-muted-foreground',
  }[subscription.status];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {statusIcon}
          <span className={statusColor}>
            {subscription.status === 'active' ? 'Active Subscription' : subscription.status === 'past_due' ? 'Payment Issue' : 'Cancelled'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="text-lg font-bold capitalize">{subscription.tier}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Monthly Cost</p>
            <p className="text-lg font-bold">${(subscription.amount_cents / 100).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className={`text-lg font-bold capitalize ${statusColor}`}>{subscription.status}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Next Billing</p>
            <p className="text-lg font-bold">{new Date(subscription.billing_cycle_end).toLocaleDateString()}</p>
          </div>
        </div>

        {subscription.status === 'past_due' && (
          <div className="p-4 bg-destructive/10 border-2 border-destructive rounded-lg">
            <p className="text-destructive font-semibold mb-2">⚠️ Payment Issue</p>
            <p className="text-destructive/90 text-sm">Your payment failed. Please update your payment method to restore access.</p>
          </div>
        )}

        {subscription.status === 'active' && (
          <div className="flex gap-3">
            {onChangePlan && (
              <button
                onClick={onChangePlan}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90"
              >
                Change Plan
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 border-2 border-border rounded-lg font-semibold hover:bg-muted"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}