import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import CredentialDocumentsUpload from '@/components/contractor/CredentialDocumentsUpload';
import MinorConsentUpload from '@/components/contractor/MinorConsentUpload';

export default function OnboardingStep4Credentials({
  formData,
  isMinor,
  age,
  methods,
}) {
  const { setValue } = useFormContext();
  return (
    <div style={{ background:"rgba(10,22,40,0.55)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"16px", padding:"28px", marginBottom:"16px" }}>
      <h2 style={{ fontSize:"16px", fontWeight:"700", color:"#ffffff", marginBottom:"20px", paddingBottom:"12px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>Credentials & Documents</h2>
      
      <div className="space-y-6">
        {/* Credential Documents */}
        <div>
          <Label className="text-base font-semibold text-slate-900 block mb-1">Credential Documents</Label>
          <p className="text-sm text-slate-500 mb-3">
            Upload any certificates, academic degrees, diplomas, trade licenses, or contractor licenses. 
            Contractor licenses must be registered as a sole proprietor. Degrees and diplomas must show the same legal name as your ID on file.
          </p>
          <CredentialDocumentsUpload
            credentials={formData.credential_documents}
            onChange={(docs) => setValue('credential_documents', docs)}
            legalName={formData.name}
          />
        </div>

        {/* Minor Parental Consent Section */}
        {isMinor && (
          <MinorConsentUpload
            data={formData.parental_consent_docs}
            onChange={(docs) => setValue('parental_consent_docs', docs)}
            location={formData.location}
            age={age}
          />
        )}
      </div>
    </div>
  );
}