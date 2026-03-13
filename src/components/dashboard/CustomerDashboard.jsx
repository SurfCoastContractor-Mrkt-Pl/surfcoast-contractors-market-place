import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MessageSquare, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CustomerDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    getUser();
  }, []);

  const { data: myJobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['customer-jobs', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const jobs = await base44.entities.Job.filter({
        poster_email: user.email,
        status: 'open'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">My Projects</h1>
          <p className="text-slate-600">Track your posted jobs and active scopes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posted Jobs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Open Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Posted Jobs
                </CardTitle>
                <CardDescription>Jobs accepting contractor proposals</CardDescription>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="text-center py-8 text-slate-500">Loading jobs...</div>
                ) : myJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-4">No open jobs</p>
                    <Link to="/QuickJobPost">
                      <Button>Post a Job</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myJobs.map((job) => (
                      <div key={job.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-slate-900">{job.title}</h3>
                            <p className="text-sm text-slate-600">{job.location}</p>
                          </div>
                          <Badge className={jobStatusColor[job.status] || 'bg-slate-100 text-slate-800'}>
                            {job.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-700 mb-3 line-clamp-2">{job.description}</p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">Budget: ${job.budget_min || '0'} - ${job.budget_max || 'TBD'}</span>
                          <Link to={`/MyJobs?jobId=${job.id}`}>
                            <Button variant="outline" size="sm">View Responses</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Scopes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Active Projects
                </CardTitle>
                <CardDescription>Approved scopes in progress</CardDescription>
              </CardHeader>
              <CardContent>
                {scopesLoading ? (
                  <div className="text-center py-8 text-slate-500">Loading...</div>
                ) : activeScopes.length === 0 ? (
                  <p className="text-center py-8 text-slate-500">No active projects yet</p>
                ) : (
                  <div className="space-y-4">
                    {activeScopes.map((scope) => (
                      <div key={scope.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-slate-900">{scope.job_title}</h3>
                            <p className="text-sm text-slate-600">Contractor: {scope.contractor_name}</p>
                          </div>
                          <Badge className={scopeStatusColor[scope.status] || 'bg-slate-100 text-slate-800'}>
                            {scope.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-slate-600">Cost:</p>
                            <p className="font-medium text-slate-900">${scope.cost_amount} {scope.cost_type === 'hourly' ? '/hr' : 'fixed'}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Scheduled:</p>
                            <p className="font-medium text-slate-900">{scope.agreed_work_date || 'Pending'}</p>
                          </div>
                        </div>
                        <Link to={`/ProjectManagement?scopeId=${scope.id}`}>
                          <Button variant="outline" size="sm" className="w-full">Track Progress</Button>
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

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/QuickJobPost" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Post New Job
                  </Button>
                </Link>
                <Link to="/FindContractors" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Find Contractors
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}