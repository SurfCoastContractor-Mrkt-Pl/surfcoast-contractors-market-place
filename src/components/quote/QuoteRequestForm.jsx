import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DollarSign, Loader2, AlertCircle } from 'lucide-react';
import PaymentGate from '@/components/payment/PaymentGate';

export default function QuoteRequestForm({ contractor, customer, open, onClose }) {
  const [workDescription, setWorkDescription] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState(null);

  const submitQuoteMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.QuoteRequest.create(data);
    },
    onSuccess: () => {
      setWorkDescription('');
      onClose();
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!workDescription.trim()) {
      alert('Please describe the work needed');
      return;
    }

    submitQuoteMutation.mutate({
      contractor_id: contractor.id,
      contractor_name: contractor.name,
      contractor_email: contractor.email,
      customer_email: customer.email,
      customer_name: customer.full_name,
      work_description: workDescription,
      payment_id: paymentRecord.id,
    });
  };

  // Build the quote metadata to pass through Stripe redirect
  const quoteMetaParam = workDescription.trim()
    ? `&quote_meta=${encodeURIComponent(JSON.stringify({
        contractor_id: contractor.id,
        contractor_name: contractor.name,
        contractor_email: contractor.email,
        customer_email: customer?.email || '',
        customer_name: customer?.full_name || '',
        work_description: workDescription,
      }))}`
    : '';

  if (!paymentRecord) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Quick Quote</DialogTitle>
            <DialogDescription>Pay a small fee to request a written estimate from this contractor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">$1.75 Fee</p>
                <p className="text-xs text-blue-700 mt-1">A one-time $1.75 fee gives you a written estimate from this contractor, no communication required.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Contractor</p>
                <p className="text-slate-600">{contractor.name}</p>
              </div>
            </div>

            <Button
              onClick={() => setShowPayment(true)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Pay $1.75 to Continue
            </Button>

            <PaymentGate
              open={showPayment}
              onClose={() => setShowPayment(false)}
              onPaid={(record) => {
                setPaymentRecord(record);
                setShowPayment(false);
              }}
              payerType="customer"
              contractorId={contractor.id}
              contractorEmail={contractor.email}
              contractorName={contractor.name}
              quoteMetaParam={quoteMetaParam}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Quick Quote from {contractor.name}</DialogTitle>
          <DialogDescription>Describe the work needed so the contractor can provide an accurate quote.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-700">
              ✓ $1.75 fee paid · Ready to request quote
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Describe the work needed
            </label>
            <Textarea
              placeholder="Example: Need to repair a leaky kitchen faucet and replace the cartridge. Also need to fix a loose toilet seat in the bathroom."
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              disabled={submitQuoteMutation.isPending}
              className="resize-none"
              rows={6}
            />
            <p className="text-xs text-slate-500 mt-1">
              Be specific about what you need done so the contractor can provide an accurate quote.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitQuoteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-slate-900"
              disabled={submitQuoteMutation.isPending || !workDescription.trim()}
            >
              {submitQuoteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Quote Request'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}