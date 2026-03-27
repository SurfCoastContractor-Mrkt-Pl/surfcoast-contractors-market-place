import React, { useMemo } from 'react';
import { CheckCircle, Clock, AlertCircle, Lock } from 'lucide-react';

const STATUS_CONFIG = {
  pending_approval: { label: 'Pending', color: 'bg-yellow-900/20 text-yellow-400', icon: Clock },
  approved: { label: 'Approved', color: 'bg-blue-900/20 text-blue-400', icon: CheckCircle },
  active: { label: 'In Progress', color: 'bg-green-900/20 text-green-400', icon: CheckCircle },
  pending_ratings: { label: 'Pending Rating', color: 'bg-purple-900/20 text-purple-400', icon: AlertCircle },
  closed: { label: 'Closed', color: 'bg-slate-800 text-slate-400', icon: Lock },
  rejected: { label: 'Rejected', color: 'bg-red-900/20 text-red-400', icon: AlertCircle },
};

export default function WaveFOStatusSummary({ scopes }) {
  const statusCounts = useMemo(() => {
    const counts = {};
    Object.keys(STATUS_CONFIG).forEach(status => {
      counts[status] = scopes.filter(s => s.status === status).length;
    });
    return counts;
  }, [scopes]);

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 mb-4">
      <h3 className="text-white font-semibold mb-4">Job Status Overview</h3>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const Icon = config.icon;
          const count = statusCounts[status];
          return (
            <div key={status} className={`${config.color} rounded-lg p-3 flex items-start gap-3`}>
              <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold opacity-75">{config.label}</p>
                <p className="text-lg font-bold">{count}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}