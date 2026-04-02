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
import RatingBlockStatusWidget from '@/components/ratings/RatingBlockStatusWidget';

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
      <div className="min-h-screen p-6 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      {pendingRatingScopes.length > 0 && (
        <PendingRatingModal
          scope={pendingRatingScopes[0]}
          raterType="customer"
          raterEmail={user?.email}
          onDone={() => {}}
        />
      )}
      <div className="max-w-7xl mx-auto">
         {/* Rating Block Status Widget */}
         {user?.email && (
           <RatingBlockStatusWidget userEmail={user.email} userType="customer" />
         )}

         {/* Header */}
         <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl font-bold text-slate-800">My Dashboard</h1>
              <TrialBadge profile={customerProfile} />
            </div>
            <button
              onClick={() => base44.auth.logout()}
              className="flex items-center gap-2 text-sm font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg px-3 py-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
          <p className="text-slate-500">Track your posted jobs and active scopes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posted Jobs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Open Jobs */}
            <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-slate-800 text-base">Posted Jobs</h2>
              </div>
              <p className="text-xs mb-4 text-slate-500">All your posted jobs and their current status</p>
              {jobsLoading ? (
                <div className="text-center py-8 text-slate-400">Loading jobs...</div>
              ) : myJobs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="mb-4 text-slate-400">No open jobs</p>
                  <Link to="/QuickJobPost">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg px-5 py-2.5 text-sm cursor-pointer transition-colors">Post a Job</button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myJobs.map((job) => (
                    <div key={job.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-800 text-sm">{job.title}</h3>
                          <p className="text-xs mt-0.5 text-slate-500">{job.location}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          job.status === 'open' ? 'bg-green-100 text-green-700' :
                          job.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                          job.status === 'completed' ? 'bg-slate-100 text-slate-600' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {job.status === 'in_progress' ? 'in progress' : job.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs mb-3 line-clamp-2 text-slate-600">{job.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Budget: ${job.budget_min || '0'} - ${job.budget_max || 'TBD'}</span>
                        <Link to={`/MyJobs?jobId=${job.id}`}>
                          <button className="text-xs font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-md px-3 py-1.5 cursor-pointer transition-colors">View Responses</button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quote Requests */}
            <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-slate-800 text-base">Quote Requests</h2>
              </div>
              <p className="text-xs mb-4 text-slate-500">Pending contractor quotes</p>
              {quotesLoading ? (
                <div className="text-center py-8 text-slate-400">Loading quotes...</div>
              ) : quoteRequests.length === 0 ? (
                <p className="text-center py-8 text-slate-400">No quote requests</p>
              ) : (
                <div className="space-y-3">
                  {quoteRequests.map((quote) => (
                    <div key={quote.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-800 text-sm">{quote.job_title}</h3>
                          <p className="text-xs mt-0.5 text-slate-500">From: {quote.contractor_name}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          quote.status === 'quoted' ? 'bg-green-100 text-green-700' :
                          quote.status === 'view_denied' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {quote.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {quote.quote_amount && (
                        <p className="text-sm font-semibold mb-1 text-orange-600">Quote: ${quote.quote_amount}</p>
                      )}
                      {quote.quote_message && (
                        <p className="text-xs mb-3 text-slate-600">{quote.quote_message}</p>
                      )}
                      <Link to={`/MyJobs?jobId=${quote.job_id}`}>
                        <button className="text-xs font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-md px-3 py-1.5 cursor-pointer transition-colors">View Details</button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Scopes */}
            <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <h2 className="font-semibold text-slate-800 text-base">Active Projects</h2>
              </div>
              <p className="text-xs mb-4 text-slate-500">Approved scopes in progress</p>
              {scopesLoading ? (
                <div className="text-center py-8 text-slate-400">Loading...</div>
              ) : activeScopes.length === 0 ? (
                <p className="text-center py-8 text-slate-400">No active projects yet</p>
              ) : (
                <div className="space-y-3">
                  {activeScopes.map((scope) => (
                    <div key={scope.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-800 text-sm">{scope.job_title}</h3>
                          <p className="text-xs mt-0.5 text-slate-500">Contractor: {scope.contractor_name}</p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                          {scope.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                        <div>
                          <p className="text-slate-500">Cost:</p>
                          <p className="font-semibold text-slate-800">${scope.cost_amount} {scope.cost_type === 'hourly' ? '/hr' : 'fixed'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Scheduled:</p>
                          <p className="font-semibold text-slate-800">{scope.agreed_work_date || 'Pending'}</p>
                        </div>
                      </div>
                      <Link to={`/ProjectManagement?scopeId=${scope.id}`}>
                        <button className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg py-2 px-3 font-semibold text-xs cursor-pointer transition-colors">Track Progress</button>
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
            <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-slate-800 text-base">Messages</h2>
              </div>
              <p className="text-xs mb-4 text-slate-500">Recent unread messages</p>
              {messagesLoading ? (
                <div className="text-center py-6 text-slate-400">Loading...</div>
              ) : recentMessages.length === 0 ? (
                <p className="text-center py-6 text-slate-400">No new messages</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {recentMessages.map((msg) => (
                    <div key={msg.id} className="border-l-2 border-blue-400 pl-3 py-1">
                      <p className="text-xs font-semibold text-slate-800">{msg.sender_name}</p>
                      <p className="text-xs line-clamp-2 text-slate-600">{msg.body}</p>
                      <p className="text-xs mt-1 text-slate-400">
                        {new Date(msg.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/Messaging" className="block mt-3">
                <button className="w-full text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg py-2 px-3 font-semibold text-sm cursor-pointer transition-colors">View All Messages</button>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="font-semibold text-slate-800 text-base mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link to="/QuickJobPost" className="block">
                  <button className="w-full flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg px-4 py-2.5 font-semibold text-sm cursor-pointer transition-colors text-left">
                    <Briefcase className="w-4 h-4" /> Post New Job
                  </button>
                </Link>
                <Link to="/FindContractors" className="block">
                  <button className="w-full flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg px-4 py-2.5 font-semibold text-sm cursor-pointer transition-colors text-left">
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