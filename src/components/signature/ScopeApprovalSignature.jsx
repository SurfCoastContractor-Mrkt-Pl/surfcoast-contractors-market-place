import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import SignatureCanvas from './SignatureCanvas';

export default function ScopeApprovalSignature({ scopeId, scopeData, open, onClose, onApprovalSuccess }) {
  const [signatureData, setSignatureData] = useState(null);
  const [approvalStep, setApprovalStep] = useState('signature'); // signature | review | confirmed

  const approveMutation = useMutation({
    mutationFn: async (signatureUrl) => {
      const response = await base44.functions.invoke('approveScopeWithSignature', {
        scope_id: scopeId,
        signature_url: signatureUrl,
        customer_email: scopeData.customer_email,
        customer_name: scopeData.customer_name,
        contractor_name: scopeData.contractor_name,
      });
      return response.data;
    },
    onSuccess: () => {
      setApprovalStep('confirmed');
      setTimeout(() => {
        onApprovalSuccess?.();
        handleClose();
      }, 2000);
    },
  });

  const handleSignatureCapture = (dataUrl) => {
    setSignatureData(dataUrl);
  };

  const handleConfirmApproval = async () => {
    if (!signatureData) return;
    setApprovalStep('review');
    await approveMutation.mutateAsync(signatureData);
  };

  const handleClose = () => {
    setSignatureData(null);
    setApprovalStep('signature');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Approve Scope of Work & Estimate</DialogTitle>
          <DialogDescription>
            Review the details below and sign to approve this project agreement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scope Summary */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-3 text-sm">
            <div>
              <span className="text-slate-600">Contractor:</span>
              <p className="font-semibold text-slate-900">{scopeData?.contractor_name}</p>
            </div>
            <div>
              <span className="text-slate-600">Project:</span>
              <p className="font-semibold text-slate-900">{scopeData?.job_title}</p>
            </div>
            <div>
              <span className="text-slate-600">Scope Summary:</span>
              <p className="text-slate-700 mt-1">{scopeData?.scope_summary}</p>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-600">Estimate:</span>
              <p className="text-lg font-bold text-slate-900">
                {scopeData?.cost_type === 'hourly'
                  ? `$${scopeData?.cost_amount}/hr (est. ${scopeData?.estimated_hours} hrs)`
                  : `$${scopeData?.cost_amount}`}
              </p>
            </div>
          </div>

          {/* Signature Step */}
          {approvalStep === 'signature' && (
            <div className="space-y-4">
              <SignatureCanvas
                onSignatureCapture={handleSignatureCapture}
                disabled={approveMutation.isPending}
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3 text-sm">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-blue-900">
                  By signing, you agree to this Scope of Work and Estimate. This creates a binding project agreement between you and the contractor.
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleClose} disabled={approveMutation.isPending}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmApproval}
                  disabled={!signatureData || approveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {approveMutation.isPending ? 'Processing...' : 'Approve & Sign'}
                </Button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {approvalStep === 'review' && (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-slate-600">Approving your scope...</p>
              </div>
            </div>
          )}

          {/* Confirmed Step */}
          {approvalStep === 'confirmed' && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Scope Approved!</h3>
              <p className="text-slate-600 text-sm">
                Your signature has been recorded. The contractor has been notified and work can begin.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}