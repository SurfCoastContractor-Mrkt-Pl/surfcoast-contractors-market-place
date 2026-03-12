import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { AlertTriangle, ShieldAlert, Loader2, CheckCircle } from 'lucide-react';

export default function DisclaimerModal({ open, onAccepted, onClose }) {
  const [user, setUser] = useState(null);
  const [checks, setChecks] = useState({
    damages: false,
    vetting: false,
    responsibility: false,
    solo: false,
    legal: false,
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const allChecked = Object.values(checks).every(Boolean);

  const resetForm = () => {
    setChecks({ damages: false, vetting: false, responsibility: false, solo: false, legal: false });
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
    mutation.mutate({
      customer_name: user?.full_name || user?.email || 'Unknown',
      customer_email: user?.email || '',
      signature: user?.full_name || user?.email || 'Acknowledged',
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

        {/* Confirm Button */}
        <form onSubmit={handleSubmit} className="pt-2 border-t border-slate-200 space-y-3">
          {user && (
            <p className="text-xs text-slate-500">
              Confirming as: <strong className="text-slate-700">{user.full_name || user.email}</strong>
            </p>
          )}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!allChecked || mutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  I Agree & Proceed
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}