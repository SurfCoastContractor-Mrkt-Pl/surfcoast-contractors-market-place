import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock } from 'lucide-react';
import ScopeApprovalSignature from './ScopeApprovalSignature';
import ServiceAgreementGenerator from '@/components/contractor/ServiceAgreementGenerator';

export default function ScopeApprovalCard({ scope, onApprovalSuccess }) {
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);

  if (!scope) return null;

  const statusBadges = {
    pending_approval: { label: 'Awaiting Approval', variant: 'outline', icon: Clock },
    approved: { label: 'Approved', variant: 'default', icon: CheckCircle2 },
    rejected: { label: 'Rejected', variant: 'destructive', icon: null },
    closed: { label: 'Closed', variant: 'secondary', icon: CheckCircle2 },
  };

  const status = statusBadges[scope.status] || statusBadges.pending_approval;
  const StatusIcon = status.icon;

  const handleApprovalSuccess = () => {
    setSignatureModalOpen(false);
    onApprovalSuccess?.();
  };

  return (
    <>
      <Card className="border border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg">{scope.job_title}</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Contractor: {scope.contractor_name}</p>
            </div>
            <div className="flex items-center gap-2">
              {StatusIcon && <StatusIcon className="w-4 h-4" />}
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Scope Summary */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Scope of Work</h4>
            <p className="text-xs text-slate-500 mb-2">A detailed description of all work to be performed — what will be done, how, and when.</p>
            <p className="text-sm text-slate-700 leading-relaxed">{scope.scope_summary}</p>
          </div>

          {/* Estimate */}
          <div className="bg-slate-50 p-3 rounded-lg">
            <h4 className="text-sm font-semibold text-slate-900 mb-1">Estimate (Total Cost)</h4>
            <p className="text-xs text-slate-500 mb-2">The total price/cost for all work defined in the Scope of Work above.</p>
            <div className="text-lg font-bold text-slate-900">
              {scope.cost_type === 'hourly'
                ? `$${scope.cost_amount}/hr`
                : `$${scope.cost_amount}`}
            </div>
            {scope.cost_type === 'hourly' && scope.estimated_hours && (
              <p className="text-xs text-slate-600 mt-1">
                Estimated total: ${(scope.cost_amount * scope.estimated_hours).toFixed(2)} ({scope.estimated_hours} hours)
              </p>
            )}
          </div>

          {/* Work Date */}
          {scope.agreed_work_date && (
            <div className="text-sm">
              <span className="text-slate-600">Agreed Work Date: </span>
              <span className="font-medium text-slate-900">
                {new Date(scope.agreed_work_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}

          {/* Rejection Notes */}
          {scope.status === 'rejected' && scope.customer_notes && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-900 mb-1">Rejection Notes:</p>
              <p className="text-sm text-red-800">{scope.customer_notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          {scope.status === 'pending_approval' && (
            <div className="pt-2 space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => setSignatureModalOpen(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Review & Approve with Signature
                </Button>
              </div>
              {scope.contractor_id && (
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-600 mb-3">Generate a service agreement for this scope:</p>
                  <ServiceAgreementGenerator 
                    contractor={{ id: scope.contractor_id, name: scope.contractor_name, email: scope.contractor_email }} 
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signature Modal */}
      <ScopeApprovalSignature
        scopeId={scope.id}
        scopeData={scope}
        open={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        onApprovalSuccess={handleApprovalSuccess}
      />
    </>
  );
}