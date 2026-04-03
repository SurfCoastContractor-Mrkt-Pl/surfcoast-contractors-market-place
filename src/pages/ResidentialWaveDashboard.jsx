import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Users, DollarSign, Plus, Loader2 } from 'lucide-react';
import ResidentialWaveJobsTab from '@/components/residential-wave/ResidentialWaveJobsTab';
import ResidentialWaveLeadsTab from '@/components/residential-wave/ResidentialWaveLeadsTab';
import ResidentialWaveInvoicesTab from '@/components/residential-wave/ResidentialWaveInvoicesTab';
import ResidentialWaveSubscriptionTab from '@/components/residential-wave/ResidentialWaveSubscriptionTab';
import ResidentialWaveDocumentsTab from '@/components/residential-wave/ResidentialWaveDocumentsTab';

export default function ResidentialWaveDashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [hasAccess, setHasAccess] = useState(null);
  const [accessError, setAccessError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          base44.auth.redirectToLogin('/ResidentialWaveDashboard');
          return;
        }
        setUser(currentUser);

        // Check Residential Wave access
        const accessRes = await base44.functions.invoke('validateResidentialWaveAccess', {});
        if (accessRes.data.hasAccess) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
          setAccessError(accessRes.data.reason);
        }
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

  const handleSubscribe = async () => {
    try {
      const response = await base44.functions.invoke('createResidentialWaveCheckout', {});
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start subscription. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Access denied for non-construction trades
  if (hasAccess === false && accessError === 'invalid_trade') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full bg-white border border-red-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50">
            <p className="text-red-900 font-semibold">Access Restricted</p>
          </div>
          <div className="p-6 text-slate-700">
            <p className="mb-4">Residential Wave is exclusively available for construction trade contractors.</p>
            <p className="mb-3 font-medium text-slate-800">Supported trades:</p>
            <ul className="list-disc list-inside space-y-1 mb-6 text-slate-600">
              <li>Plumbing</li>
              <li>HVAC</li>
              <li>Electrical</li>
              <li>Concrete</li>
              <li>Drywall</li>
              <li>Painting</li>
              <li>Lawn Services</li>
            </ul>
            <p className="text-sm text-slate-500">If you believe this is an error, please update your contractor profile trade specialty.</p>
          </div>
        </div>
      </div>
    );
  }

  // No subscription
  if (hasAccess === false && accessError === 'no_subscription') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <p className="text-slate-800 font-semibold">Residential Wave — Premium Invoice Management</p>
          </div>
          <div className="p-6">
            <p className="text-slate-500 mb-6">
              Manage invoices, process customer payments, and track your residential projects with our premium system.
            </p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 mb-6">
              <div className="text-4xl font-bold text-slate-800 mb-2">$100<span className="text-lg font-medium text-slate-500">/month</span></div>
              <p className="text-slate-500 text-sm mb-4">Includes:</p>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Unlimited invoices</li>
                <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Secure customer payment processing</li>
                <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Payment tracking & receipts</li>
                <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Document management</li>
              </ul>
            </div>
            <Button onClick={handleSubscribe} className="w-full bg-blue-600 hover:bg-blue-700 h-11">
              Subscribe Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const upcomingJobs = jobs?.filter(j => j.status === 'scheduled').length || 0;
  const activeLeads = leads?.filter(l => ['new', 'contacted', 'qualified'].includes(l.status)).length || 0;
  const unpaidInvoices = invoices?.filter(i => ['draft', 'sent', 'overdue'].includes(i.status)).length || 0;
  const totalRevenue = invoices?.filter(i => i.status === 'paid').reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800">Residential Wave</h1>
          <p className="text-slate-500 mt-2">Manage your contracting business</p>
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
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-medium text-slate-500">Upcoming Jobs</p>
            </div>
            <p className="text-3xl font-bold text-slate-800">{upcomingJobs}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-medium text-slate-500">Active Leads</p>
            </div>
            <p className="text-3xl font-bold text-slate-800">{activeLeads}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-medium text-slate-500">Unpaid Invoices</p>
            </div>
            <p className="text-3xl font-bold text-slate-800">{unpaidInvoices}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-medium text-slate-500">Total Revenue</p>
            </div>
            <p className="text-3xl font-bold text-slate-800">${totalRevenue.toFixed(0)}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Jobs */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200">
                  <p className="text-slate-800 font-semibold">Recent Jobs</p>
                </div>
                <div className="p-5">
                  {jobs && jobs.length > 0 ? (
                    <div className="space-y-3">
                      {jobs.slice(0, 5).map(job => (
                        <div key={job.id} className="flex justify-between items-start p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <div>
                            <p className="font-medium text-slate-800">{job.title}</p>
                            <p className="text-sm text-slate-500">{job.customer_name}</p>
                            {job.scheduled_date && (
                              <p className="text-xs text-slate-400 mt-1">{job.scheduled_date}</p>
                            )}
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                            job.status === 'completed' ? 'bg-green-100 text-green-700' :
                            job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No jobs yet. Create one to get started.</p>
                  )}
                </div>
              </div>

              {/* Subscription Status */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200">
                  <p className="text-slate-800 font-semibold">Subscription</p>
                </div>
                <div className="p-5">
                  {subscription ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-400">Plan</p>
                        <p className="font-semibold text-slate-800 capitalize">{subscription.plan_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Status</p>
                        <p className={`font-semibold capitalize ${subscription.status === 'active' ? 'text-green-600' : 'text-slate-500'}`}>
                          {subscription.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Next Billing</p>
                        <p className="font-semibold text-slate-800">{subscription.next_billing_date}</p>
                      </div>
                      <Button variant="outline" className="w-full mt-4 border-slate-200 text-slate-700 hover:bg-slate-50">Manage Subscription</Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-slate-500 text-sm mb-4">Upgrade to unlock advanced features</p>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Subscription</Button>
                    </div>
                  )}
                </div>
              </div>
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

          <TabsContent value="documents" className="mt-6">
            <ResidentialWaveDocumentsTab userEmail={user?.email} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}