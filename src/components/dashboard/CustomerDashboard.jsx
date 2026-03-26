import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MessageSquare, Users, TrendingUp, Loader2, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import PendingRatingModal from '@/components/ratings/PendingRatingModal';
import TrialBadge from '@/components/customer/TrialBadge';

export default function CustomerDashboard({ user: propUser }) {
  const [user, setUser] = useState(propUser || null);

  useEffect(() => {
    if (!propUser) {
      const getUser = async () => {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      };
      getUser();
    } else {
      setUser(propUser);
    }
  }, [propUser]);

  const { data: customerProfile } = useQuery({
    queryKey: ['customer-profile-dashboard', user?.email],
    queryFn: async () => {
      const results = await base44.entities.CustomerProfile.filter({ email: user.email });
      return results?.[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: pendingRatingScopes = [] } = useQuery({
    queryKey: ['customer-pending-ratings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const scopes = await base44.entities.ScopeOfWork.filter({ customer_email: user.email, status: 'pending_ratings' });
      return (scopes || []).filter(s => !s.customer_satisfaction_rating);
    },
    enabled: !!user?.email,
  });

  const { data: myJobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['customer-jobs', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const jobs = await base44.entities.Job.filter({
        poster_email: user.email,
      });
      return jobs || [];
    },
    enabled: !!user?.email,
  });

  const { data: activeScopes = [], isLoading: scopesLoading } = useQuery({
    queryKey: ['customer-scopes', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const scopes = await base44.entities.ScopeOfWork.filter({
        customer_email: user.email,
        status: 'approved'
      });
      return scopes || [];
    },
    enabled: !!user?.email,
  });

  const { data: quoteRequests = [], isLoading: quotesLoading } = useQuery({
    queryKey: ['customer-quotes', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const quotes = await base44.entities.QuoteRequest.filter({
        customer_email: user.email
      });
      return quotes || [];
    },
    enabled: !!user?.email,
  });

  const { data: recentMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['customer-messages', user?.email],
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

  const jobStatusColor = {
    open: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-slate-100 text-slate-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const scopeStatusColor = {
    pending_approval: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    closed: 'bg-green-100 text-green-800',
  };

  if (!user) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2040 50%, #0a1628 100%)' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2040 50%, #0a1628 100%)' }}>
      {pendingRatingScopes.length > 0 && (
        <PendingRatingModal
          scope={pendingRatingScopes[0]}
          raterType="customer"
          raterEmail={user?.email}
          onDone={() => {}}
        />
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl font-bold text-white">My Dashboard</h1>
              <TrialBadge profile={customerProfile} />
            </div>
            <button
              onClick={() => base44.auth.logout()}
              style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '8px 14px', fontWeight: '600', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut style={{ width: '14px', height: '14px' }} /> Logout
            </button>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Track your posted jobs and active scopes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posted Jobs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Open Jobs */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(45,140,200,0.3)', borderRadius: '12px', padding: '20px', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-5 h-5" style={{ color: '#1d6fa4' }} />
                <h2 className="font-semibold text-white text-base">Posted Jobs</h2>
              </div>
              <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>All your posted jobs and their current status</p>
              {jobsLoading ? (
                <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.5)' }}>Loading jobs...</div>
              ) : myJobs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>No open jobs</p>
                  <Link to="/QuickJobPost">
                    <button style={{ background: '#1d6fa4', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Post a Job</button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myJobs.map((job) => (
                    <div key={job.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '14px' }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-white text-sm">{job.title}</h3>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{job.location}</p>
                        </div>
                        <span style={{
                          background: job.status === 'open' ? 'rgba(34,197,94,0.2)' : job.status === 'in_progress' ? 'rgba(234,179,8,0.2)' : job.status === 'completed' ? 'rgba(148,163,184,0.15)' : 'rgba(239,68,68,0.2)',
                          color: job.status === 'open' ? '#4ade80' : job.status === 'in_progress' ? '#fbbf24' : job.status === 'completed' ? '#94a3b8' : '#f87171',
                          fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px',
                          border: `1px solid ${job.status === 'open' ? 'rgba(34,197,94,0.4)' : job.status === 'in_progress' ? 'rgba(234,179,8,0.4)' : job.status === 'completed' ? 'rgba(148,163,184,0.3)' : 'rgba(239,68,68,0.4)'}`
                        }}>
                          {job.status === 'in_progress' ? 'in progress' : job.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs mb-3 line-clamp-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{job.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Budget: ${job.budget_min || '0'} - ${job.budget_max || 'TBD'}</span>
                        <Link to={`/MyJobs?jobId=${job.id}`}>
                          <button style={{ background: 'transparent', color: '#60b4e8', border: '1px solid rgba(29,111,164,0.5)', borderRadius: '6px', padding: '5px 12px', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>View Responses</button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quote Requests */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(45,140,200,0.3)', borderRadius: '12px', padding: '20px', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-5 h-5" style={{ color: '#1d6fa4' }} />
                <h2 className="font-semibold text-white text-base">Quote Requests</h2>
              </div>
              <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>Pending contractor quotes</p>
              {quotesLoading ? (
                <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.5)' }}>Loading quotes...</div>
              ) : quoteRequests.length === 0 ? (
                <p className="text-center py-8" style={{ color: 'rgba(255,255,255,0.4)' }}>No quote requests</p>
              ) : (
                <div className="space-y-3">
                  {quoteRequests.map((quote) => (
                    <div key={quote.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '14px' }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-white text-sm">{quote.job_title}</h3>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>From: {quote.contractor_name}</p>
                        </div>
                        <span style={{ background: quote.status === 'quoted' ? 'rgba(34,197,94,0.2)' : quote.status === 'view_denied' ? 'rgba(239,68,68,0.2)' : 'rgba(217,119,6,0.2)', color: quote.status === 'quoted' ? '#4ade80' : quote.status === 'view_denied' ? '#f87171' : '#fbbf24', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px' }}>
                          {quote.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {quote.quote_amount && (
                        <p className="text-sm font-semibold mb-1" style={{ color: '#d97706' }}>Quote: ${quote.quote_amount}</p>
                      )}
                      {quote.quote_message && (
                        <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{quote.quote_message}</p>
                      )}
                      <Link to={`/MyJobs?jobId=${quote.job_id}`}>
                        <button style={{ background: 'transparent', color: '#60b4e8', border: '1px solid rgba(29,111,164,0.5)', borderRadius: '6px', padding: '5px 12px', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>View Details</button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Scopes */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(217,119,6,0.3)', borderRadius: '12px', padding: '20px', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5" style={{ color: '#d97706' }} />
                <h2 className="font-semibold text-white text-base">Active Projects</h2>
              </div>
              <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>Approved scopes in progress</p>
              {scopesLoading ? (
                <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</div>
              ) : activeScopes.length === 0 ? (
                <p className="text-center py-8" style={{ color: 'rgba(255,255,255,0.4)' }}>No active projects yet</p>
              ) : (
                <div className="space-y-3">
                  {activeScopes.map((scope) => (
                    <div key={scope.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '14px' }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-white text-sm">{scope.job_title}</h3>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Contractor: {scope.contractor_name}</p>
                        </div>
                        <span style={{ background: 'rgba(217,119,6,0.2)', color: '#fbbf24', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px' }}>
                          {scope.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                        <div>
                          <p style={{ color: 'rgba(255,255,255,0.45)' }}>Cost:</p>
                          <p className="font-semibold text-white">${scope.cost_amount} {scope.cost_type === 'hourly' ? '/hr' : 'fixed'}</p>
                        </div>
                        <div>
                          <p style={{ color: 'rgba(255,255,255,0.45)' }}>Scheduled:</p>
                          <p className="font-semibold text-white">{scope.agreed_work_date || 'Pending'}</p>
                        </div>
                      </div>
                      <Link to={`/ProjectManagement?scopeId=${scope.id}`}>
                        <button style={{ width: '100%', background: 'rgba(217,119,6,0.15)', color: '#fbbf24', border: '1px solid rgba(217,119,6,0.4)', borderRadius: '6px', padding: '7px 12px', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>Track Progress</button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Messages */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(45,140,200,0.3)', borderRadius: '12px', padding: '20px', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-5 h-5" style={{ color: '#1d6fa4' }} />
                <h2 className="font-semibold text-white text-base">Messages</h2>
              </div>
              <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>Recent unread messages</p>
              {messagesLoading ? (
                <div className="text-center py-6" style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</div>
              ) : recentMessages.length === 0 ? (
                <p className="text-center py-6" style={{ color: 'rgba(255,255,255,0.4)' }}>No new messages</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {recentMessages.map((msg) => (
                    <div key={msg.id} style={{ borderLeft: '2px solid #1d6fa4', paddingLeft: '10px', paddingTop: '4px', paddingBottom: '4px' }}>
                      <p className="text-xs font-semibold text-white">{msg.sender_name}</p>
                      <p className="text-xs line-clamp-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{msg.body}</p>
                      <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {new Date(msg.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/Messaging" className="block mt-3">
                <button style={{ width: '100%', background: 'transparent', color: '#60b4e8', border: '1px solid rgba(29,111,164,0.5)', borderRadius: '8px', padding: '8px 12px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>View All Messages</button>
              </Link>
            </div>

            {/* Quick Actions */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', backdropFilter: 'blur(12px)' }}>
              <h2 className="font-semibold text-white text-base mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link to="/QuickJobPost" className="block">
                  <button style={{ width: '100%', background: 'rgba(29,111,164,0.15)', color: '#60b4e8', border: '1px solid rgba(29,111,164,0.4)', borderRadius: '8px', padding: '10px 14px', fontWeight: '600', cursor: 'pointer', fontSize: '13px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Briefcase className="w-4 h-4" /> Post New Job
                  </button>
                </Link>
                <Link to="/FindContractors" className="block">
                  <button style={{ width: '100%', background: 'rgba(217,119,6,0.15)', color: '#fbbf24', border: '1px solid rgba(217,119,6,0.4)', borderRadius: '8px', padding: '10px 14px', fontWeight: '600', cursor: 'pointer', fontSize: '13px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users className="w-4 h-4" /> Find Contractors
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}