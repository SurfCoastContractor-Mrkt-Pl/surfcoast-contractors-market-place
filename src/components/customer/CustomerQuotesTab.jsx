import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { InboxIcon, Loader2, CheckCircle2 } from 'lucide-react';

const RESPOND_URL = 'https://sage-c5f01224.base44.app/functions/respondToQuote';

const COST_TYPE_LABEL = { fixed: 'Fixed Price', hourly: 'Per Hour', estimate: 'Estimate' };

function StatusBadge({ status }) {
  if (status === 'pending_customer_review') {
    return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-100 text-amber-700">Action needed</span>;
  }
  if (status === 'accepted') {
    return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-green-100 text-green-700">✓ Accepted</span>;
  }
  if (status === 'denied' || status === 'declined') {
    return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-red-100 text-red-700">Declined</span>;
  }
  return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-slate-100 text-slate-600">{status}</span>;
}

function ProposalCard({ proposal, customerEmail, onReload }) {
  const [declining, setDeclining] = useState(false);
  const [denyReason, setDenyReason] = useState('');
  const [showDenyForm, setShowDenyForm] = useState(false);
  const [loading, setLoading] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const isPending = proposal.status === 'pending_customer_review';

  const handleAccept = async () => {
    setLoading('accept');
    setError(null);
    const res = await fetch(RESPOND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposal_id: proposal.id, customer_email: customerEmail, action: 'accept' }),
    });
    setLoading(null);
    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || 'Failed to accept. Please try again.');
    }
  };

  const handleDeny = async () => {
    setLoading('deny');
    setError(null);
    const res = await fetch(RESPOND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposal_id: proposal.id, customer_email: customerEmail, action: 'deny', deny_reason: denyReason || undefined }),
    });
    setLoading(null);
    if (res.ok) {
      onReload();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || 'Failed to decline. Please try again.');
    }
  };

  if (success) {
    return (
      <Card className="p-6 border-green-200 bg-green-50 flex items-center gap-3">
        <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
        <div>
          <p className="font-semibold text-green-800">Job confirmed!</p>
          <p className="text-sm text-green-700">Check your email for details.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-base leading-tight">{proposal.job_title || 'Job Proposal'}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {proposal.contractor_name} · {new Date(proposal.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <StatusBadge status={proposal.status} />
      </div>

      {/* Quote amount box */}
      <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">${parseFloat(proposal.quote_amount || 0).toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-0.5">{COST_TYPE_LABEL[proposal.cost_type] || proposal.cost_type}</p>
        </div>
        {(proposal.estimated_hours || proposal.proposed_work_date) && (
          <div className="border-l border-slate-200 pl-4 space-y-1">
            {proposal.estimated_hours && (
              <p className="text-sm text-slate-600">⏱ {proposal.estimated_hours} hrs estimated</p>
            )}
            {proposal.proposed_work_date && (
              <p className="text-sm text-slate-600">📅 {new Date(proposal.proposed_work_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            )}
          </div>
        )}
      </div>

      {/* Message */}
      {proposal.quote_message && (
        <blockquote className="border-l-4 border-slate-200 pl-4 italic text-slate-600 text-sm leading-relaxed">
          "{proposal.quote_message}"
        </blockquote>
      )}

      {/* Actions */}
      {isPending && !showDenyForm && (
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm h-9 gap-1.5"
            onClick={handleAccept}
            disabled={!!loading}
          >
            {loading === 'accept' ? <Loader2 className="w-4 h-4 animate-spin" /> : '✅'} Accept Job
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 text-sm h-9"
            onClick={() => setShowDenyForm(true)}
            disabled={!!loading}
          >
            ✗ Decline Quote
          </Button>
        </div>
      )}

      {/* Deny form */}
      {isPending && showDenyForm && (
        <div className="space-y-2">
          <Textarea
            placeholder="Reason for declining (optional)..."
            value={denyReason}
            onChange={e => setDenyReason(e.target.value)}
            rows={2}
            className="text-sm resize-none"
          />
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm h-8"
              onClick={handleDeny}
              disabled={!!loading}
            >
              {loading === 'deny' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm Decline'}
            </Button>
            <button onClick={() => setShowDenyForm(false)} className="text-xs text-slate-400 hover:text-slate-600 underline px-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </Card>
  );
}

export default function CustomerQuotesTab({ customerEmail }) {
  const queryClient = useQueryClient();

  const { data: proposals, isLoading } = useQuery({
    queryKey: ['customer-proposals', customerEmail],
    queryFn: () => base44.entities.ContractorScopeProposal.filter({ customer_email: customerEmail }),
    enabled: !!customerEmail,
  });

  const sorted = (proposals || []).slice().sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const reload = () => queryClient.invalidateQueries({ queryKey: ['customer-proposals', customerEmail] });

  if (isLoading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </Card>
    );
  }

  if (!sorted.length) {
    return (
      <Card className="p-10 text-center text-slate-500">
        <InboxIcon className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p className="text-sm font-medium">No quotes yet.</p>
        <p className="text-xs text-slate-400 mt-1">When a contractor submits a quote for your job, it will appear here.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map(p => (
        <ProposalCard key={p.id} proposal={p} customerEmail={customerEmail} onReload={reload} />
      ))}
    </div>
  );
}