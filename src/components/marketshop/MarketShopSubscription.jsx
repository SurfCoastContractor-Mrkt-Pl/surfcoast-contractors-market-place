import React, { useState } from 'react';
import { CreditCard, ExternalLink, Ban, AlertTriangle, Loader2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function MarketShopSubscription({ shop }) {
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(shop.subscription_status !== 'active');

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('getVendorBillingPortal', { shop_id: shop.id });
      window.open(res.data.portal_url, '_blank');
    } catch (err) {
      console.error(err);
      alert('Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('getVendorBillingPortal', { shop_id: shop.id });
      window.open(res.data.portal_url, '_blank');
      setShowCancelModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  if (!shop?.id) return null;

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    past_due: 'bg-amber-100 text-amber-700',
    canceled: 'bg-red-100 text-red-700',
  };

  const nextBillingDate = shop.subscription_ends_at
    ? new Date(shop.subscription_ends_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const startDate = shop.created_date
    ? new Date(shop.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <CreditCard className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">My Subscription</h2>
      </div>

      {/* Inactive Subscription Alert */}
      {shop.subscription_status !== 'active' && shop.subscription_status !== 'past_due' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 mb-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900 text-sm">Subscription Inactive</p>
            <p className="text-xs sm:text-sm text-amber-800 mt-1">Choose a payment model below to activate your shop and access full features.</p>
          </div>
        </div>
      )}

      {shop.subscription_status === 'past_due' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-900 text-sm">Payment Failed</p>
            <p className="text-xs sm:text-sm text-red-700 mt-1">Update your payment method to keep your listing active.</p>
            <button
              onClick={handleManageBilling}
              disabled={loading}
              className="mt-3 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Update Payment Method'}
            </button>
          </div>
        </div>
      )}

      {/* Show Payment Model Selector if Inactive */}
      {showModelSelector && shop.subscription_status !== 'active' && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 sm:p-6 mb-6">
          <p className="text-sm font-semibold text-slate-900 mb-4">Choose Your Payment Model</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            {/* Subscription Model */}
            <div className="border-2 border-blue-200 rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-blue-50 transition">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Subscription</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">$35/month</p>
                  <p className="text-xs text-slate-600 mt-2">• Unlimited listings<br/>• 0% transaction fee<br/>• Keep 100% of sales</p>
                </div>
              </div>
            </div>

            {/* Facilitation Model */}
            <div className="border-2 border-slate-300 rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-slate-50 transition">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-slate-400 flex-shrink-0 mt-0.5"></div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Facilitation Fee</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">5% per sale</p>
                  <p className="text-xs text-slate-600 mt-2">• No monthly fee<br/>• Pay only on sales<br/>• Flexible pricing</p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowModelSelector(false)}
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        <div>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold">Current Plan</p>
          <p className="text-sm sm:text-base text-slate-900 font-semibold mt-1">Vendor Listing — $35/month</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">Status</p>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full mt-1 inline-block capitalize ${statusColors[shop.subscription_status] || statusColors.active}`}>
              {shop.subscription_status || 'active'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">Started</p>
            <p className="text-sm text-slate-900 mt-1">{startDate}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">Next Billing</p>
            <p className="text-sm text-slate-900 mt-1">{nextBillingDate}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
          <button
            onClick={handleManageBilling}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[44px]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            Manage Billing
          </button>
          {shop.subscription_status !== 'cancelled' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-red-600 text-red-600 text-xs sm:text-sm font-semibold rounded-lg hover:bg-red-50 min-h-[44px]"
            >
              <Ban className="w-4 h-4" />
              Cancel Subscription
            </button>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Cancel Subscription?</h3>
            <p className="text-sm text-slate-600 mb-4 sm:mb-6">
              You can manage your subscription from the Stripe billing portal. This will allow you to pause or cancel anytime.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 text-sm font-semibold rounded-lg hover:bg-slate-50 min-h-[44px]"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 min-h-[44px]"
              >
                {loading ? 'Loading...' : 'Go to Billing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}