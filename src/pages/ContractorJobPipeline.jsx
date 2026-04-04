import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Calendar, DollarSign, FileText, AlertCircle, Loader2, CheckCircle2, Clock, Briefcase, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ResponsiveJobTabs from '@/components/contractor/ResponsiveJobTabs';

const STATUS_CONFIG = {
  pending_approval: { label: 'Pending Approval', icon: Clock, color: 'bg-yellow-50 border-yellow-200' },
  approved: { label: 'Approved', icon: CheckCircle2, color: 'bg-green-50 border-green-200' },
  pending_ratings: { label: 'Pending Ratings', icon: FileText, color: 'bg-blue-50 border-blue-200' },
};

export default function ContractorJobPipeline() {
  const [user, setUser] = useState(null);
  const [isContractor, setIsContractor] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        setIsContractor(!!me);
      } catch {
        setIsContractor(false);
      }
    };
    checkAuth();
  }, []);

  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['contractorJobPipeline', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const allScopes = await base44.entities.ScopeOfWork.filter(
        { contractor_email: user.email },
        '-agreed_work_date',
        500
      );
      return allScopes.filter(s =>
        ['pending_approval', 'approved', 'pending_ratings'].includes(s.status)
      );
    },
    enabled: !!user?.email,
  });

  const { data: openJobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['openJobLeads'],
    queryFn: async () => base44.entities.Job.filter({ status: 'open' }, '-created_date', 50),
    enabled: !!user?.email,
  });

  if (!isContractor || !user) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-2xl p-10 border-2 border-orange-100 shadow-lg">
          <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Login Required</h1>
          <p className="text-gray-500">You must be logged in to view your job pipeline.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-orange-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900">Error Loading Jobs</h3>
              <p className="text-red-600 text-sm mt-1">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Job Pipeline</h1>
          <p className="text-gray-500">Your active work and incoming leads</p>
        </div>

        <Tabs defaultValue="active">
          <ResponsiveJobTabs 
            tabs={[
              { 
                id: 'active', 
                label: `Active Jobs${jobs.length > 0 ? ` (${jobs.length})` : ''}` 
              },
              { 
                id: 'leads', 
                label: `Open Leads${openJobs.length > 0 ? ` (${openJobs.length})` : ''}` 
              }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          <div className="mb-6" />

          {/* Active Jobs Tab */}
          <TabsContent value="active">
            {jobs.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold text-lg">No active jobs right now</p>
                <p className="text-gray-400 text-sm mt-2">Browse new leads in the Leads tab</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => {
                  const config = STATUS_CONFIG[job.status];
                  const StatusIcon = config?.icon || FileText;
                  const borderColor = job.status === 'approved' ? 'border-green-200 bg-green-50' :
                    job.status === 'pending_approval' ? 'border-amber-200 bg-amber-50' :
                    'border-blue-200 bg-blue-50';
                  return (
                    <div key={job.id} className={`border-2 rounded-2xl p-6 ${borderColor}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <StatusIcon className="w-4 h-4 text-gray-600" />
                            <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-gray-700 border border-gray-200 shadow-sm">
                              {config?.label || job.status}
                            </span>
                          </div>
                          <h3 className="text-xl font-extrabold text-gray-900 mb-1">{job.job_title}</h3>
                          <p className="text-gray-600 text-sm">Client: <span className="font-semibold text-gray-900">{job.client_name}</span></p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {job.agreed_work_date && (
                          <div className="bg-white rounded-xl p-3 border border-white/80">
                            <p className="text-xs text-gray-500 mb-1 font-medium">Work Date</p>
                            <p className="font-bold text-gray-900">{format(new Date(job.agreed_work_date), 'MMM d, yyyy')}</p>
                          </div>
                        )}
                        {job.cost_amount && (
                          <div className="bg-white rounded-xl p-3 border border-white/80">
                            <p className="text-xs text-gray-500 mb-1 font-medium">Amount</p>
                            <p className="font-bold text-orange-600">${job.cost_amount.toFixed(2)}</p>
                          </div>
                        )}
                        {job.cost_type && (
                          <div className="bg-white rounded-xl p-3 border border-white/80">
                            <p className="text-xs text-gray-500 mb-1 font-medium">Type</p>
                            <p className="font-bold text-gray-900 capitalize">{job.cost_type}</p>
                          </div>
                        )}
                      </div>
                      {job.scope_summary && (
                        <div className="mt-4 pt-4 border-t border-white/60">
                          <p className="text-sm text-gray-600 line-clamp-2">{job.scope_summary}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Open Job Leads Tab */}
          <TabsContent value="leads">
            {jobsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : openJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold text-lg">No open jobs right now</p>
                <p className="text-gray-400 text-sm mt-2">Check back soon for new opportunities</p>
              </div>
            ) : (
              <div className="space-y-4">
                {openJobs.map(job => (
                  <div key={job.id} className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-orange-200 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-extrabold text-gray-900 mb-1">{job.title}</h3>
                        {job.location && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                            <MapPin className="w-3.5 h-3.5 text-orange-500" />
                            <span>{job.location}</span>
                          </div>
                        )}
                        <p className="text-sm text-gray-500 line-clamp-2">{job.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {(job.budget_min || job.budget_max) && (
                          <p className="font-extrabold text-green-700 text-lg">
                            {job.budget_min && job.budget_max
                              ? `$${job.budget_min}–$${job.budget_max}`
                              : job.budget_min ? `From $${job.budget_min}` : `Up to $${job.budget_max}`}
                          </p>
                        )}
                        {job.budget_type && (
                          <p className="text-xs text-gray-400 capitalize">{job.budget_type}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        {job.urgency && (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            job.urgency === 'urgent' ? 'bg-red-100 text-red-700' :
                            job.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {job.urgency}
                          </span>
                        )}
                        {job.trade_needed && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 capitalize">{job.trade_needed}</span>
                        )}
                      </div>
                      <a
                        href="/ContractorBusinessHub"
                        className="text-sm font-bold text-orange-600 hover:text-orange-800 transition-colors"
                      >
                        Submit Scope →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}