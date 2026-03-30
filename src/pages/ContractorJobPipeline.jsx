import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Calendar, DollarSign, FileText, AlertCircle, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  pending_approval: { label: 'Pending Approval', icon: Clock, color: 'bg-yellow-50 border-yellow-200' },
  approved: { label: 'Approved', icon: CheckCircle2, color: 'bg-green-50 border-green-200' },
  pending_ratings: { label: 'Pending Ratings', icon: FileText, color: 'bg-blue-50 border-blue-200' },
};

export default function ContractorJobPipeline() {
  const [user, setUser] = useState(null);
  const [isContractor, setIsContractor] = useState(false);

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

      // Filter to active statuses
      return allScopes.filter(s => 
        ['pending_approval', 'approved', 'pending_ratings'].includes(s.status)
      );
    },
    enabled: !!user?.email,
  });

  if (!isContractor || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Login Required</h1>
          <p className="text-slate-600">You must be logged in to view your job pipeline.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Jobs</h3>
              <p className="text-red-700 text-sm mt-1">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Job Pipeline</h1>
          <p className="text-slate-600">Current and upcoming jobs</p>
        </div>

        {/* Job Count */}
        <div className="mb-6">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-900 rounded-lg font-semibold">
            {jobs.length} active {jobs.length === 1 ? 'job' : 'jobs'}
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 text-lg">No active jobs right now</p>
            <p className="text-slate-500 text-sm mt-2">Check back soon or browse new opportunities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const config = STATUS_CONFIG[job.status];
              const StatusIcon = config?.icon || FileText;

              return (
                <div key={job.id} className={`border rounded-lg p-6 ${config?.color || 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className="w-5 h-5 text-slate-600" />
                        <span className="inline-block px-3 py-1 bg-white rounded-full text-xs font-semibold text-slate-700 border border-slate-200">
                          {config?.label || job.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-1">{job.job_title}</h3>
                      <p className="text-slate-600">Customer: <span className="font-medium">{job.customer_name}</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {job.agreed_work_date && (
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Work Date</p>
                        <p className="font-semibold text-slate-900">
                          {format(new Date(job.agreed_work_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    )}
                    
                    {job.cost_amount && (
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Amount</p>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-slate-600" />
                          <p className="font-semibold text-slate-900">
                            {job.cost_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}

                    {job.cost_type && (
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Type</p>
                        <p className="font-semibold text-slate-900 capitalize">
                          {job.cost_type}
                        </p>
                      </div>
                    )}
                  </div>

                  {job.scope_summary && (
                    <div className="mt-4 pt-4 border-t border-slate-300">
                      <p className="text-sm text-slate-700 line-clamp-2">{job.scope_summary}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}