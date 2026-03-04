import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { History, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
  closed:           { label: 'Completed',   badgeColor: 'bg-green-100 text-green-700',  iconColor: 'text-green-600',  icon: CheckCircle2 },
  approved:         { label: 'In Progress', badgeColor: 'bg-blue-100 text-blue-700',    iconColor: 'text-blue-500',   icon: Clock },
  pending_approval: { label: 'Pending',     badgeColor: 'bg-amber-100 text-amber-700',  iconColor: 'text-amber-500',  icon: Clock },
  rejected:         { label: 'Rejected',    badgeColor: 'bg-red-100 text-red-700',      iconColor: 'text-red-400',    icon: XCircle },
  cancelled:        { label: 'Cancelled',   badgeColor: 'bg-slate-100 text-slate-600',  iconColor: 'text-slate-400',  icon: XCircle },
};

export default function JobHistory({ userEmail }) {
  const { data: scopes = [], isLoading } = useQuery({
    queryKey: ['customer-job-history', userEmail],
    queryFn: () => base44.entities.ScopeOfWork.filter({ customer_email: userEmail }),
    enabled: !!userEmail,
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (scopes.length === 0) {
    return (
      <Card className="p-6 text-center">
        <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">No job history yet</p>
        <p className="text-sm text-slate-400 mt-1">Your past jobs with contractors will appear here.</p>
      </Card>
    );
  }

  // Sort newest first
  const sorted = [...scopes].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <History className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-semibold text-slate-900">Job History</h2>
        <span className="ml-auto text-sm text-slate-500">{scopes.length} job{scopes.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-3">
        {sorted.map(scope => {
          const cfg = statusConfig[scope.status] || statusConfig.pending_approval;
          const Icon = cfg.icon;
          const costLabel = scope.cost_type === 'fixed'
            ? `$${scope.cost_amount?.toFixed(2)} fixed`
            : `$${scope.cost_amount?.toFixed(2)}/hr`;
          const dateLabel = scope.closed_date
            ? format(new Date(scope.closed_date), 'MMM d, yyyy')
            : scope.agreed_work_date
              ? format(new Date(scope.agreed_work_date), 'MMM d, yyyy')
              : format(new Date(scope.created_date), 'MMM d, yyyy');

          return (
            <div key={scope.id} className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${cfg.color.includes('green') ? 'text-green-600' : cfg.color.includes('blue') ? 'text-blue-500' : cfg.color.includes('amber') ? 'text-amber-500' : 'text-slate-400'}`} />
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">{scope.job_title}</div>
                    <div className="text-sm text-slate-500 mt-0.5">
                      Contractor: <span className="font-medium text-slate-700">{scope.contractor_name}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap gap-x-3">
                      <span>{dateLabel}</span>
                      <span>{costLabel}</span>
                      {scope.contractor_satisfaction_rating && (
                        <span className="capitalize">Your rating: {scope.contractor_satisfaction_rating}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge className={cfg.color}>{cfg.label}</Badge>
                  {scope.status === 'closed' && scope.contractor_id && (
                    <Link to={createPageUrl(`ContractorProfile?id=${scope.contractor_id}`)}>
                      <Button size="sm" variant="outline" className="text-xs h-7 border-amber-300 text-amber-700 hover:bg-amber-50 gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Re-hire
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}