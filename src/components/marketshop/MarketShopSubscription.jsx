import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ExternalLink, Ban, AlertTriangle, Loader2, Check, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function MarketShopSubscription({ shop }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(shop.subscription_status !== 'active');
  const [selectedModel, setSelectedModel] = useState(null);
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
  const [switchSuccess, setSwitchSuccess] = useState(false);

  const handleCheckout = async (model) => {
    if (window.self !== window.top) {
      alert('Checkout must be opened from a published app. Please visit the app directly.');
      return;
    }
    
    setLoading(true);
    try {
      const user = await base44.auth.me();
      if (!user) {
        alert('You must be logged in to checkout.');
        setLoading(false);
        return;
      }
      
      const res = await base44.functions.invoke('createMarketShopCheckout', {
        shopId: shop.id,
        paymentModel: model,
        ownerEmail: user.email,
        shopName: shop.shop_name,
        ownerName: shop.owner_name,
      });
      
      if (res.data?.activated) {
        // Facilitation model — shop activated directly
        window.location.reload();
      } else if (res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        alert('Failed to start checkout. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = () => {
    navigate('/MarketShopBillingManagement');
  };

  const handleSwitchModel = async (newModel) => {
    setLoading(true);
    try {
      await base44.functions.invoke('handlePaymentModelSwitch', {
        shop_id: shop.id,
        new_model: newModel,
      });
      setShowSwitchConfirm(false);
      setShowCancelModal(false);
      setShowModelSelector(false);
      setSwitchSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Failed to switch payment model. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel? Your shop will be deactivated immediately and you will not be able to receive new business until you choose a plan again.')) return;
    setLoading(true);
    try {
      await base44.functions.invoke('cancelMarketShopSubscription', { shop_id: shop.id });
      setShowCancelModal(false);
      alert('Your subscription has been cancelled. Your shop is now inactive.');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!shop?.id) return null;

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    past_due: 'bg-amber-100 text-amber-700',
    canceled: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-slate-100 text-slate-600',
    inactive: 'bg-slate-100 text-slate-600',
  };

  const statusLabels = {
    active: 'Active',
    past_due: 'Payment Failed',
    canceled: 'Cancelled',
    cancelled: 'Cancelled',
    inactive: 'No Active Plan',
  };

  const nextBillingDate = shop.subscription_ends_at
    ? new Date(shop.subscription_ends_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const startDate = shop.created_date
    ? new Date(shop.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <div className="bg-white/65 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/30 p-4 sm:p-6 mb-6 sm:mb-8">
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
              className="mt-3 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700"
            >
              Update Payment Method
            </button>
          </div>
        </div>
      )}

      {/* Show Payment Model Selector if Inactive */}
      {showModelSelector && shop.subscription_status !== 'active' && (
        <div className="bg-white/40 border border-white/30 rounded-lg p-4 sm:p-6 mb-6">
          <p className="text-sm font-semibold text-slate-900 mb-4">Choose Your Payment Model</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            {/* Subscription Model */}
            <button
              onClick={() => setSelectedModel('subscription')}
              className={`border-2 rounded-lg p-3 sm:p-4 text-left transition ${
                selectedModel === 'subscription'
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  selectedModel === 'subscription' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                }`}>
                  {selectedModel === 'subscription' && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Monthly Subscription</p>
                  <p className="text-lg font-bold text-blue-700 mt-1">$35/month</p>
                  <p className="text-xs text-slate-600 mt-2">• Unlimited listings<br/>• 0% transaction fee<br/>• Keep 100% of sales</p>
                </div>
              </div>
            </button>

            {/* Facilitation Model */}
            <button
              onClick={() => setSelectedModel('facilitation')}
              className={`border-2 rounded-lg p-3 sm:p-4 text-left transition ${
                selectedModel === 'facilitation'
                  ? 'border-green-600 bg-green-50 ring-2 ring-green-200'
                  : 'border-slate-200 hover:border-green-300 hover:bg-green-50/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  selectedModel === 'facilitation' ? 'border-green-600 bg-green-600' : 'border-slate-300'
                }`}>
                  {selectedModel === 'facilitation' && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Facilitation Fee</p>
                  <p className="text-lg font-bold text-green-700 mt-1">5% per sale</p>
                  <p className="text-xs text-slate-600 mt-2">• No monthly fee<br/>• Pay only on sales<br/>• Flexible pricing</p>
                </div>
              </div>
            </button>
          </div>

          {/* Next-cycle notice when switching from active */}
          {selectedModel && (
            <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                {selectedModel === 'facilitation'
                  ? 'Switching to the 5% Facilitation Fee model. This will take effect at the start of your next billing cycle — your current plan remains active until then.'
                  : 'Switching to the $35/month Subscription. This will take effect at the start of your next billing cycle.'}
              </p>
            </div>
          )}

          <button
            onClick={() => {
              if (!selectedModel) return;
              if (selectedModel === 'facilitation') {
                setShowSwitchConfirm(true);
              } else {
                handleCheckout(selectedModel);
              }
            }}
            disabled={!selectedModel || loading}
            className={`w-full px-4 py-2 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center gap-2 transition ${
              selectedModel === 'facilitation' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {selectedModel === 'facilitation' ? 'Switch to Facilitation Fee' : selectedModel === 'subscription' ? 'Start $35/month Subscription' : 'Select a Plan'}
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
          {shop.subscription_status === 'active' && (
            <>
              <button
                onClick={handleManageBilling}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-blue-700 min-h-[44px]"
              >
                <ExternalLink className="w-4 h-4" />
                Manage Billing
              </button>
              <button
                onClick={() => setShowModelSelector(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 text-xs sm:text-sm font-semibold rounded-lg hover:bg-blue-50 min-h-[44px]"
              >
                Switch Payment Model
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-red-600 text-red-600 text-xs sm:text-sm font-semibold rounded-lg hover:bg-red-50 min-h-[44px]"
              >
                <Ban className="w-4 h-4" />
                Cancel
              </button>
            </>
          )}
          {shop.subscription_status === 'cancelled' && (
            <button
              onClick={() => setShowModelSelector(true)}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 min-h-[44px] flex-1"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Renew Subscription
            </button>
          )}
        </div>
      </div>

      {/* Switch Confirmed Success Banner */}
      {switchSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Request Received!</h3>
            <p className="text-sm text-slate-600 mb-2">
              Your payment model switch to <span className="font-semibold text-green-700">Facilitation Fee (5% per sale)</span> has been saved.
            </p>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-5">
              ⏳ This change will take effect at the start of your <strong>next billing cycle</strong>. Your current plan remains active until then.
            </p>
            <button
              onClick={() => setSwitchSuccess(false)}
              className="w-full px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 min-h-[44px]"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Switch Confirmation Modal */}
      {showSwitchConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Confirm Plan Switch</h3>
            <p className="text-sm text-slate-600 mb-3">
              You are switching to the <span className="font-semibold text-green-700">Facilitation Fee — 5% per sale</span> model.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                This change <strong>cannot be reversed mid-cycle</strong>. It will take effect at the start of your next billing cycle. Your current plan continues until then.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSwitchConfirm(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 min-h-[44px]"
              >
                Go Back
              </button>
              <button
                onClick={() => handleSwitchModel('facilitation')}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Confirm Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel/Switch Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Manage Subscription</h3>
            <p className="text-xs text-slate-500 mb-4">Choose an option below to manage your plan.</p>
            <div className="space-y-3 mb-6">
              {/* Billing Portal — Pause / Update Payment / Cancel */}
              <button
                onClick={() => { setShowCancelModal(false); handleManageBilling(); }}
                className="w-full px-4 py-3 border-2 border-blue-200 text-slate-900 text-sm rounded-lg hover:bg-blue-50 min-h-[44px] text-left"
              >
                <p className="font-bold">Pause, Update Payment or Cancel</p>
                <p className="text-xs text-slate-500 mt-0.5">Opens the secure Stripe billing portal</p>
              </button>

              {/* Switch to Facilitation */}
              <button
                onClick={() => { setShowCancelModal(false); setSelectedModel('facilitation'); setShowSwitchConfirm(true); }}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-slate-200 text-slate-900 text-sm rounded-lg hover:bg-slate-50 disabled:opacity-50 min-h-[44px] text-left"
              >
                <p className="font-bold">Switch to Facilitation Fee</p>
                <p className="text-xs text-slate-500 mt-0.5">5% per sale, no monthly fee — takes effect next cycle</p>
              </button>

              {/* Hard Cancel */}
              <button
                onClick={handleCancelSubscription}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-red-200 text-red-700 text-sm rounded-lg hover:bg-red-50 disabled:opacity-50 min-h-[44px] text-left"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
                <p className="font-bold">Cancel Immediately</p>
                <p className="text-xs text-red-400 mt-0.5">Deactivates your shop right away — no refund</p>
              </button>
            </div>
            <button
              onClick={() => setShowCancelModal(false)}
              className="w-full px-4 py-2 border border-slate-300 text-slate-900 text-sm font-semibold rounded-lg hover:bg-slate-50 min-h-[44px]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}