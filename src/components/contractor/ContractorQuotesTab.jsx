import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InboxIcon, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_BADGE = {
  pending:  'bg-amber-100 text-amber-700',
  sent:     'bg-amber-100 text-amber-700',
  quoted:   'bg-purple-100 text-purple-700',
  accepted: 'bg-green-100 text-green-700',
  denied:   'bg-red-100 text-red-700',
};

const SUBMIT_URL = 'https://sage-c5f01224.base44.app/functions/submitQuote';

function QuoteForm({ quote, contractorId, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    quote_amount: '',
    cost_type: 'fixed',
    estimated_hours: '',
    proposed_work_date: '',
    quote_message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.quote_amount) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch(SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quote_request_id: quote.id,
        contractor_id: contractorId,
        action: 'submit_quote',
        quote_amount: parseFloat(form.quote_amount),
        cost_type: form.cost_type,
        estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : undefined,
        proposed_work_date: form.proposed_work_date || undefined,
        quote_message: form.quote_message || undefined,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      onSuccess();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || 'Failed to send quote. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-slate-100 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Amount ($) *</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 250.00"
            value={form.quote_amount}
            onChange={e => setForm(f => ({ ...f, quote_amount: e.target.value }))}
            required
            className="h-8 text-sm mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Type</Label>
          <Select value={form.cost_type} onValueChange={v => setForm(f => ({ ...f, cost_type: v }))}>
            <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="estimate">Estimate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Estimated Hours (optional)</Label>
          <Input
            type="number"
            min="0"
            step="0.5"
            placeholder="e.g. 4"
            value={form.estimated_hours}
            onChange={e => setForm(f => ({ ...f, estimated_hours: e.target.value }))}
            className="h-8 text-sm mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Proposed Work Date (optional)</Label>
          <Input
            type="date"
            value={form.proposed_work_date}
            onChange={e => setForm(f => ({ ...f, proposed_work_date: e.target.value }))}
            className="h-8 text-sm mt-1"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">Message to Customer (optional)</Label>
        <Textarea
          placeholder="Any notes or details for the customer..."
          value={form.quote_message}
          onChange={e => setForm(f => ({ ...f, quote_message: e.target.value }))}
          rows={3}
          className="text-sm mt-1 resize-none"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white text-sm h-8 px-4 gap-1.5">
          {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
          Send Quote →
        </Button>
        <button type="button" onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 underline">Cancel</button>
      </div>
    </form>
  );
}

export default function ContractorQuotesTab({ contractorId }) {
  const queryClient = useQueryClient();
  const [expandedForm, setExpandedForm] = useState(null); // quote id with open form
  const [declining, setDeclining] = useState(null);
  const [declineError, setDeclineError] = useState(null);

  const { data: quotes, isLoading } = useQuery({
    queryKey: ['contractor-quotes-by-id', contractorId],
    queryFn: () => base44.entities.QuoteRequest.filter({ contractor_id: contractorId }),
    enabled: !!contractorId,
  });

  const sorted = (quotes || []).slice().sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const handleDecline = async (quote) => {
    setDeclining(quote.id);
    setDeclineError(null);
    const res = await fetch(SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quote_request_id: quote.id,
        contractor_id: contractorId,
        action: 'deny',
      }),
    });
    setDeclining(null);
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ['contractor-quotes-by-id', contractorId] });
    } else {
      setDeclineError(quote.id);
    }
  };

  const handleQuoteSuccess = () => {
    setExpandedForm(null);
    queryClient.invalidateQueries({ queryKey: ['contractor-quotes-by-id', contractorId] });
  };

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
        <p className="text-sm font-medium">No quote requests yet.</p>
        <p className="text-xs text-slate-400 mt-1">When customers request a quote, they'll appear here.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map(q => {
        const isPending = q.status === 'pending' || q.status === 'sent';
        const statusLabel = q.status === 'pending' ? 'Pending' : q.status === 'sent' ? 'Pending' : q.status.charAt(0).toUpperCase() + q.status.slice(1);

        return (
          <Card key={q.id} className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-base leading-tight truncate">{q.job_title || 'Quote Request'}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {q.customer_name} · {new Date(q.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${STATUS_BADGE[q.status] || 'bg-slate-100 text-slate-600'}`}>
                {statusLabel}
              </span>
            </div>

            {/* Description */}
            {q.work_description && (
              <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{q.work_description}</p>
            )}

            {/* Quote amount */}
            {q.quote_amount != null && (
              <p className="text-sm font-semibold text-green-700 mt-2">Your quote: ${parseFloat(q.quote_amount).toFixed(2)}</p>
            )}

            {/* Actions for pending */}
            {isPending && (
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  className="text-xs h-8 px-3"
                  style={{ backgroundColor: '#B8860B', color: 'white' }}
                  onClick={() => setExpandedForm(expandedForm === q.id ? null : q.id)}
                >
                  Submit Quote
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8 px-3 border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => handleDecline(q)}
                  disabled={declining === q.id}
                >
                  {declining === q.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Decline'}
                </Button>
              </div>
            )}
            {declineError === q.id && (
              <p className="text-xs text-red-500 mt-1">Failed to decline. Please try again.</p>
            )}

            {/* Inline quote form */}
            {expandedForm === q.id && (
              <QuoteForm
                quote={q}
                contractorId={contractorId}
                onSuccess={handleQuoteSuccess}
                onCancel={() => setExpandedForm(null)}
              />
            )}
          </Card>
        );
      })}
    </div>
  );
}