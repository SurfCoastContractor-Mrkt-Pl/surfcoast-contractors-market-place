import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export default function CredentialDisplayCard({ contractor }) {
  if (!contractor) return null;

  const hasLicense = contractor.license_verified && contractor.license_number;
  const hasInsurance = contractor.insurance_policy_number;
  const hasBond = contractor.bond_amount;
  const credentialCount = [hasLicense, hasInsurance, hasBond].filter(Boolean).length;

  return (
    <Card className="p-6 border-slate-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Professional Credentials</h3>
          {credentialCount > 0 && (
            <Badge variant="default" className="bg-green-600">
              {credentialCount} Verified
            </Badge>
          )}
        </div>

        {credentialCount === 0 ? (
          <p className="text-sm text-slate-500">No verified credentials on file</p>
        ) : (
          <div className="space-y-3">
            {hasLicense && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">License Verified</p>
                  <p className="text-xs text-slate-600">
                    {contractor.license_company_name || 'License'} • {contractor.license_state}
                  </p>
                  {contractor.license_number && (
                    <p className="text-xs text-slate-500 mt-1">License #: {contractor.license_number}</p>
                  )}
                </div>
              </div>
            )}

            {hasInsurance && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">Insurance Coverage</p>
                  <p className="text-xs text-slate-600">{contractor.insurance_company}</p>
                  {contractor.insurance_coverage_amount && (
                    <p className="text-xs text-slate-500 mt-1">Coverage: ${contractor.insurance_coverage_amount}</p>
                  )}
                </div>
              </div>
            )}

            {hasBond && (
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">Bonded</p>
                  <p className="text-xs text-slate-600">{contractor.bond_company}</p>
                  {contractor.bond_amount && (
                    <p className="text-xs text-slate-500 mt-1">Bond: ${contractor.bond_amount}</p>
                  )}
                </div>
              </div>
            )}

            {contractor.certifications && contractor.certifications.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <FileText className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">Certifications</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {contractor.certifications.map((cert, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!contractor.license_verified && !hasInsurance && !hasBond && (
          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800">This contractor has not yet verified their professional credentials.</p>
          </div>
        )}
      </div>
    </Card>
  );
}