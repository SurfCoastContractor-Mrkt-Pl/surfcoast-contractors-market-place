import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle, DollarSign, AlertTriangle } from 'lucide-react';

const REDACT_URL = 'https://sage-c5f01224.base44.app/functions/redactMessage';

async function redactText(text) {
  try {
    const res = await fetch(REDACT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    if (!res.ok) return { message: text, was_redacted: false };
    const data = await res.json();
    return { message: data.message ?? text, was_redacted: data.was_redacted ?? false };
  } catch {
    return { message: text, was_redacted: false };
  }
}

export default function QuoteReplyDialog({ request, open, onClose }) {
  const [step, setStep] = useState('review'); // 'review' | 'quote' | 'deny'
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [denyReason, setDenyReason] = useState('');
  const [redactWarning, setRedactWarning] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (request) {
      // If already view_approved, jump straight to quote step
      setStep(request.status === 'view_approved' ? 'quote' : 'review');
      setQuoteAmount(request.quote_amount || '');
      setQuoteMessage(request.quote_message || '');
      setDenyReason('');
    }
  }, [request]);

  const approveMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.QuoteRequest.update(request.id, {
        status: 'view_approved',
        read_by_contractor: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-quotes'] });
      setStep('quote');
    },
  });

  const denyMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.QuoteRequest.update(request.id, {
        status: 'view_denied',
        deny_reason: denyReason,
        read_by_contractor: true,
        responded_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-quotes'] });
      onClose();
    },
  });

  const quoteMutation = useMutation({
    mutationFn: async () => {
      setRedactWarning(false);
      // Redact both the scope message and note before saving
      const scopeRedact = quoteMessage ? await redactText(quoteMessage) : { message: '', was_redacted: false };
      if (scopeRedact.was_redacted) setRedactWarning(true);

      await base44.entities.QuoteRequest.update(request.id, {
        quote_amount: parseFloat(quoteAmount),
        quote_message: scopeRedact.message,
        status: 'quoted',
        responded_at: new Date().toISOString(),
      });

      // Notify customer by email
      try {
        await base44.integrations.Core.SendEmail({
          to: request.customer_email,
          from_name: 'SurfCoast Marketplace',
          subject: `Your Proposal is Ready — ${request.job_title || 'Project Proposal'}`,
          body: `Hi ${request.customer_name},\n\nYour proposal request has been answered!\n\nContractor: ${request.contractor_name}\nProject: ${request.job_title || 'Your project'}\nProposal Amount: $${parseFloat(quoteAmount).toFixed(2)}\n${scopeRedact.message ? `\nNote from contractor:\n${scopeRedact.message}\n` : ''}\nLog in to SurfCoast Marketplace to review and respond.\n\n— SurfCoast Team`,
        });
      } catch {}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-quotes'] });
      if (!redactWarning) onClose();
    },
  });

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'review' && `Proposal Request from ${request.customer_name}`}
            {step === 'quote' && `Send Proposal to ${request.customer_name}`}
            {step === 'deny' && `Decline Proposal Request`}
          </DialogTitle>
          <DialogDescription>
            {step === 'review' && 'Review the customer\'s proposal request. If you accept, you\'ll send your Proposal with pricing.'}
            {step === 'quote' && 'Enter your Proposal amount — the total cost/price for the work described.'}
            {step === 'deny' && 'Let the customer know you\'re unable to submit a proposal for this job.'}
          </DialogDescription>
        </DialogHeader>

        {/* Review Step */}
        {step === 'review' && (
          <div className="space-y-4">
            {request.job_title && (
              <div>
                <Label className="text-slate-600 text-xs uppercase font-semibold">Project</Label>
                <p className="text-sm font-medium text-slate-900 mt-0.5">{request.job_title}</p>
              </div>
            )}
            <div>
              <Label className="text-slate-600 text-xs uppercase font-semibold">Work Description</Label>
              <p className="text-sm text-slate-700 mt-1 p-3 bg-slate-50 rounded-lg leading-relaxed">
                {request.work_description}
              </p>
            </div>
            <div>
              <Label className="text-slate-600 text-xs uppercase font-semibold">Customer</Label>
              <p className="text-sm text-slate-700 mt-0.5">{request.customer_name} — {request.customer_email}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => setStep('deny')}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Decline
              </Button>
              <Button
                 type="button"
                 className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                 onClick={() => approveMutation.mutate()}
                 disabled={approveMutation.isPending}
               >
                 {approveMutation.isPending ? (
                   <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                 ) : (
                   <CheckCircle className="w-4 h-4 mr-1" />
                 )}
                 Accept &amp; Send Proposal
               </Button>
            </div>
          </div>
        )}

        {/* Quote Step */}
        {step === 'quote' && (
          <form onSubmit={(e) => { e.preventDefault(); if (quoteAmount) quoteMutation.mutate(); }} className="space-y-4">
            {request.job_title && (
              <div>
                <Label className="text-slate-600 text-xs uppercase font-semibold">Project</Label>
                <p className="text-sm font-medium text-slate-900 mt-0.5">{request.job_title}</p>
              </div>
            )}
            <div>
              <Label className="text-slate-600 text-xs uppercase font-semibold">Work Description</Label>
              <p className="text-sm text-slate-600 mt-1 p-2 bg-slate-50 rounded text-xs">
                {request.work_description}
              </p>
            </div>

            <div>
              <Label htmlFor="quote-amount" className="text-slate-700">Proposal Amount — Total Cost ($) *</Label>
              <p className="text-xs text-slate-500 mb-1">The total price/cost for all the work you'll perform.</p>
              <Input
                id="quote-amount"
                type="number"
                step="0.01"
                min="0"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                placeholder="0.00"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="quote-message" className="text-slate-700">Note to Customer (Optional)</Label>
              <Textarea
                id="quote-message"
                value={quoteMessage}
                onChange={(e) => setQuoteMessage(e.target.value)}
                placeholder="Add details about your Proposal — timeline, materials, what's included, etc."
                className="mt-1 resize-none"
                rows={3}
              />
            </div>

            {redactWarning && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Personal contact information was automatically removed from your response per platform policy.</span>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={quoteMutation.isPending || !quoteAmount}
              >
                {quoteMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Sending...</>
                ) : (
                  <><DollarSign className="w-4 h-4 mr-1" />Send Proposal</>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Deny Step */}
        {step === 'deny' && (
          <div className="space-y-4">
            <div>
              <Label className="text-slate-700">Reason for Declining (Optional)</Label>
              <Textarea
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                placeholder="e.g. Outside my service area, not my specialty, fully booked..."
                className="mt-1 resize-none"
                rows={3}
              />
              <p className="text-xs text-slate-500 mt-1">The customer will see this reason.</p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setStep('review')}>Back</Button>
              <Button
                type="button"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => denyMutation.mutate()}
                disabled={denyMutation.isPending}
              >
                {denyMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Declining...</>
                ) : (
                  <><XCircle className="w-4 h-4 mr-1" />Confirm Decline</>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}