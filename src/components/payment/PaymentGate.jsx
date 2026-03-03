import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DollarSign, Loader2, CheckCircle, Shield, CreditCard, AlertTriangle } from 'lucide-react';

export default function PaymentGate({ open, onClose, onPaid, payerType, contractorId, contractorEmail, contractorName }) {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [paid, setPaid] = useState(false);
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data) => {
      // Check for duplicate payment before creating a new one
      const existing = await base44.entities.Payment.filter({
        payer_email: data.email,
        contractor_id: contractorId || '',
        status: 'confirmed',
      });
      if (existing && existing.length > 0) {
        setAlreadyPaid(true);
        onPaid(existing[0]);
        return existing[0];
      }

      const purpose = payerType === 'contractor'
        ? 'Contractor platform access fee'
        : `Customer access to contact contractor ${contractorName}`;

      const record = await base44.entities.Payment.create({
        payer_email: data.email,
        payer_name: data.name,
        payer_type: payerType,
        contractor_id: contractorId || '',
        contractor_email: contractorEmail || '',
        amount: 1.50,
        status: 'pending',
        purpose,
      });

      await base44.integrations.Core.SendEmail({
        to: data.email,
        subject: 'ContractorHub — Platform Access Fee Receipt',
        body: `Dear ${data.name},\n\nThank you for using ContractorHub.\n\nA platform access fee of $1.50 has been recorded for your account.\n\nPayment Reference: ${record.id}\nAmount: $1.50 USD\nPurpose: ${purpose}\nDate: ${new Date().toLocaleDateString()}\n\nAs required by California SB 478 (Honest Pricing Law), this fee is disclosed upfront and covers: secure identity-verified contractor access on the ContractorHub platform.\n\nSecure card payment processing is coming soon. Your access has been noted.\n\nContractorHub\n(This is an automated receipt — do not reply to this email)`,
      });

      return record;
    },
    onSuccess: (record) => {
      setPaid(true);
      onPaid(record);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleClose = () => {
    setPaid(false);
    setFormData({ name: '', email: '' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-500" />
            Platform Access Fee — $1.50
          </DialogTitle>
        </DialogHeader>

        {alreadyPaid ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Already Verified</h3>
            <p className="text-slate-600 text-sm mb-4">
              A confirmed payment already exists for this account. Your access is active.
            </p>
            <Button onClick={handleClose} className="bg-amber-500 hover:bg-amber-600 text-slate-900">Continue</Button>
          </div>
        ) : paid ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Access Granted</h3>
            <p className="text-slate-600 text-sm mb-4">
              A receipt has been sent to your email. You now have access to communicate with this {payerType === 'customer' ? 'contractor' : 'customer'}.
            </p>
            <Button onClick={handleClose} className="bg-amber-500 hover:bg-amber-600 text-slate-900">Continue</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-2">

           {/* Payment & Cost Responsibility Notice — shown to customers only */}
           {payerType === 'customer' && (
             <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-sm text-amber-900 space-y-2">
               <div className="flex items-start gap-2">
                 <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                 <strong className="text-amber-900">Important — Please Read Before Proceeding</strong>
               </div>
               <p className="leading-relaxed">
                 Any amounts, totals, costs, or prices agreed upon with the contractor for the scope of work or services to be performed are 
                 <strong> solely between you and the contractor</strong>. ContractorHub is not a party to any payment arrangement between you and the contractor.
               </p>
               <p className="leading-relaxed">
                 By proceeding, you acknowledge and agree that <strong>full payment to the contractor is due immediately upon completion of the agreed work</strong>. 
                 ContractorHub does not process, hold, or mediate payments between customers and contractors.
               </p>
             </div>
           )}

           {/* California SB 478 Compliant Fee Disclosure */}
           <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 space-y-2">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
                <div>
                  <strong className="text-slate-900">Platform Access Fee: $1.50 (USD)</strong>
                  <p className="mt-1">
                    {payerType === 'customer'
                      ? `This one-time fee unlocks communication with ${contractorName}. A separate $1.50 fee applies per contractor.`
                      : 'This one-time fee activates your ability to receive and respond to customer inquiries on ContractorHub.'}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Fee disclosed as required by California SB 478 (Honest Pricing Law). Secure card payment via Stripe is coming soon — your fee is logged and a receipt will be emailed to you.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Stripe secure card payment launching soon. Your fee record is saved now.</span>
            </div>

            <div>
              <Label htmlFor="pay_name">Your Full Name *</Label>
              <Input
                id="pay_name"
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="pay_email">Your Email *</Label>
              <Input
                id="pay_email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                required
                className="mt-1.5"
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
              <Button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                ) : (
                  'Confirm & Pay $1.50'
                )}
              </Button>
            </div>

            <p className="text-center text-xs text-slate-400">
              By proceeding, you authorize a $1.50 USD platform access fee. All fees are non-refundable.
              {payerType === 'customer' && ' You also acknowledge that contractor payment terms are agreed directly between you and the contractor, and payment is due upon job completion.'}
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}