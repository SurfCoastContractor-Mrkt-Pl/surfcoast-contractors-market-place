import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, FileText, Shield, Briefcase } from 'lucide-react';

/**
 * License status badge for public profile
 * - Green "✓ License Verified" if license_verified=true AND license_status="active"
 * - Orange "⚠ Inactive License" if license_status="inactive" or "expired"
 * - Yellow "⏳ License Pending Review" if license_status="pending_review"
 * - Nothing otherwise
 */
function LicenseStatusBadge({ contractor }) {
  if (!contractor?.is_licensed_sole_proprietor) return null;

  const { license_verified, license_status } = contractor;

  if (license_verified && license_status === 'active') {
    return (
      <Badge className="bg-green-100 text-green-700 text-xs gap-1">
        <span>✓</span>
        <span>License Verified</span>
      </Badge>
    );
  }

  if (license_status === 'inactive' || license_status === 'expired') {
    return (
      <Badge className="bg-orange-100 text-orange-700 text-xs gap-1">
        <span>⚠</span>
        <span>Inactive License</span>
      </Badge>
    );
  }

  if (license_status === 'pending_review') {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 text-xs gap-1">
        <span>⏳</span>
        <span>License Pending Review</span>
      </Badge>
    );
  }

  return null;
}

/**
 * Display public credentials (documents with visibility="public")
 */
export default function PublicCredentialsDisplay({ contractor }) {
  if (!contractor?.is_licensed_sole_proprietor) return null;

  const visibility = contractor.document_visibility || {};

  // Determine which sections to show based on visibility settings
  const showHisLicense = visibility.his_license === 'public' && contractor.his_license_number;
  const showBond = visibility.bond === 'public' && contractor.bond_company;
  const showInsurance = visibility.insurance === 'public' && contractor.insurance_company;
  const showContracts = visibility.contracts === 'public' && contractor.home_improvement_contracts?.length > 0;
  const showCertifications = visibility.certifications === 'public' && contractor.additional_certifications?.length > 0;

  // Only render if there's a license badge or public documents
  const licenseStatusBadge = <LicenseStatusBadge contractor={contractor} />;
  const hasPublicDocs = showHisLicense || showBond || showInsurance || showContracts || showCertifications;

  if (!licenseStatusBadge && !hasPublicDocs) return null;

  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0 pb-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-slate-700" />
          <CardTitle className="text-lg">Professional Credentials</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-0 space-y-6">
        {/* License Status Badge */}
        {licenseStatusBadge && (
          <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
            <span className="text-sm font-medium text-slate-700">Contractor License:</span>
            {licenseStatusBadge}
          </div>
        )}

        {/* HIS License */}
        {showHisLicense && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-slate-600" />
              HIS License (Home Improvement Salesperson)
            </h4>
            <p className="text-sm text-slate-700">
              License #: <span className="font-medium">{contractor.his_license_number}</span>
              {contractor.his_license_state && <span className="text-slate-600"> — {contractor.his_license_state}</span>}
            </p>
            {contractor.his_license_url && (
              <a href={contractor.his_license_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                View Document →
              </a>
            )}
          </div>
        )}

        {/* Bond */}
        {showBond && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-slate-600" />
              Bond
            </h4>
            <p className="text-sm text-slate-700">
              {contractor.bond_company}
              {contractor.bond_amount && <span className="text-slate-600"> — {contractor.bond_amount}</span>}
            </p>
            {contractor.bond_expiry && (
              <p className="text-xs text-slate-600 mt-1">Expires: {contractor.bond_expiry}</p>
            )}
            {contractor.bond_document_url && (
              <a href={contractor.bond_document_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                View Document →
              </a>
            )}
          </div>
        )}

        {/* Insurance */}
        {showInsurance && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-slate-600" />
              Business Insurance
            </h4>
            <p className="text-sm text-slate-700">
              {contractor.insurance_company}
              {contractor.insurance_coverage_amount && <span className="text-slate-600"> — {contractor.insurance_coverage_amount}</span>}
            </p>
            {contractor.insurance_policy_number && (
              <p className="text-xs text-slate-600 mt-1">Policy #: {contractor.insurance_policy_number}</p>
            )}
            {contractor.insurance_expiry && (
              <p className="text-xs text-slate-600 mt-1">Expires: {contractor.insurance_expiry}</p>
            )}
            {contractor.insurance_document_url && (
              <a href={contractor.insurance_document_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                View Document →
              </a>
            )}
          </div>
        )}

        {/* Home Improvement Contracts */}
        {showContracts && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-slate-600" />
              Home Improvement Contracts
            </h4>
            <div className="space-y-2">
              {contractor.home_improvement_contracts.map((contract, idx) => (
                <div key={idx} className="text-sm text-slate-700 flex items-start justify-between gap-3">
                  <span>
                    <span className="font-medium">{contract.contract_name}</span>
                    <span className="text-slate-600"> — {contract.trade}, {contract.state}</span>
                  </span>
                  {contract.document_url && (
                    <a href={contract.document_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline shrink-0">
                      View
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Certifications */}
        {showCertifications && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-slate-600" />
              Additional Certifications
            </h4>
            <div className="space-y-2">
              {contractor.additional_certifications.map((cert, idx) => (
                <div key={idx} className="text-sm text-slate-700 flex items-start justify-between gap-3">
                  <span>
                    <span className="font-medium">{cert.name}</span>
                    {cert.issuer && <span className="text-slate-600"> — {cert.issuer}</span>}
                    {cert.expiry && <span className="text-slate-600"> (expires {cert.expiry})</span>}
                  </span>
                  {cert.document_url && (
                    <a href={cert.document_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline shrink-0">
                      View
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}