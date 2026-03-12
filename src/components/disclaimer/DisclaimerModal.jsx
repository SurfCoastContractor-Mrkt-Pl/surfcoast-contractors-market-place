import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
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
           <DialogDescription className="sr-only">Customer liability disclaimer that must be signed before proceeding</DialogDescription>
         </DialogHeader>

        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 font-medium">
            Please read this disclaimer carefully. By signing, you acknowledge and agree to all terms below. This is a legally binding acknowledgment.
          </p>
        </div>

        {/* Disclaimer Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 space-y-2 leading-relaxed">
          <ul className="space-y-1.5 text-slate-600">
            <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span>SurfCoast is a platform only — we do not employ, endorse, or guarantee any contractor's work.</li>
            <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span>You are responsible for vetting contractors before hiring (licenses, insurance, references).</li>
            <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span>Once work starts, any damages or disputes are between you and the contractor.</li>
            <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span>All contractors are individual freelancers only — no crews, companies, or multi-person entities.</li>
            <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span>By signing, you indemnify SurfCoast from all claims arising from your engagement.</li>
          </ul>
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-amber-600 hover:text-amber-700 underline mt-2"
          >
            Read full Terms & Acknowledgements →
          </a>
        </div>

        {/* Acknowledgment Checkboxes */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Please acknowledge each of the following:</p>

          {[
            { key: 'damages', label: 'I understand that once work has started, any damages are my responsibility as the customer, not the contractor\'s or SurfCoast Contractor Market Place\'s.' },
            { key: 'vetting', label: 'I understand it is my sole responsibility to vet, verify, and research any contractor before accepting or awarding work.' },
            { key: 'responsibility', label: 'I understand SurfCoast Contractor Market Place is a platform only and does not endorse, employ, or guarantee any contractor\'s work or qualifications.' },
            { key: 'solo', label: 'I understand that all contractors on SurfCoast Contractor Market Place are individual freelancers only. Companies, crews, or multi-person entities are strictly prohibited and will be banned.' },
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