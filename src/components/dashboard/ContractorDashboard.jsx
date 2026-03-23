import React, { useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MessageSquare, Clock, CheckCircle, AlertCircle, Zap, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import PendingRatingModal from '@/components/ratings/PendingRatingModal';
import ServiceAgreementGenerator from '@/components/contractor/ServiceAgreementGenerator';
import { differenceInDays } from 'date-fns';
import { toast } from 'sonner';

export default function ContractorDashboard() {
  const [user, setUser] = useState(null);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    getUser();
  }, []);

  const { data: contractorProfile, refetch: refetchContractor } = useQuery({
    queryKey: ['contractor-profile-dashboard', user?.email],
    queryFn: async () => {
      const results = await base44.entities.Contractor.filter({ email: user.email });
      return results?.[0] || null;
    },
    enabled: !!user?.email,
  });

  // Handle Stripe return URL params
  useEffect(() => {
    if (!contractorProfile) return;
    const params = new URLSearchParams(window.location.search);

    if (params.get('stripe_onboarding') === 'complete') {
      // Sync Stripe status then show success toast
      base44.functions.invoke('syncContractorStripeStatus', { contractor_id: contractorProfile.id })
        .then(() => {
          refetchContractor();
          toast.success('Payout account connected! You\'re ready to receive earnings.');
        });
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('stripe_refresh') === 'true') {
      toast.warning('Your Stripe session expired — click below to restart');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [contractorProfile?.id]);

  const handleSetupPayouts = async () => {
    if (!contractorProfile) return;
    setPayoutLoading(true);
    try {
      const response = await base44.functions.invoke('createStripeConnectOnboarding', {
        contractor_id: contractorProfile.id
      });
      const url = response?.data?.onboardingUrl || response?.data?.loginLink;
      if (url) {
        window.location.href = url;
      } else {
        toast.error('Could not retrieve onboarding link. Please try again.');
      }
    } catch {
      toast.error('Failed to start payout setup. Please try again.');
    } finally {
      setPayoutLoading(false);
    }
  };

  const { data: pendingRatingScopes = [] } = useQuery({
    queryKey: ['contractor-pending-ratings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const scopes = await base44.entities.ScopeOfWork.filter({ contractor_email: user.email, status: 'pending_ratings' });
      return (scopes || []).filter(s => !s.contractor_satisfaction_rating);
    },
    enabled: !!user?.email,
  });

  const { data: activeScopes = [], isLoading: scopesLoading } = useQuery({
    queryKey: ['contractor-scopes', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const scopes = await base44.entities.ScopeOfWork.filter({
        contractor_email: user.email,
        status: 'approved'
      });
      return scopes || [];
    },
    enabled: !!user?.email,
  });

  const { data: recentMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['contractor-messages', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const messages = await base44.entities.Message.filter({
        recipient_email: user.email,
        read: false
      });
      return (messages || []).slice(0, 5);
    },
    enabled: !!user?.email,
  });

  const statusColor = {
    pending_approval: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    closed: 'bg-green-100 text-green-800',
  };

  const statusIcon = {
    pending_approval: <Clock className="w-4 h-4" />,
    approved: <Briefcase className="w-4 h-4" />,
    rejected: <AlertCircle className="w-4 h-4" />,
    closed: <CheckCircle className="w-4 h-4" />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {pendingRatingScopes.length > 0 && (
        <PendingRatingModal
          scope={pendingRatingScopes[0]}
          raterType="contractor"
          raterEmail={user?.email}
          onDone={() => {}}
        />
      )}
      <div className="max-w-7xl mx-auto">
        {/* Payout Not Set Up — Amber Warning Banner */}
        {contractorProfile && !contractorProfile.stripe_account_charges_enabled && (
          <div style={{ background: '#fffbeb', border: '2px solid #f59e0b', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
              <Zap style={{ width: '20px', height: '20px', color: '#d97706', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
                Your payout account isn't set up yet — you won't receive payment until you complete this step
              </p>
            </div>
            <Button
              onClick={handleSetupPayouts}
              disabled={payoutLoading}
              style={{ background: '#d97706', color: '#fff', borderRadius: '8px', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {payoutLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Set Up Payouts Now →
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-4xl font-bold text-slate-900">My Dashboard</h1>
            {/* Payouts Active Badge */}
            {contractorProfile?.stripe_account_charges_enabled && (
              <div style={{ background: '#dcfce7', color: '#166534', borderRadius: '20px', padding: '5px 12px', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                💸 Payouts Active — deposits within 2 business days
              </div>
            )}
            {contractorProfile?.trial_active && (
              <div style={{ background: '#dcfce7', color: '#166534', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', fontWeight: '600', display: 'inline-block' }}>
                🟢 Free Trial Active — {differenceInDays(new Date(contractorProfile.trial_ends_at), new Date())} days remaining
              </div>
            )}
            {contractorProfile?.trial_expired && !contractorProfile?.trial_active && (
              <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', fontWeight: '600', display: 'inline-block' }}>
                ⛔ Trial Expired — Upgrade to continue
              </div>
            )}
          </div>
          <p className="text-slate-600">Track your active jobs and communications</p>
        </div>

        {/* Service Agreement Generator */}
        {contractorProfile && (
          <div className="mb-6">
            <ServiceAgreementGenerator contractor={contractorProfile} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Active Jobs */}
           <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Active Jobs
                </CardTitle>
                <CardDescription>Projects you're currently working on</CardDescription>
              </CardHeader>
              <CardContent>
                {scopesLoading ? (
                  <div className="text-center py-8 text-slate-500">Loading jobs...</div>
                ) : activeScopes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-4">No active jobs yet</p>
                    <Link to="/Jobs">
                      <Button>Browse Jobs</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeScopes.map((scope) => (
                      <div key={scope.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-slate-900">{scope.job_title}</h3>
                            <p className="text-sm text-slate-600">Customer: {scope.customer_name}</p>
                          </div>
                          <Badge className={statusColor[scope.status] || 'bg-slate-100 text-slate-800'}>
                            {scope.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-slate-600">Scope:</p>
                            <p className="font-medium text-slate-900">${scope.cost_amount} {scope.cost_type === 'hourly' ? '/hr' : 'fixed'}</p>
                            {scope.platform_fee_percentage && (
                              <p className="text-xs text-slate-500 mt-1">
                                Payout: ${(scope.contractor_payout_amount || scope.cost_amount - (scope.cost_amount * scope.platform_fee_percentage / 100)).toFixed(2)}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-slate-600">Work Date:</p>
                            <p className="font-medium text-slate-900">{scope.agreed_work_date || 'TBD'}</p>
                          </div>
                        </div>
                        <Link to={`/ProjectManagement?scopeId=${scope.id}`}>
                          <Button variant="outline" size="sm" className="w-full">View Details</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Messages */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Messages
                </CardTitle>
                <CardDescription>Recent unread messages</CardDescription>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="text-center py-8 text-slate-500">Loading...</div>
                ) : recentMessages.length === 0 ? (
                  <p className="text-center py-8 text-slate-500">No new messages</p>
                ) : (
                  <div className="space-y-3">
                    {recentMessages.map((msg) => (
                      <div key={msg.id} className="border-l-2 border-blue-500 pl-3 py-2">
                        <p className="text-xs font-semibold text-slate-900">{msg.sender_name}</p>
                        <p className="text-xs text-slate-600 line-clamp-2">{msg.body}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(msg.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <Link to="/Messaging" className="mt-4 block">
                  <Button variant="outline" size="sm" className="w-full">View All Messages</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}