import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function PaymentProgressVisualization({ phases }) {
  if (!phases || phases.length === 0) {
    return null;
  }

  const totalAmount = phases.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidAmount = phases
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const progressPercent = (paidAmount / totalAmount) * 100;

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'customer_approved':
        return 'bg-blue-100 text-blue-800';
      case 'contractor_completed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-slate-50">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Payment Progress</h3>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-slate-700">
              ${paidAmount.toFixed(2)} of ${totalAmount.toFixed(2)} Released
            </span>
            <span className="text-sm text-slate-600">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <p className="text-sm text-slate-600">
          {phases.filter((p) => p.status === 'paid').length} of {phases.length} phases completed
        </p>
      </Card>

      {/* Phases Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Payment Phases</h3>

        <div className="space-y-4">
          {phases.map((phase, idx) => (
            <div key={phase.id} className="border-l-4 border-slate-200 pl-4 pb-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-slate-900">
                    Phase {phase.phase_number}: {phase.phase_title}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">{phase.description}</p>
                </div>
                <Badge className={getStatusColor(phase.status)}>
                  {phase.status === 'paid' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {phase.status === 'customer_approved' && <Clock className="w-3 h-3 mr-1" />}
                  {phase.status === 'contractor_completed' && <DollarSign className="w-3 h-3 mr-1" />}
                  {phase.status.replace(/_/g, ' ').charAt(0).toUpperCase() +
                    phase.status.replace(/_/g, ' ').slice(1)}
                </Badge>
              </div>

              {/* Amount */}
              <div className="text-xl font-bold text-slate-900 mb-3">${phase.amount.toFixed(2)}</div>

              {/* Timeline */}
              <div className="text-xs text-slate-500 space-y-1">
                {phase.contractor_completed_date && (
                  <p>
                    ✓ Contractor completed:{' '}
                    {formatDistanceToNow(new Date(phase.contractor_completed_date), {
                      addSuffix: true,
                    })}
                  </p>
                )}
                {phase.customer_approved_date && (
                  <p>
                    ✓ Customer approved:{' '}
                    {formatDistanceToNow(new Date(phase.customer_approved_date), {
                      addSuffix: true,
                    })}
                  </p>
                )}
                {phase.paid_date && (
                  <p>
                    ✓ Funds released:{' '}
                    {formatDistanceToNow(new Date(phase.paid_date), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}