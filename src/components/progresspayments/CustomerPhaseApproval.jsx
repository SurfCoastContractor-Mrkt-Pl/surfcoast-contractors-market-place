import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Loader2, ChevronDown, ChevronUp, FileText, Download } from 'lucide-react';

export default function CustomerPhaseApproval({ payment, onSuccess }) {
  const [approvalNotes, setApprovalNotes] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState(null);

  const mutation = useMutation({
    mutationFn: async () => {
      return base44.functions.invoke('releaseProgressPayment', {
        paymentId: payment.id,
        approvalNotes: approvalNotes
      });
    },
    onSuccess: (resp) => {
      const data = resp?.data || resp;
      if (data?.invoiceUrl) setInvoiceUrl(data.invoiceUrl);
      setApprovalNotes('');
      setExpanded(false);
      onSuccess?.();
    }
  });

  const statusConfig = {
    pending: {
      badge: <Badge className="bg-slate-200 text-slate-800">Awaiting Work</Badge>,
      color: 'text-slate-600'
    },
    contractor_completed: {
      badge: <Badge className="bg-orange-100 text-orange-800">Ready for Review</Badge>,
      color: 'text-orange-600'
    },
    customer_approved: {
      badge: <Badge className="bg-green-100 text-green-800">Approved & Paid</Badge>,
      color: 'text-green-600'
    },
    paid: {
      badge: <Badge className="bg-green-100 text-green-800">Paid</Badge>,
      color: 'text-green-600'
    },
    cancelled: {
      badge: <Badge className="bg-red-100 text-red-800">Cancelled</Badge>,
      color: 'text-red-600'
    }
  };

  const config = statusConfig[payment.status] || statusConfig.pending;

  return (
    <Card className={`p-4 transition-all ${payment.status === 'contractor_completed' ? 'border-orange-200 bg-orange-50' : 'border-slate-200 bg-slate-50'}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-start justify-between gap-4"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-slate-900">Phase {payment.phase_number}: {payment.phase_title}</span>
            {config.badge}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 flex-wrap">
            <span className="font-medium">${payment.amount}</span>
            {payment.contractor_completed_date && (
              <span className="text-xs text-slate-500">
                Completed {new Date(payment.contractor_completed_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        {payment.status === 'contractor_completed' && (
          expanded ? <ChevronUp className="w-5 h-5 shrink-0" /> : <ChevronDown className="w-5 h-5 shrink-0" />
        )}
        {(payment.status === 'customer_approved' || payment.status === 'paid') && invoiceUrl && (
          <a
            href={invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md hover:bg-amber-100 transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Invoice
          </a>
        )}
      </button>

      {expanded && payment.status === 'contractor_completed' && (
        <div className="mt-4 pt-4 border-t border-orange-200 space-y-4">
          {payment.contractor_completion_notes && (
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Contractor's Notes</label>
              <div className="p-3 bg-white rounded border border-orange-100 text-sm text-slate-600">
                {payment.contractor_completion_notes}
              </div>
            </div>
          )}

          {payment.completion_photo_urls?.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-2 block">Completion Photos</label>
              <div className="grid grid-cols-3 gap-2">
                {payment.completion_photo_urls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={`Phase ${payment.phase_number}`} className="w-full h-24 object-cover rounded border border-orange-100 hover:opacity-75 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1 block">Your Approval Notes (optional)</label>
            <Textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Confirm quality, any issues noted, etc."
              rows={3}
              className="text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve & Release Payment
                </>
              )}
            </Button>
            <Button
              onClick={() => setExpanded(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          {mutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{mutation.error?.message || 'Failed to approve payment'}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}