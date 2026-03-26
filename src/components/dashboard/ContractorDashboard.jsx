import { useEffect, useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MessageSquare, Clock, CheckCircle, AlertCircle, Zap, Loader2, LogOut, Lock, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import PendingRatingModal from '@/components/ratings/PendingRatingModal';
import ServiceAgreementGenerator from '@/components/contractor/ServiceAgreementGenerator';
import RatingBlockStatusWidget from '@/components/ratings/RatingBlockStatusWidget';
import { getHighestBadge } from '@/components/badges/ContractorBadges';
import { differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import MetricsPanel from './MetricsPanel';
import { calculateContractorMetrics } from '@/lib/metricsCalculator';

const SURFCOAST_WAVES = [
  { id: 'ripple', wave: 1, name: 'Ripple', label: 'SurfCoast Ripple', badgeTierRequired: 1, customersRequired: 1, color: '#64748b', emoji: '〰️', description: 'Your first step into the platform' },
  { id: 'swell', wave: 2, name: 'Swell', label: 'SurfCoast Swell', badgeTierRequired: 2, customersRequired: 3, color: '#0ea5e9', emoji: '🌊', description: 'Building momentum with your clients' },
  { id: 'breaker', wave: 3, name: 'Breaker', label: 'SurfCoast Breaker', badgeTierRequired: 3, customersRequired: 5, color: '#3b82f6', emoji: '🏄', description: 'Full Field Ops access unlocked', isFieldOpsUnlock: true },
  { id: 'pipeline', wave: 4, name: 'Pipeline', label: 'SurfCoast Pipeline', badgeTierRequired: 5, customersRequired: 20, color: '#6366f1', emoji: '🌀', description: 'Elite contractor status' },
  { id: 'residential_wave', wave: 5, name: 'Residential Wave', label: 'Residential Wave Rider', badgeTierRequired: 6, customersRequired: 50, color: '#f59e0b', emoji: '🏆', description: 'Top tier — HIS licensed professionals only', requiresHIS: true },
];

export default function ContractorDashboard() {
  const [user, setUser] = useState(null);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [metricsPeriod, setMetricsPeriod] = useState('all_time');
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

  const { data: allReviews = [] } = useQuery({
    queryKey: ['contractor-reviews', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const reviews = await base44.entities.Review.filter({
        contractor_id: contractorProfile?.id
      });
      return reviews || [];
    },
    enabled: !!contractorProfile?.id,
  });

  const metrics = useMemo(() => {
    if (!contractorProfile) return null;
    return calculateContractorMetrics(activeScopes, allReviews, metricsPeriod);
  }, [activeScopes, allReviews, metricsPeriod, contractorProfile]);

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
          <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl font-bold text-slate-900">My Dashboard</h1>
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
            <button
              onClick={() => base44.auth.logout()}
              className="flex items-center gap-1.5 text-sm font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg px-3 py-2 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
          <p className="text-slate-600">Track your active jobs and communications</p>
        </div>

        {/* Metrics Panel */}
        {metrics && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <MetricsPanel metrics={metrics} onPeriodChange={setMetricsPeriod} currentPeriod={metricsPeriod} />
          </div>
        )}

        {/* Rating Block Status Widget */}
        {user?.email && (
          <RatingBlockStatusWidget userEmail={user.email} userType="contractor" />
        )}

        {/* Service Agreement Generator */}
        {contractorProfile && (
          <div className="mb-6">
            <ServiceAgreementGenerator contractor={contractorProfile} />
          </div>
        )}

        {/* SurfCoast-Waves Progress */}
        {contractorProfile && (() => {
          const uniqueCustomers = contractorProfile.unique_customers_count || 0;
          const highestBadge = getHighestBadge(uniqueCustomers);
          const highestTier = highestBadge?.tier || 0;
          const unlockedWaves = SURFCOAST_WAVES.filter(w => highestTier >= w.badgeTierRequired);
          const currentWave = unlockedWaves.length > 0 ? unlockedWaves[unlockedWaves.length - 1] : null;

          return (
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Waves className="w-5 h-5 text-blue-500" />
                <h2 className="text-base font-bold text-slate-800">SurfCoast-Waves Progress</h2>
                {currentWave && (
                  <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ background: currentWave.color }}>
                    {currentWave.emoji} {currentWave.label}
                  </span>
                )}
                {!currentWave && (
                  <span className="ml-auto text-xs text-slate-400 font-medium">No wave yet — complete your first verified job</span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {SURFCOAST_WAVES.map(w => {
                  const isUnlocked = highestTier >= w.badgeTierRequired;
                  const isCurrent = currentWave?.id === w.id;
                  const progress = Math.min(100, Math.round((uniqueCustomers / w.customersRequired) * 100));
                  return (
                    <div
                      key={w.id}
                      className="rounded-xl border p-3 transition-all"
                      style={{
                        borderColor: isCurrent ? w.color : isUnlocked ? '#cbd5e1' : '#e2e8f0',
                        background: isCurrent ? `${w.color}18` : isUnlocked ? '#f8fafc' : '#f8fafc',
                        opacity: isUnlocked ? 1 : 0.45,
                        boxShadow: isCurrent ? `0 0 0 2px ${w.color}44` : 'none',
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg">{w.emoji}</span>
                        {isUnlocked
                          ? <CheckCircle className="w-3.5 h-3.5" style={{ color: w.color }} />
                          : <Lock className="w-3 h-3 text-slate-400" />
                        }
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-tight mb-0.5">{w.name}</p>
                      <p className="text-[10px] text-slate-500 leading-tight mb-2">{w.customersRequired} customer{w.customersRequired !== 1 ? 's' : ''}</p>
                      {w.isFieldOpsUnlock && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Field Ops</span>
                      )}
                      {!isUnlocked && (
                        <div className="mt-2">
                          <div className="w-full h-1 bg-slate-200 rounded-full">
                            <div className="h-1 rounded-full" style={{ width: `${progress}%`, background: w.color }} />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{uniqueCustomers}/{w.customersRequired}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

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