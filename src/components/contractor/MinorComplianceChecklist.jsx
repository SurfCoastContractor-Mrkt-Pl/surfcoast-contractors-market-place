import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function MinorComplianceChecklist({ contractor }) {
  if (!contractor?.is_minor) return null;

  const checks = [
    {
      id: 'identity',
      label: 'Identity Verification',
      done: contractor.identity_verified,
      description: 'Government ID verified for age confirmation'
    },
    {
      id: 'parental',
      label: 'Parental Consent Documents',
      done: contractor.parental_consent_docs?.parental_consent_form_url,
      description: 'Signed parental consent form on file'
    },
    {
      id: 'address',
      label: 'Proof of Residency',
      done: contractor.parental_consent_docs?.child_proof_of_residence_url,
      description: 'Verified address for both minor and parent'
    },
    {
      id: 'parent_id',
      label: 'Parent/Guardian ID',
      done: contractor.parental_consent_docs?.parent_id_url,
      description: 'Parent/guardian government ID verified'
    }
  ];

  const completed = checks.filter(c => c.done).length;
  const total = checks.length;

  return (
    <Card className={`p-5 ${completed === total ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Minor Compliance Checklist</h3>
          <Badge className={completed === total ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
            {completed}/{total} Complete
          </Badge>
        </div>

        <div className="space-y-2">
          {checks.map(check => (
            <div key={check.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/50 transition">
              {check.done ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${check.done ? 'text-green-900' : 'text-amber-900'}`}>
                  {check.label}
                </p>
                <p className="text-xs text-slate-600">{check.description}</p>
              </div>
            </div>
          ))}
        </div>

        {completed < total && (
          <div className="flex gap-2 p-3 bg-white border border-amber-200 rounded-lg text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Complete all documentation to unlock full platform access and start accepting jobs.</p>
          </div>
        )}
      </div>
    </Card>
  );
}