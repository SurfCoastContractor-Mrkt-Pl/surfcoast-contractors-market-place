import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function PeerAgreementModal({ open, onClose, collaborationId, contractorEmail, contractorName }) {
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSign = async () => {
    if (!agreed) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await base44.functions.invoke('signPeerAgreement', {
        collaboration_id: collaborationId,
        contractor_email: contractorEmail
      });

      if (res.data.success) {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to sign agreement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Peer Collaboration Agreement</DialogTitle>
          <DialogDescription>
            Please read and sign this agreement before collaborating with other contractors.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-4">Independent Contractor Collaboration Agreement</h3>

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <p>
                <strong>1. Independent Status:</strong> All parties acknowledge they are independent contractors. No contractor supervises, directs, or controls any other contractor on this project.
              </p>

              <p>
                <strong>2. Equal Responsibility:</strong> Each contractor is solely responsible for their own work scope, quality, compliance, and timeline. No contractor manages or approves another's work.
              </p>

              <p>
                <strong>3. Direct Payment:</strong> Each contractor is paid directly by the customer for their individual scope of work. No contractor receives payment on behalf of others.
              </p>

              <p>
                <strong>4. Insurance & Compliance:</strong> Each contractor is responsible for their own licensing, insurance, and legal compliance. Contractors with CSLB licenses or sole proprietor status must maintain active general liability insurance.
              </p>

              <p>
                <strong>5. Peer Coordination:</strong> Contractors coordinate directly with each other as equals. SurfCoast facilitates this collaboration but has no authority over any contractor's work.
              </p>

              <p>
                <strong>6. Liability:</strong> Each contractor assumes full liability for their own conduct, work quality, and compliance. No contractor is liable for other contractors' actions.
              </p>

              <p>
                <strong>7. Disputes:</strong> Disputes between collaborators are resolved between those parties. SurfCoast does not arbitrate or intervene in contractor-to-contractor disputes.
              </p>

              <p>
                <strong>8. Platform Fee:</strong> A 3% platform facilitation fee applies to each contractor's payment individually.
              </p>
            </div>
          </div>

          {error && (
            <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm">
                I acknowledge that I am an independent contractor and agree to collaborate as an equal with other contractors on this project. I understand SurfCoast is a neutral platform only.
              </span>
            </label>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSign}
              disabled={!agreed || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>Signing...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Sign Agreement
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}