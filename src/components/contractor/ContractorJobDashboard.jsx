import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Clock, MapPin, DollarSign, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function ContractorJobDashboard({ contractorId, contractorEmail }) {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = React.useState(null);

  // Fetch assigned scopes (active jobs)
  const { data: scopes, isLoading: scopesLoading } = useQuery({
    queryKey: ['contractor-active-scopes', contractorId],
    queryFn: () => base44.entities.ScopeOfWork.filter({ 
      contractor_id: contractorId,
      status: { '$in': ['approved', 'pending_approval'] }
    }),
    enabled: !!contractorId,
  });

  // Fetch progress payments (earnings tracking)
  const { data: progressPayments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['contractor-earnings', contractorEmail],
    queryFn: () => base44.entities.ProgressPayment.filter({ 
      contractor_email: contractorEmail,
      status: { '$in': ['pending', 'contractor_completed', 'customer_approved', 'paid'] }
    }),
    enabled: !!contractorEmail,
  });

  // Calculate total earnings
  const totalEarnings = progressPayments?.reduce((sum, p) => {
    if (p.status === 'paid') return sum + p.amount;
    return sum;
  }, 0) || 0;

  const pendingEarnings = progressPayments?.reduce((sum, p) => {
    if (['contractor_completed', 'customer_approved'].includes(p.status)) {
      return sum + p.amount;
    }
    return sum;
  }, 0) || 0;

  const statusColors = {
    approved: 'bg-green-100 text-green-800',
    pending_approval: 'bg-amber-100 text-amber-800',
    completed: 'bg-blue-100 text-blue-800',
  };

  const paymentStatusColors = {
    pending: 'bg-slate-100 text-slate-800',
    contractor_completed: 'bg-blue-100 text-blue-800',
    customer_approved: 'bg-amber-100 text-amber-800',
    paid: 'bg-green-100 text-green-800',
  };

  if (scopesLoading || paymentsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-amber-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earnings Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">${totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">From completed jobs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Pending Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">${pendingEarnings.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">Awaiting approval or payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{scopes?.length || 0}</p>
            <p className="text-xs text-slate-500 mt-1">In progress or pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-600" />
            Assigned Jobs
          </CardTitle>
          <CardDescription>Track your current and upcoming work assignments</CardDescription>
        </CardHeader>
        <CardContent>
          {scopes?.length > 0 ? (
            <div className="space-y-3">
              {scopes.map(scope => {
                const relatedPayments = progressPayments?.filter(p => p.scope_id === scope.id) || [];
                const jobEarnings = relatedPayments.reduce((sum, p) => sum + p.amount, 0);
                
                return (
                  <div 
                    key={scope.id}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{scope.job_title}</h3>
                          <Badge className={statusColors[scope.status] || 'bg-slate-100'}>
                            {scope.status === 'pending_approval' ? 'Pending' : scope.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mt-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            Customer: {scope.customer_name}
                          </div>
                          {scope.agreed_work_date && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-slate-400" />
                              {new Date(scope.agreed_work_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-amber-600">
                          ${scope.cost_type === 'fixed' ? scope.cost_amount : `${scope.cost_amount}/hr`}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{scope.cost_type} rate</p>
                      </div>
                    </div>

                    {relatedPayments.length > 0 && (
                      <div className="border-t border-slate-100 pt-3 mt-3">
                        <p className="text-xs font-semibold text-slate-600 mb-2">Payment Phases:</p>
                        <div className="space-y-2">
                          {relatedPayments.map(payment => (
                            <div key={payment.id} className="flex items-center justify-between text-sm">
                              <span className="text-slate-700">{payment.phase_title}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">${payment.amount.toFixed(2)}</span>
                                <Badge className={`text-xs ${paymentStatusColors[payment.status] || 'bg-slate-100'}`}>
                                  {payment.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedJob(scope)}
                        className="text-xs"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-center">
              <div>
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No active jobs assigned yet</p>
                <p className="text-sm text-slate-500 mt-1">Browse available jobs to get started</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Details Modal */}
      {selectedJob && (
        <Card>
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle>{selectedJob.job_title}</CardTitle>
              <CardDescription>Job details and scope</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedJob(null)}
            >
              ✕
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Customer</p>
                <p className="text-sm font-medium text-slate-900 mt-1">{selectedJob.customer_name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Status</p>
                <Badge className={statusColors[selectedJob.status] || 'bg-slate-100'} as="p" className="mt-1 inline-block">
                  {selectedJob.status === 'pending_approval' ? 'Pending' : selectedJob.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Cost</p>
                <p className="text-sm font-medium text-slate-900 mt-1">${selectedJob.cost_amount} {selectedJob.cost_type === 'hourly' ? '/hour' : 'fixed'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Work Date</p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {selectedJob.agreed_work_date ? new Date(selectedJob.agreed_work_date).toLocaleDateString() : 'TBD'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Scope Details</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">
                {selectedJob.scope_summary || selectedJob.customer_scope_details || 'No scope details provided'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}