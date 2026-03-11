import React from 'react';
import { CheckCircle2, Clock, Circle, AlertCircle } from 'lucide-react';

const PHASE_STATUS_ORDER = ['pending', 'contractor_completed', 'customer_approved', 'paid', 'cancelled'];

function PhaseIcon({ status }) {
  if (status === 'customer_approved' || status === 'paid') {
    return <CheckCircle2 className="w-5 h-5 text-green-600" />;
  }
  if (status === 'contractor_completed') {
    return <AlertCircle className="w-5 h-5 text-orange-500" />;
  }
  if (status === 'cancelled') {
    return <Circle className="w-5 h-5 text-red-400" />;
  }
  return <Clock className="w-5 h-5 text-slate-400" />;
}

function phaseColor(status) {
  if (status === 'customer_approved' || status === 'paid') return 'bg-green-500';
  if (status === 'contractor_completed') return 'bg-orange-400';
  if (status === 'cancelled') return 'bg-red-300';
  return 'bg-slate-200';
}

export default function ProjectProgressBar({ payments = [] }) {
  if (!payments.length) return null;

  const sorted = [...payments].sort((a, b) => a.phase_number - b.phase_number);
  const totalAmount = sorted.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const paidAmount = sorted
    .filter(p => p.status === 'customer_approved' || p.status === 'paid')
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const completedCount = sorted.filter(p => p.status === 'customer_approved' || p.status === 'paid').length;
  const pct = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Project Progress</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {completedCount} of {sorted.length} phases complete
          </p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${pct === 100 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-slate-700'}`}>
            {pct}%
          </div>
          <div className="text-xs text-slate-500">${paidAmount.toFixed(2)} / ${totalAmount.toFixed(2)}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-700 ${pct === 100 ? 'bg-green-500' : 'bg-amber-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Phase step indicators */}
      <div className="flex items-start gap-2 overflow-x-auto pb-1">
        {sorted.map((phase, idx) => (
          <React.Fragment key={phase.id || idx}>
            <div className="flex flex-col items-center min-w-0 flex-shrink-0" style={{ maxWidth: '100px' }}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                phase.status === 'customer_approved' || phase.status === 'paid'
                  ? 'border-green-500 bg-green-50'
                  : phase.status === 'contractor_completed'
                  ? 'border-orange-400 bg-orange-50'
                  : phase.status === 'cancelled'
                  ? 'border-red-300 bg-red-50'
                  : 'border-slate-200 bg-white'
              }`}>
                <PhaseIcon status={phase.status} />
              </div>
              <div className="mt-1.5 text-center">
                <div className="text-xs font-medium text-slate-700 leading-tight truncate w-20 text-center">
                  {phase.phase_title || `Phase ${phase.phase_number}`}
                </div>
                <div className="text-xs text-slate-400">${Number(phase.amount).toFixed(0)}</div>
              </div>
            </div>
            {idx < sorted.length - 1 && (
              <div className={`flex-1 h-0.5 mt-4 min-w-[12px] rounded ${
                phase.status === 'customer_approved' || phase.status === 'paid'
                  ? 'bg-green-400'
                  : 'bg-slate-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-500 pt-1 border-t border-slate-100">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Paid</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />Awaiting Approval</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />Pending</span>
      </div>
    </div>
  );
}