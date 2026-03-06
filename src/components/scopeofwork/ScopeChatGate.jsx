import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { MessageSquare, Star, CreditCard, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import PaymentGate from '@/components/payment/PaymentGate';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import ProjectChat from '@/components/projects/ProjectChat';

/**
 * ScopeChatGate
 * Checks if the user has a valid subscription OR a confirmed $1.50 platform fee payment.
 * If yes → shows ProjectChat freely.
 * If no  → prompts them to subscribe ($20/mo) or pay the $1.50 access fee.
 * Chat is always locked for closed/rejected/cancelled scopes.
 */
export default function ScopeChatGate({ scope, userEmail, userName, userType }) {
  const [showPaymentGate, setShowPaymentGate] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [paidThisSession, setPaidThisSession] = useState(false);

  // Check for active subscription
  const { data: subscription, isLoading: loadingSub } = useQuery({
    queryKey: ['subscription-check', userEmail],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ user_email: userEmail, status: 'active' });
      return subs?.[0] || null;
    },
    enabled: !!userEmail,
    staleTime: 60000,
  });

  // Check for a confirmed platform fee payment linking this user to the other party
  const { data: payment, isLoading: loadingPayment } = useQuery({
    queryKey: ['chat-payment-check', userEmail, scope?.id],
    queryFn: async () => {
      // Look for a confirmed payment from this user to/from the contractor on this scope
      const counterpartyEmail = userType === 'customer' ? scope.contractor_email : scope.customer_email;
      const payments = await base44.entities.Payment.filter({
        payer_email: userEmail,
        status: 'confirmed',
      });
      // Match by contractor email if customer, or look for contractor payments
      return payments?.find(p =>
        p.contractor_email === counterpartyEmail || p.payer_email === counterpartyEmail
      ) || null;
    },
    enabled: !!userEmail && !!scope?.id,
    staleTime: 30000,
  });

  const isLoading = loadingSub || loadingPayment;
  const hasActiveSubscription = !!subscription;
  const hasPaidFee = !!payment || paidThisSession;
  const isUnlocked = hasActiveSubscription || hasPaidFee;

  const counterpartyName = userType === 'customer' ? scope.contractor_name : scope.customer_name;
  const counterpartyEmail = userType === 'customer' ? scope.contractor_email : scope.customer_email;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (isUnlocked) {
    return (
      <div className="flex flex-col h-full">
        {/* Access indicator */}
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border-b border-green-100 shrink-0">
          {hasActiveSubscription ? (
            <>
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs text-green-700 font-medium">Unlimited Communication — Active Subscriber</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs text-green-700 font-medium">Platform Access Verified</span>
            </>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <ProjectChat
            scopeId={scope.id}
            userEmail={userEmail}
            userName={userName}
            userType={userType}
          />
        </div>
      </div>
    );
  }

  // Not unlocked — show paywall
  return (
    <>
      <div className="flex flex-col items-center justify-center h-full px-6 py-10 text-center space-y-5 bg-slate-50">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
          <Lock className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Project Chat Requires Access</h3>
          <p className="text-sm text-slate-500 max-w-xs">
            To communicate with <strong>{counterpartyName}</strong> about <em>"{scope.job_title}"</em>, you need either a platform access fee or an active subscription.
          </p>
        </div>

        {/* Option 1: $1.50 one-time */}
        <div className="w-full max-w-xs border border-slate-200 rounded-xl p-4 bg-white space-y-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">One-Time Access</span>
            <span className="text-lg font-bold text-amber-600">$1.50</span>
          </div>
          <p className="text-xs text-slate-500">Unlock chat for this project. One fee per contractor relationship.</p>
          <Button
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
            size="sm"
            onClick={() => setShowPaymentGate(true)}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Pay $1.50 & Unlock Chat
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Option 2: $20/month subscription */}
        <div className="w-full max-w-xs border border-amber-200 rounded-xl p-4 bg-amber-50 space-y-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">Unlimited Plan</span>
            <span className="text-lg font-bold text-slate-900">$20<span className="text-sm font-normal text-slate-500">/mo</span></span>
          </div>
          <p className="text-xs text-slate-500">Unlimited communication across all projects. Cancel anytime.</p>
          <ul className="text-xs text-slate-600 space-y-1">
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-600" /> Chat on all approved scopes</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-600" /> No per-contractor fees</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-600" /> Cancel anytime</li>
          </ul>
          <Button
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold"
            size="sm"
            onClick={() => setShowSubscriptionModal(true)}
          >
            <Star className="w-4 h-4 mr-2" />
            Subscribe & Get Unlimited Access
          </Button>
        </div>

        <p className="text-xs text-slate-400 max-w-xs">
          Fees disclosed per California SB 478 (Honest Pricing Law). All payments processed securely via Stripe.
        </p>
      </div>

      {/* Payment Gate Modal */}
      <PaymentGate
        open={showPaymentGate}
        onClose={() => setShowPaymentGate(false)}
        onPaid={() => {
          setPaidThisSession(true);
          setShowPaymentGate(false);
        }}
        payerType={userType}
        contractorId={userType === 'customer' ? scope.contractor_id : undefined}
        contractorEmail={counterpartyEmail}
        contractorName={counterpartyName}
      />

      {/* Subscription Modal */}
      <SubscriptionModal
        open={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        userEmail={userEmail}
        userType={userType}
      />
    </>
  );
}