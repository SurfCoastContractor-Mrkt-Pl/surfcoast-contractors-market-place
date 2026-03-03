import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { AlertTriangle, ShieldAlert, Loader2, CheckCircle } from 'lucide-react';

export default function DisclaimerModal({ open, onAccepted, onClose }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    signature: '',
  });
  const [checks, setChecks] = useState({
    damages: false,
    vetting: false,
    responsibility: false,
    solo: false,
    legal: false,
  });
  const [signatureError, setSignatureError] = useState('');

  const allChecked = Object.values(checks).every(Boolean);
  const formValid = formData.customer_name && formData.customer_email && formData.signature && allChecked;

  const resetForm = () => {
    setFormData({ customer_name: '', customer_email: '', signature: '' });
    setChecks({ damages: false, vetting: false, responsibility: false, solo: false, legal: false });
    setSignatureError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.DisclaimerAcceptance.create(data),
    onSuccess: (record) => {
      resetForm();
      onAccepted(record);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.signature.trim().toLowerCase() !== formData.customer_name.trim().toLowerCase()) {
      setSignatureError('Your signature must match your full name exactly.');
      return;
    }
    setSignatureError('');

    mutation.mutate({
      ...formData,
      accepted_at: new Date().toISOString(),
      ip_acknowledged: true,
    });
  };

  const toggleCheck = (key) => setChecks(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <div className="flex items-center gap-3 mb-2">
             <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
               <ShieldAlert className="w-6 h-6 text-red-600" />
             </div>
             <div>
               <DialogTitle className="text-xl font-bold text-slate-900">
                 Customer Liability Disclaimer
               </DialogTitle>
               <p className="text-sm text-slate-500">You must read and sign before proceeding</p>
             </div>
           </div>
           <p className="sr-only">Customer liability disclaimer that must be signed before proceeding</p>
         </DialogHeader>

        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 font-medium">
            Please read this disclaimer carefully. By signing, you acknowledge and agree to all terms below. This is a legally binding acknowledgment.
          </p>
        </div>

        {/* Disclaimer Text */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-700 space-y-4 leading-relaxed max-h-56 overflow-y-auto">
          <p className="font-bold text-slate-900 uppercase text-xs tracking-wider">
            ContractorHub — Customer Liability & Vetting Disclaimer
          </p>

          <p>
            <strong>1. No Contractor Liability for Damages.</strong> Once work has commenced, ContractorHub and any contractor listed on this platform shall bear no responsibility or liability for any damages, losses, injuries, defects, or disputes arising from or related to the work performed. All risk associated with work performed after project commencement is assumed entirely by the customer.
          </p>

          <p>
            <strong>2. Customer Responsibility to Vet Contractors.</strong> It is the sole responsibility of the customer to thoroughly vet, verify, and evaluate any contractor prior to hiring or accepting work. This includes, but is not limited to: verifying licenses and certifications, checking references, reviewing past work, confirming insurance coverage, and conducting background checks as deemed necessary.
          </p>

          <p>
            <strong>3. ContractorHub is a Platform Only.</strong> ContractorHub acts solely as a marketplace connecting contractors and customers. ContractorHub does not employ, endorse, warrant, or guarantee the work, qualifications, conduct, or identity of any contractor listed on the platform. ContractorHub assumes no liability whatsoever for any outcome of any engagement between a customer and contractor.
          </p>

          <p>
            <strong>4. No Warranty of Workmanship.</strong> ContractorHub makes no representations or warranties, express or implied, regarding the quality, safety, legality, or suitability of any contractor's work. Customers engage contractors entirely at their own risk.
          </p>

          <p>
            <strong>5. Dispute Resolution.</strong> Any disputes arising from a contractor-customer engagement are strictly between those parties. ContractorHub is not a party to any such dispute and shall not be involved in resolution, mediation, or arbitration.
          </p>

          <p>
            <strong>6. Indemnification.</strong> By accepting this disclaimer, the customer agrees to indemnify and hold harmless ContractorHub, its officers, employees, and affiliates from any claims, damages, or expenses arising from the customer's use of the platform or engagement with any contractor.
          </p>

          <p>
            <strong>7. Single-Person Contractor Policy.</strong> All contractors registered on ContractorHub are individual freelancers only. A "contractor" or "freelancer" on this platform is defined strictly as one (1) individual person. No company, business entity, partnership, crew, or group of two or more persons may register or operate as a contractor on this platform. Any contractor found to be operating with additional workers, employees, subcontractors, or associates working on their behalf will be immediately and permanently banned from ContractorHub without notice.
          </p>

          <p className="text-xs text-slate-500">
            Last updated: March 2026. This disclaimer is subject to change. Customers are encouraged to review this disclaimer before each engagement.
          </p>
        </div>

        {/* Acknowledgment Checkboxes */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Please acknowledge each of the following:</p>

          {[
            { key: 'damages', label: 'I understand that once work has started, any damages are my responsibility as the customer, not the contractor\'s or ContractorHub\'s.' },
            { key: 'vetting', label: 'I understand it is my sole responsibility to vet, verify, and research any contractor before accepting or awarding work.' },
            { key: 'responsibility', label: 'I understand ContractorHub is a platform only and does not endorse, employ, or guarantee any contractor\'s work or qualifications.' },
            { key: 'solo', label: 'I understand that all contractors on ContractorHub are individual freelancers only. Companies, crews, or multi-person entities are strictly prohibited and will be banned.' },
            { key: 'legal', label: 'I understand this disclaimer is a legally binding acknowledgment and I agree to all terms stated above.' },
          ].map(item => (
            <div key={item.key} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
              <Checkbox
                id={item.key}
                checked={checks[item.key]}
                onCheckedChange={() => toggleCheck(item.key)}
                className="mt-0.5"
              />
              <Label htmlFor={item.key} className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                {item.label}
              </Label>
            </div>
          ))}
        </div>

        {/* Signature Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-200">
          <p className="text-sm font-semibold text-slate-700">Sign to confirm your agreement:</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_name">Full Legal Name *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData(p => ({ ...p, customer_name: e.target.value }))}
                placeholder="Your full name"
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="customer_email">Email Address *</Label>
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData(p => ({ ...p, customer_email: e.target.value }))}
                placeholder="your@email.com"
                required
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="signature">
              Electronic Signature *{' '}
              <span className="text-slate-400 font-normal">(Type your full name exactly as entered above)</span>
            </Label>
            <Input
              id="signature"
              value={formData.signature}
              onChange={(e) => { setFormData(p => ({ ...p, signature: e.target.value })); setSignatureError(''); }}
              placeholder="Type your full name to sign"
              required
              className={`mt-1.5 font-serif text-lg ${signatureError ? 'border-red-400' : ''}`}
            />
            {signatureError && (
              <p className="text-red-500 text-xs mt-1">{signatureError}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">
              By typing your name, you are electronically signing this disclaimer and agreeing to all terms.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formValid || mutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  I Agree & Sign Disclaimer
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}