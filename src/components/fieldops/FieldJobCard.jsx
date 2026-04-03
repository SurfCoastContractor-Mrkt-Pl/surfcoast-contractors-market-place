import React, { memo } from 'react';
import { Clock, DollarSign, ChevronRight } from 'lucide-react';

const STATUS_CONFIG = {
  pending_approval: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-50', dot: 'bg-yellow-500' },
  approved: { label: 'Approved', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  active: { label: 'In Progress', color: 'text-green-700', bg: 'bg-green-50', dot: 'bg-green-500' },
  pending_ratings: { label: 'Pending Rating', color: 'text-purple-700', bg: 'bg-purple-50', dot: 'bg-purple-500' },
  closed: { label: 'Closed', color: 'text-slate-500', bg: 'bg-slate-50', dot: 'bg-slate-400' },
};

const FieldJobCard = memo(({ scope, onSelect }) => {
  const status = STATUS_CONFIG[scope.status] || STATUS_CONFIG.pending_approval;
  const formattedDate = scope.agreed_work_date 
    ? new Date(scope.agreed_work_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;
  const formattedCost = scope.cost_type === 'hourly' 
    ? `$${scope.cost_amount}/hr` 
    : `$${scope.cost_amount?.toLocaleString()}`;

  return (
    <button
      onClick={onSelect}
      className="w-full bg-white rounded-2xl p-4 text-left border border-slate-200 active:scale-[0.98] transition-transform hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${status.dot}`} />
            <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
          </div>
          <p className="text-slate-800 font-semibold text-base leading-tight truncate">{scope.job_title}</p>
          <p className="text-slate-500 text-sm mt-1 truncate">{scope.customer_name}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
        {formattedDate && (
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Clock className="w-3.5 h-3.5" />
            {formattedDate}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <DollarSign className="w-3.5 h-3.5" />
          {formattedCost}
        </div>
      </div>
    </button>
  );
});

FieldJobCard.displayName = 'FieldJobCard';
export default FieldJobCard;