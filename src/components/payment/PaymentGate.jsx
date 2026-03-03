import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DollarSign, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function PaymentGate({ open, onClose, onPaid, payerType, contractorId, contractorEmail, contractorName }) {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [paid, setPaid] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const record = await base44.entities.Payment.create({
        payer_email: data.email,
        payer_name: data.name,
        payer_type: payerType,
        contractor_id: contractorId || '',
        contractor_email: contractorEmail || '',
        amount: 1.50,
        status: 'pending',
        purpose: payerType === 'contractor'
          ? 'Contractor app access fee'
          : `Customer access to contact contractor ${contractorName}`,
      });

      await base44.integrations.Core.SendEmail({
        to: data.email,
        subject: 'ContractorHub — $1.50 Platform Fee Acknowledgment',
        body: `Dear ${data.name},\n\nThank you for acknowledging the ContractorHub platform fee of $1.50.\n\nPayment Reference ID: ${record.id}\nAmount: $1.50\nPurpose: ${record.purpose}\n\nPlease arrange payment of $1.50 to the platform administrator. Your access will be confirmed once payment is received.\n\nThank you,\nContractorHub`,
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

        {paid ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Fee Acknowledged</h3>
            <p className="text-slate-600 text-sm mb-4">
              A confirmation has been sent to your email. You now have access to communicate with this {payerType === 'customer' ? 'contractor' : 'customer'}.
            </p>
            <Button onClick={handleClose} className="bg-amber-500 hover:bg-amber-600 text-slate-900">Continue</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>A one-time platform fee of $1.50 is required.</strong>
                  <p className="mt-1 text-amber-700">
                    {payerType === 'customer'
                      ? `This fee grants you access to communicate with ${contractorName}. Each contractor requires a separate $1.50 fee.`
                      : 'This fee grants you access to communicate with customers on ContractorHub.'}
                  </p>
                  <p className="mt-1 text-amber-700">Payment instructions will be sent to your email.</p>
                </div>
              </div>
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
                  'Acknowledge & Pay $1.50'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}