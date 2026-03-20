import React, { useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MessageSquare, Clock, CheckCircle, AlertCircle, Zap, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import PendingRatingModal from '@/components/ratings/PendingRatingModal';
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

   const { data: contractorProfile } = useQuery({
     queryKey: ['contractor-profile-dashboard', user?.email],
     queryFn: async () => {
       const results = await base44.entities.Contractor.filter({ email: user.email });
       return results?.[0] || null;
     },
     enabled: !!user?.email,
   });

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
        {/* Stripe Payout Banner */}
        {contractorProfile?.stripe_account_setup_complete && !contractorProfile?.stripe_account_charges_enabled && (
          <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '10px', padding: '12px 20px', marginBottom: '16px', color: '#92400e', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span>
            Your Stripe payout account is not yet fully active. Please check your email to complete setup and enable payments.
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-4xl font-bold text-slate-900">Contractor Dashboard</h1>
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