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
import { Loader2, CheckCircle, XCircle, DollarSign } from 'lucide-react';

export default function QuoteReplyDialog({ request, open, onClose }) {
  const [step, setStep] = useState('review'); // 'review' | 'quote' | 'deny'
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [denyReason, setDenyReason] = useState('');
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
      queryClient.invalidateQueries({ queryKey: ['quoteRequests'] });
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
      queryClient.invalidateQueries({ queryKey: ['quoteRequests'] });
      onClose();
    },
  });

  const quoteMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.QuoteRequest.update(request.id, {
        quote_amount: parseFloat(quoteAmount),
        quote_message: quoteMessage,
        status: 'quoted',
        responded_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quoteRequests'] });
      onClose();
    },
  });

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'review' && `Quote Request from ${request.customer_name}`}
            {step === 'quote' && `Provide Estimate to ${request.customer_name}`}
            {step === 'deny' && `Decline Quote Request`}
          </DialogTitle>
          <DialogDescription>
            {step === 'review' && 'Review the customer\'s quote request. If you accept, you\'ll provide your Estimate (total cost).'}
            {step === 'quote' && 'Enter your Estimate — the total cost/price for the work described. This is what the customer requested a quote for.'}
            {step === 'deny' && 'Let the customer know you\'re unable to provide a quote for this job.'}
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
                 Accept &amp; Provide Estimate
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
              <Label htmlFor="quote-amount" className="text-slate-700">Quote Amount ($) *</Label>
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
              <Label htmlFor="quote-message" className="text-slate-700">Message (Optional)</Label>
              <Textarea
                id="quote-message"
                value={quoteMessage}
                onChange={(e) => setQuoteMessage(e.target.value)}
                placeholder="Add details about your quote, timeline, materials, etc."
                className="mt-1 resize-none"
                rows={3}
              />
            </div>

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
                  <><DollarSign className="w-4 h-4 mr-1" />Send Quote</>
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