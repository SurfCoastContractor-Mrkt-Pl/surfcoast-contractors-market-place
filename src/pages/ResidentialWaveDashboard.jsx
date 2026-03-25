import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Users, DollarSign, Plus, Loader2 } from 'lucide-react';
import ResidentialWaveJobsTab from '@/components/residential-wave/ResidentialWaveJobsTab';
import ResidentialWaveLeadsTab from '@/components/residential-wave/ResidentialWaveLeadsTab';
import ResidentialWaveInvoicesTab from '@/components/residential-wave/ResidentialWaveInvoicesTab';
import ResidentialWaveSubscriptionTab from '@/components/residential-wave/ResidentialWaveSubscriptionTab';

export default function ResidentialWaveDashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          base44.auth.redirectToLogin('/ResidentialWaveDashboard');
          return;
        }
        setUser(currentUser);
      } catch (err) {
        console.error('Auth error:', err);
        base44.auth.redirectToLogin('/ResidentialWaveDashboard');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const { data: jobs } = useQuery({
    queryKey: ['residentialWaveJobs', user?.email],
    queryFn: () => user?.email ? base44.entities.ResidentialWaveJob.filter({ contractor_email: user.email }) : Promise.resolve([]),
    enabled: !!user?.email,
  });

  const { data: leads } = useQuery({
    queryKey: ['residentialWaveLeads', user?.email],
    queryFn: () => user?.email ? base44.entities.ResidentialWaveLead.filter({ contractor_email: user.email }) : Promise.resolve([]),
    enabled: !!user?.email,
  });

  const { data: invoices } = useQuery({
    queryKey: ['residentialWaveInvoices', user?.email],
    queryFn: () => user?.email ? base44.entities.ResidentialWaveInvoice.filter({ contractor_email: user.email }) : Promise.resolve([]),
    enabled: !!user?.email,
  });

  const { data: subscription } = useQuery({
    queryKey: ['residentialWaveSubscription', user?.email],
    queryFn: () => user?.email ? base44.entities.ResidentialWaveSubscription.filter({ contractor_email: user.email }).then(subs => subs?.[0]) : Promise.resolve(null),
    enabled: !!user?.email,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const upcomingJobs = jobs?.filter(j => j.status === 'scheduled').length || 0;
  const activeLeads = leads?.filter(l => ['new', 'contacted', 'qualified'].includes(l.status)).length || 0;
  const unpaidInvoices = invoices?.filter(i => ['draft', 'sent', 'overdue'].includes(i.status)).length || 0;
  const totalRevenue = invoices?.filter(i => i.status === 'paid').reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Residential Wave</h1>
          <p className="text-slate-600 mt-2">Manage your contracting business</p>
          {!subscription?.stripe_subscription_id && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Trial Active.</strong> Upgrade to Professional to unlock all features.
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Upcoming Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{upcomingJobs}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activeLeads}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Unpaid Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{unpaidInvoices}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${totalRevenue.toFixed(0)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Jobs */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  {jobs && jobs.length > 0 ? (
                    <div className="space-y-4">
                      {jobs.slice(0, 5).map(job => (
                        <div key={job.id} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">{job.title}</p>
                            <p className="text-sm text-slate-600">{job.customer_name}</p>
                            {job.scheduled_date && (
                              <p className="text-xs text-slate-500 mt-1">{job.scheduled_date}</p>
                            )}
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            job.status === 'completed' ? 'bg-green-100 text-green-800' :
                            job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600 text-sm">No jobs yet. Create one to get started.</p>
                  )}
                </CardContent>
              </Card>

              {/* Subscription Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  {subscription ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-600">Plan</p>
                        <p className="font-semibold text-slate-900 capitalize">{subscription.plan_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Status</p>
                        <p className={`font-semibold capitalize ${subscription.status === 'active' ? 'text-green-600' : 'text-slate-600'}`}>
                          {subscription.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Next Billing</p>
                        <p className="font-semibold text-slate-900">{subscription.next_billing_date}</p>
                      </div>
                      <Button variant="outline" className="w-full mt-4">Manage Subscription</Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-slate-600 text-sm mb-4">Upgrade to unlock advanced features</p>
                      <Button className="w-full">Start Subscription</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            <ResidentialWaveJobsTab userEmail={user?.email} />
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <ResidentialWaveLeadsTab userEmail={user?.email} />
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            <ResidentialWaveInvoicesTab userEmail={user?.email} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}