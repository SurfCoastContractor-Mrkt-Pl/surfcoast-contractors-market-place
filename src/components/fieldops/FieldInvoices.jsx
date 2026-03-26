import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  DollarSign, CheckCircle, Clock, AlertCircle,
  ChevronRight, Send, FileText, TrendingUp, Plus
} from 'lucide-react';

const STATUS_CONFIG = {
  pending_payment: { label: 'Awaiting Payment', color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
  funded: { label: 'Funded (In Escrow)', color: 'text-blue-400', bg: 'bg-blue-900/20' },
  work_in_progress: { label: 'In Progress', color: 'text-purple-400', bg: 'bg-purple-900/20' },
  pending_release: { label: 'Pending Release', color: 'text-orange-400', bg: 'bg-orange-900/20' },
  released: { label: 'Paid Out', color: 'text-green-400', bg: 'bg-green-900/20' },
  refunded: { label: 'Refunded', color: 'text-red-400', bg: 'bg-red-900/20' },
};

export default function FieldInvoices({ contractor, user }) {
  const [escrows, setEscrows] = useState([]);
  const [scopes, setScopes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [sending, setSending] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [escrowData, scopeData] = await Promise.all([
          base44.entities.EscrowPayment.filter({ contractor_email: user.email }),
          base44.entities.ScopeOfWork.filter({ contractor_email: user.email }),
        ]);
        setEscrows(escrowData || []);
        setScopes(scopeData || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, [user.email]);

  const totalEarned = escrows
    .filter(e => e.status === 'released')
    .reduce((sum, e) => sum + (e.contractor_payout_amount || 0), 0);

  const pendingAmount = escrows
    .filter(e => ['funded', 'work_in_progress', 'pending_release'].includes(e.status))
    .reduce((sum, e) => sum + (e.contractor_payout_amount || 0), 0);

  const filteredEscrows = escrows.filter(e => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return ['pending_payment', 'funded', 'work_in_progress'].includes(e.status);
    if (filter === 'Awaiting Approval') return e.status === 'pending_release';
    if (filter === 'Paid') return e.status === 'released';
    return true;
  });

  const handleRequestRelease = async (escrow) => {
    setSending(escrow.id);
    try {
      await base44.functions.invoke('requestEscrowRelease', { escrow_id: escrow.id });
      const updated = await base44.entities.EscrowPayment.filter({ contractor_email: user.email });
      setEscrows(updated || []);
    } catch (e) {
      alert('Could not request release. Try again.');
    }
    setSending(null);
  };

  const handleSendInvoiceEmail = async (escrow) => {
    setSending(escrow.id + '_email');
    try {
      const scope = scopes.find(s => s.id === escrow.scope_id);
      await base44.integrations.Core.SendEmail({
        to: escrow.customer_email,
        subject: `Invoice: ${escrow.job_title} — $${escrow.amount}`,
        body: `Hi ${escrow.customer_name},\n\nHere's a summary of your invoice for the recent work:\n\nJob: ${escrow.job_title}\nAmount: $${escrow.amount}\nContractor: ${escrow.contractor_name}\n\nThank you for your business!\n\n— ${escrow.contractor_name}`,
      });
      alert('Invoice sent to ' + escrow.customer_email);
    } catch {
      alert('Could not send email.');
    }
    setSending(null);
  };

  return (
    <div className="bg-slate-950 min-h-full">
      {/* Earnings Summary */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
        <div className="bg-green-900/20 border border-green-800/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <p className="text-green-400 text-xs font-semibold">Total Earned</p>
          </div>
          <p className="text-white text-2xl font-bold">${totalEarned.toLocaleString()}</p>
        </div>
        <div className="bg-blue-900/20 border border-blue-800/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-400" />
            <p className="text-blue-400 text-xs font-semibold">In Escrow</p>
          </div>
          <p className="text-white text-2xl font-bold">${pendingAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 px-4 mt-4 overflow-x-auto scrollbar-none pb-1">
        {['All', 'Pending', 'Awaiting Approval', 'Paid'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Invoice List */}
      <div className="px-4 mt-4 pb-6 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading...</div>
        ) : filteredEscrows.length === 0 ? (
          <div className="text-center py-16">
            <DollarSign className="w-12 h-12 text-slate-800 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No invoices found</p>
          </div>
        ) : (
          filteredEscrows.map(escrow => {
            const status = STATUS_CONFIG[escrow.status] || { label: escrow.status, color: 'text-slate-400', bg: 'bg-slate-900' };
            return (
              <div key={escrow.id} className={`${status.bg} rounded-2xl p-4 border border-slate-800`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{escrow.job_title}</p>
                    <p className="text-slate-400 text-sm">{escrow.customer_name}</p>
                    <span className={`text-xs font-semibold ${status.color} mt-1 inline-block`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-lg">${escrow.amount?.toLocaleString()}</p>
                    <p className="text-green-400 text-sm">You get: ${escrow.contractor_payout_amount?.toLocaleString() || (escrow.amount * 0.82).toFixed(0)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800/50">
                  <button
                    onClick={() => handleSendInvoiceEmail(escrow)}
                    disabled={sending === escrow.id + '_email'}
                    className="flex-1 bg-slate-800 text-slate-300 rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    {sending === escrow.id + '_email' ? (
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Email Invoice
                  </button>

                  {escrow.status === 'funded' || escrow.status === 'work_in_progress' ? (
                    <button
                      onClick={() => handleRequestRelease(escrow)}
                      disabled={sending === escrow.id}
                      className="flex-1 bg-green-700 text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      {sending === escrow.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Request Release
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}