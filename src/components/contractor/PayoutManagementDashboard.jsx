import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, DollarSign, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function PayoutManagementDashboard({ contractor }) {
  const [showPayoutSetup, setShowPayoutSetup] = useState(false);

  if (!contractor) return null;

  const payoutStatus = {
    connected: { color: 'bg-green-50', badge: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Connected' },
    pending: { color: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending' },
    disconnected: { color: 'bg-red-50', badge: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Disconnected' }
  };

  const getPayoutState = () => {
    if (contractor.stripe_account_charges_enabled) return 'connected';
    if (contractor.stripe_connected_account_id && !contractor.stripe_account_charges_enabled) return 'pending';
    return 'disconnected';
  };

  const state = getPayoutState();
  const status = payoutStatus[state];
  const Icon = status.icon;

  const payoutHistory = [
    { id: 1, date: '2026-03-15', amount: null, status: 'completed', reference: 'po_1234567890' },
    { id: 2, date: '2026-03-01', amount: null, status: 'completed', reference: 'po_0987654321' },
    { id: 3, date: '2026-02-15', amount: null, status: 'completed', reference: 'po_abcdefghij' },
  ];

  return (
    <div className="space-y-6">
      {/* Payout Status */}
      <Card className={`p-6 ${status.color}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-slate-900">Stripe Payout Account</h3>
              <Badge className={status.badge}>
                <Icon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            
            {state === 'connected' && (
              <div className="space-y-1 text-sm text-slate-600">
                <p>Account: {contractor.stripe_connected_account_id?.slice(0, 20)}...</p>
                <p>Payouts enabled and ready to receive payments</p>
              </div>
            )}
            
            {state === 'pending' && (
              <p className="text-sm text-amber-700">
                Completing setup to enable payouts. May take 24-48 hours.
              </p>
            )}
            
            {state === 'disconnected' && (
              <p className="text-sm text-red-700">
                Connect your Stripe account to receive payouts for completed work.
              </p>
            )}
          </div>
          <CreditCard className="w-8 h-8 text-slate-400 flex-shrink-0" />
        </div>

        {state === 'disconnected' && (
          <Button 
            className="mt-4 w-full" 
            onClick={() => setShowPayoutSetup(true)}
          >
            Connect Stripe Account
          </Button>
        )}
      </Card>



      {/* Payout Details */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Payout History</TabsTrigger>
          <TabsTrigger value="settings">Payout Settings</TabsTrigger>
          <TabsTrigger value="fees">Platform Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Payouts</h3>
            {payoutHistory.length > 0 ? (
              <div className="space-y-3">
                {payoutHistory.map(payout => (
                  <div key={payout.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">{payout.amount ? `$${payout.amount.toFixed(2)}` : '••••••'}</p>
                      <p className="text-xs text-slate-600">
                        {new Date(payout.date).toLocaleDateString()} • {payout.reference}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">No payout history</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Payout Settings</h3>
            
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-semibold text-slate-900 mb-1">Payout Schedule</p>
                <p className="text-sm text-slate-600">Weekly (every Monday)</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-semibold text-slate-900 mb-1">Minimum Payout Amount</p>
                <p className="text-sm text-slate-600">$100.00</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-semibold text-slate-900 mb-1">Payout Method</p>
                <p className="text-sm text-slate-600">Direct bank transfer</p>
              </div>
            </div>

            {state === 'connected' && (
              <Button variant="outline" className="w-full mt-4">
                Manage in Stripe Dashboard
              </Button>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Fee Breakdown</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border-l-4 border-l-amber-500">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Platform Fee</p>
                  <p className="text-xs text-slate-600">18% on completed projects</p>
                </div>
                <p className="font-semibold text-slate-900">18%</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Stripe Processing Fee</p>
                  <p className="text-xs text-slate-600">Applied to customer payments</p>
                </div>
                <p className="font-semibold text-slate-900">2.9% + $0.30</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Payout Processing</p>
                  <p className="text-xs text-slate-600">Bank transfer to your account</p>
                </div>
                <p className="font-semibold text-slate-900">Free</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border-l-4 border-l-blue-500 rounded">
              <p className="text-xs text-blue-700">
                💡 <strong>Pro tip:</strong> Higher earnings and positive reviews can qualify you for lower platform fees.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}