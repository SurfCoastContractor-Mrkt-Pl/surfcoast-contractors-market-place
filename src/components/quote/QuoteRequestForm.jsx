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

  // quoteMetaParam is built from workDescription — used to pass data through Stripe redirect
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

  // Step 1: Describe work. Step 2: Pay (redirects to Stripe with quote_meta in success URL).
  // After returning from Stripe, Success page auto-creates the QuoteRequest.
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a Quote from {contractor.name}</DialogTitle>
          <DialogDescription>Describe the work, then pay the $1.75 fee to send your request.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Describe the work needed *
            </label>
            <Textarea
              placeholder="Example: Need to repair a leaky kitchen faucet and replace the cartridge. Also need to fix a loose toilet seat in the bathroom."
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              className="resize-none"
              rows={5}
            />
            <p className="text-xs text-slate-500 mt-1">
              Be specific so the contractor can provide an accurate quote.
            </p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">A one-time $1.75 fee unlocks this quote request. You'll be redirected to Stripe to pay securely.</p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={() => setShowPayment(true)}
              disabled={!workDescription.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Pay $1.75 &amp; Send Request
            </Button>
          </div>
        </div>

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
      </DialogContent>
    </Dialog>
  );
}