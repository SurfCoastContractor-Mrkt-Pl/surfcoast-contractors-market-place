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
import ComplianceStatusWidget from '@/components/contractor/ComplianceStatusWidget';
import { getHighestBadge } from '@/components/badges/ContractorBadges';
import { differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import MetricsPanel from './MetricsPanel';
import { calculateContractorMetrics } from '@/lib/metricsCalculator';
import OnboardingNudgeBanner from '@/components/contractor/OnboardingNudgeBanner';
import ContractorAnalyticsMetrics from '@/components/contractor/ContractorAnalyticsMetrics';
import LegendStatusBadge from '@/components/contractor/LegendStatusBadge';
import CompletionRateWidget from '@/components/contractor/CompletionRateWidget';
import ReferralsCompletedWidget from '@/components/contractor/ReferralsCompletedWidget';
import RecentCompletedJobsFeed from '@/components/contractor/RecentCompletedJobsFeed';

const SURFCOAST_WAVES = [
  { id: 'ripple', wave: 1, name: 'Ripple', label: 'SurfCoast Ripple', badgeTierRequired: 1, customersRequired: 1, color: '#64748b', emoji: '〰️', description: 'Your first step into the platform' },
  { id: 'swell', wave: 2, name: 'Swell', label: 'SurfCoast Swell', badgeTierRequired: 2, customersRequired: 3, color: '#0ea5e9', emoji: '🌊', description: 'Building momentum with your clients' },
  { id: 'breaker', wave: 3, name: 'Breaker', label: 'SurfCoast Breaker', badgeTierRequired: 3, customersRequired: 5, color: '#3b82f6', emoji: '🏄', description: 'Full Field Ops access unlocked', isFieldOpsUnlock: true },
  { id: 'pipeline', wave: 4, name: 'Pipeline', label: 'SurfCoast Pipeline', badgeTierRequired: 5, customersRequired: 20, color: '#1d4ed8', emoji: '🌀', description: 'Elite contractor status' },
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

  const { data: completedScopes = [] } = useQuery({
    queryKey: ['contractor-completed-scopes', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const scopes = await base44.entities.ScopeOfWork.filter({
        contractor_email: user.email,
        status: 'closed'
      });
      return scopes || [];
    },
    enabled: !!user?.email,
  });

  const { data: allScopes = [] } = useQuery({
    queryKey: ['contractor-all-scopes', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const scopes = await base44.entities.ScopeOfWork.filter({
        contractor_email: user.email
      });
      return scopes || [];
    },
    enabled: !!user?.email,
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ['contractor-referrals', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const refs = await base44.entities.Referral.filter({
        referrer_email: user.email
      });
      return refs || [];
    },
    enabled: !!user?.email,
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

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#333",
    border: "#D0D0D2",
    amber: "#5C3500",
    shadow: "3px 3px 0px #5C3500",
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
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
          <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: '8px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
           <Zap style={{ width: '20px', height: '20px', color: T.amber, flexShrink: 0 }} />
           <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: T.dark }}>
             Your payout account isn't set up yet — you won't receive payment until you complete this step
           </p>
            </div>
            <Button
              onClick={handleSetupPayouts}
              disabled={payoutLoading}
              style={{ background: T.amber, color: '#fff', borderRadius: '8px', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap', flexShrink: 0 }}
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
               <h1 style={{ fontSize: '36px', fontWeight: 800, color: T.dark, margin: 0 }}>My Dashboard</h1>
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
          <p style={{ color: T.muted, marginTop: '8px' }}>Track your active jobs and communications</p>
          {contractorProfile && (
            <div className="mt-2 flex gap-4 text-sm">
              <span style={{ color: T.muted }}>
                👁️ <strong style={{ color: T.dark }}>{(contractorProfile.profile_views || 0).toLocaleString()}</strong> total profile views
              </span>
              <span style={{ color: T.muted }}>
                📅 <strong style={{ color: T.dark }}>{contractorProfile.profile_views_this_week || 0}</strong> this week
              </span>
            </div>
          )}
        </div>

        {/* Onboarding Nudge (Issue #4) */}
        {contractorProfile && (
          <OnboardingNudgeBanner contractor={contractorProfile} />
        )}

        {/* Analytics Metrics */}
        {contractorProfile && (
          <div className="mb-8">
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: T.dark, marginBottom: '16px' }}>Analytics</h2>
            <ContractorAnalyticsMetrics 
              contractorProfile={contractorProfile}
              completedScopes={completedScopes}
              allReviews={allReviews}
            />
          </div>
        )}

        {/* Legend Status Badge */}
        {contractorProfile && (
          <div className="mb-8">
            <LegendStatusBadge jobsCompleted={completedScopes.length} />
          </div>
        )}

        {/* Additional Metrics Row */}
        {contractorProfile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <CompletionRateWidget completedScopes={completedScopes} totalScopes={allScopes} />
            <ReferralsCompletedWidget referrals={referrals} />
            <RecentCompletedJobsFeed completedScopes={completedScopes} reviews={allReviews} />
          </div>
        )}

        {/* Metrics Panel */}
        {metrics && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <MetricsPanel metrics={metrics} onPeriodChange={setMetricsPeriod} currentPeriod={metricsPeriod} />
          </div>
        )}

        {/* Compliance Status Widget */}
        {contractorProfile && (
          <div className="mb-6">
            <ComplianceStatusWidget 
              contractor={contractorProfile} 
              onAppealClick={() => window.location.href = '/ComplianceGuide'}
            />
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
            <div style={{ marginBottom: '24px', borderRadius: '10px', border: `1px solid ${T.border}`, background: T.card, padding: '20px', boxShadow: T.shadow }}>
              <div className="flex items-center gap-2 mb-4">
                <Waves className="w-5 h-5" style={{ color: T.amber }} />
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: T.dark, margin: 0 }}>SurfCoast-Waves Progress</h2>
                {currentWave && (
                  <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ background: currentWave.color }}>
                    {currentWave.emoji} {currentWave.label}
                  </span>
                )}
                {!currentWave && (
                  <span style={{ marginLeft: 'auto', fontSize: '12px', color: T.muted, fontWeight: '500' }}>No wave yet — complete your first verified job</span>
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
                      className="rounded-lg border p-3 transition-all"
                      style={{
                        borderColor: isCurrent ? w.color : isUnlocked ? T.border : T.border,
                        background: isCurrent ? `${w.color}08` : T.bg,
                        opacity: isUnlocked ? 1 : 0.45,
                        boxShadow: isCurrent ? `0 0 0 2px ${w.color}44` : 'none',
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg">{w.emoji}</span>
                        {isUnlocked
                          ? <CheckCircle className="w-3.5 h-3.5" style={{ color: w.color }} />
                          : <Lock className="w-3 h-3" style={{ color: '#999' }} />
                        }
                      </div>
                      <p style={{ fontSize: '12px', fontWeight: 800, color: T.dark, lineHeight: '1.2', marginBottom: '4px' }}>{w.name}</p>
                      <p style={{ fontSize: '10px', color: T.muted, lineHeight: '1.2', marginBottom: '8px' }}>{w.customersRequired} customer{w.customersRequired !== 1 ? 's' : ''}</p>
                      {w.isFieldOpsUnlock && (
                        <span style={{ fontSize: '9px', fontWeight: 800, padding: '4px 6px', borderRadius: '4px', background: w.color, color: '#fff' }}>Field Ops</span>
                      )}
                      {!isUnlocked && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ width: '100%', height: '3px', background: T.border, borderRadius: '9999px' }}>
                            <div style={{ height: '3px', borderRadius: '9999px', width: `${progress}%`, background: w.color }} />
                          </div>
                          <p style={{ fontSize: '10px', color: T.muted, marginTop: '4px' }}>{uniqueCustomers}/{w.customersRequired}</p>
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
             <div style={{ borderRadius: '10px', border: `1px solid ${T.border}`, background: T.card, padding: '20px', boxShadow: T.shadow }}>
               <div style={{ borderBottom: `1px solid ${T.border}`, paddingBottom: '16px', marginBottom: '16px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                   <Briefcase className="w-5 h-5" style={{ color: T.amber }} />
                   <h3 style={{ fontSize: '16px', fontWeight: 800, color: T.dark, margin: 0 }}>Active Jobs</h3>
                 </div>
                 <p style={{ fontSize: '14px', color: T.muted, margin: '0' }}>Projects you're currently working on</p>
               </div>
              <div>
                {scopesLoading ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: T.muted }}>Loading jobs...</div>
                ) : activeScopes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <p style={{ color: T.muted, marginBottom: '16px' }}>No active jobs yet</p>
                    <Link to="/Jobs">
                      <Button>Browse Jobs</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeScopes.map((scope) => (
                      <div key={scope.id} style={{ border: `1px solid ${T.border}`, borderRadius: '8px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div>
                            <h3 style={{ fontWeight: '600', color: T.dark, margin: '0 0 4px 0' }}>{scope.job_title}</h3>
                            <p style={{ fontSize: '14px', color: T.muted, margin: 0 }}>Customer: {scope.customer_name}</p>
                          </div>
                          <Badge className={statusColor[scope.status] || 'bg-slate-100 text-slate-800'}>
                            {scope.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <p style={{ color: T.muted, margin: 0 }}>Scope:</p>
                            <p style={{ fontWeight: '500', color: T.dark, margin: 0 }}>${scope.cost_amount} {scope.cost_type === 'hourly' ? '/hr' : 'fixed'}</p>
                            {scope.platform_fee_percentage && (
                              <p style={{ fontSize: '12px', color: T.muted, marginTop: '4px' }}>
                                Payout: ${(scope.contractor_payout_amount || scope.cost_amount - (scope.cost_amount * scope.platform_fee_percentage / 100)).toFixed(2)}
                              </p>
                            )}
                          </div>
                          <div>
                            <p style={{ color: T.muted, margin: 0 }}>Work Date:</p>
                            <p style={{ fontWeight: '500', color: T.dark, margin: 0 }}>{scope.agreed_work_date || 'TBD'}</p>
                          </div>
                        </div>
                        <Link to={`/ProjectManagement?scopeId=${scope.id}`}>
                          <Button variant="outline" size="sm" className="w-full">View Details</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </div>
          </div>

          {/* Recent Messages */}
          <div>
            <div style={{ borderRadius: '10px', border: `1px solid ${T.border}`, background: T.card, padding: '20px', boxShadow: T.shadow }}>
              <div style={{ borderBottom: `1px solid ${T.border}`, paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <MessageSquare className="w-5 h-5" style={{ color: T.amber }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: T.dark, margin: 0 }}>Messages</h3>
                </div>
                <p style={{ fontSize: '14px', color: T.muted, margin: '0' }}>Recent unread messages</p>
              </div>
              <div>
                {messagesLoading ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: T.muted }}>Loading...</div>
                ) : recentMessages.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '32px 0', color: T.muted }}>No new messages</p>
                ) : (
                  <div className="space-y-3">
                    {recentMessages.map((msg) => (
                      <div key={msg.id} style={{ borderLeft: `2px solid ${T.amber}`, paddingLeft: '12px', paddingTop: '8px', paddingBottom: '8px' }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: T.dark, margin: 0 }}>{msg.sender_name}</p>
                        <p style={{ fontSize: '12px', color: T.muted, margin: '4px 0 0 0' }} className="line-clamp-2">{msg.body}</p>
                        <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                          {new Date(msg.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <Link to="/Messaging" className="mt-4 block">
                  <Button variant="outline" size="sm" className="w-full">View All Messages</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}