import React, { useState } from 'react';
import { Zap, CheckCircle, AlertCircle, ExternalLink, Loader2, CreditCard } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function StripeConnectSetup({ shop }) {
  const [loading, setLoading] = useState(false);

  const isConnected = shop?.stripe_connect_charges_enabled;
  const isOnboarded = shop?.stripe_connect_onboarded;
  const hasPendingSetup = shop?.stripe_connect_account_id && !isConnected;

  const handleSetupConnect = async () => {
    if (window.self !== window.top) {
      alert('Please open from the published app to set up payouts.');
      return;
    }
    setLoading(true);
    try {
      const res = await base44.functions.invoke('createVendorConnectAccount', { shopId: shop.id });
      if (res.data?.onboardingUrl) {
        window.location.href = res.data.onboardingUrl;
      } else {
        alert(res.data?.error || 'Failed to start payout setup. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to start payout setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/65 backdrop-blur-sm rounded-xl border border-white/30 p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-900">Payouts & Split Payments</h2>
      </div>

      {isConnected ? (
        <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900 text-sm">Payout Account Active</p>
            <p className="text-xs text-green-700 mt-0.5">
              You receive <strong>95%</strong> of every sale automatically. The 5% platform fee is withheld per transaction.
            </p>
          </div>
        </div>
      ) : hasPendingSetup ? (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">Payout Setup Incomplete</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Your Stripe account was created but needs more information to enable payouts.
              </p>
            </div>
          </div>
          <button
            onClick={handleSetupConnect}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 min-h-[44px]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            Continue Payout Setup
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-slate-700">
              Connect a Stripe payout account to receive <strong>95%</strong> of each sale directly to your bank.
              The platform retains a <strong>5% fee</strong> per transaction.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-500" />
              <span>Automatic split payments</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              <span>Direct bank deposits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              <span>Secure via Stripe</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              <span>No manual payouts</span>
            </div>
          </div>
          <button
            onClick={handleSetupConnect}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[44px]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            Set Up Payouts with Stripe
          </button>
        </div>
      )}
    </div>
  );
}