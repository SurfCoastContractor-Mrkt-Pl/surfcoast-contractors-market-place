import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, FileText, Calendar, DollarSign, User, Download, CheckCircle, XCircle } from 'lucide-react';

export default function ScopeDetailExpander({ scope, userEmail, userName, onOpenChat, onCloseout }) {
  const [expanded, setExpanded] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const queryClient = useQueryClient();

  const statusColors = {
    pending_approval: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    pending_ratings: 'bg-purple-100 text-purple-800',
    closed: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-700',
  };

  const handleApprove = async () => {
    setApproving(true);
    await base44.entities.ScopeOfWork.update(scope.id, { status: 'approved' });
    await base44.integrations.Core.SendEmail({
      to: scope.contractor_email,
      subject: `✅ Scope Approved: "${scope.job_title}"`,
      body: `Dear ${scope.contractor_name},\n\n${scope.client_name} has approved your scope of work for "${scope.job_title}". You can now proceed with the work as agreed.\n\nSurfCoast Marketplace`,
    });
    queryClient.invalidateQueries({ queryKey: ['customer-scopes', userEmail] });
    setApproving(false);
  };

  const handleReject = async () => {
    if (!window.confirm(`Reject the scope "${scope.job_title}"? This cannot be undone.`)) return;
    setRejecting(true);
    await base44.entities.ScopeOfWork.update(scope.id, { status: 'rejected', client_notes: 'Rejected by client' });
    queryClient.invalidateQueries({ queryKey: ['customer-scopes', userEmail] });
    setRejecting(false);
  };

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      const res = await base44.functions.invoke('generateFieldJobInvoice', { scope_id: scope.id });
      if (res.data) {
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ScopeInvoice-${scope.id.substring(0, 8).toUpperCase()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Invoice download error:', e);
    }
    setDownloading(false);
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* Header Row */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <FileText className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{scope.job_title}</p>
            <p className="text-xs text-slate-500">Contractor: {scope.contractor_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <Badge className={statusColors[scope.status] || 'bg-slate-100 text-slate-600'}>
            {scope.status === 'pending_approval' ? 'Pending Your Approval' : scope.status.replace(/_/g, ' ')}
          </Badge>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-slate-100 p-5 space-y-4 bg-slate-50">
          {/* Scope Summary */}
          {scope.scope_summary && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Scope of Work</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap bg-white border border-slate-200 rounded-lg p-3">
                {scope.scope_summary}
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1"><DollarSign className="w-3 h-3" /> Cost</div>
              <p className="font-bold text-slate-900">
                ${scope.cost_amount}{scope.cost_type === 'hourly' ? '/hr' : ' fixed'}
              </p>
            </div>
            {scope.agreed_work_date && (
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-1"><Calendar className="w-3 h-3" /> Work Date</div>
                <p className="font-semibold text-slate-900 text-sm">
                  {new Date(scope.agreed_work_date).toLocaleDateString()}
                </p>
              </div>
            )}
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1"><User className="w-3 h-3" /> Contractor</div>
              <p className="font-semibold text-slate-900 text-sm">{scope.contractor_name}</p>
            </div>
          </div>

          {/* Client Notes */}
          {scope.client_scope_details && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Your Original Request</p>
              <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-lg p-3">
                {scope.client_scope_details}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
            {scope.status === 'pending_approval' && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleApprove}
                  disabled={approving}
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  {approving ? 'Approving...' : 'Approve Scope'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  onClick={handleReject}
                  disabled={rejecting}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  {rejecting ? 'Rejecting...' : 'Reject'}
                </Button>
              </>
            )}
            {scope.status === 'approved' && onOpenChat && (
              <Button size="sm" variant="outline" onClick={() => onOpenChat(scope)}>
                💬 Open Chat
              </Button>
            )}
            {['approved', 'pending_ratings'].includes(scope.status) && onCloseout && (
              <Button
                size="sm"
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => onCloseout(scope)}
              >
                ✓ Close Out Job
              </Button>
            )}
            {scope.status !== 'rejected' && scope.status !== 'pending_approval' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadInvoice}
                disabled={downloading}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                {downloading ? 'Generating...' : 'Download Invoice'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}