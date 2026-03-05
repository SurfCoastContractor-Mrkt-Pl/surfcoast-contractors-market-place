import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

const DocUploadField = ({ label, description, fieldKey, value, onUploaded }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onUploaded(fieldKey, file_url);
    setUploading(false);
  };

  return (
    <div className="bg-white rounded-xl border border-orange-200 p-4 space-y-2">
      <Label className="font-semibold text-slate-800 flex items-center gap-1">
        {label} *
        {value && <CheckCircle2 className="w-4 h-4 text-green-500 ml-1" />}
      </Label>
      {description && <p className="text-xs text-slate-500">{description}</p>}
      {value ? (
        <div className="relative group">
          <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="truncate">Document uploaded</span>
          </div>
          <label className="absolute inset-0 cursor-pointer opacity-0">
            <input type="file" accept="image/*,.pdf" onChange={handleUpload} className="hidden" />
          </label>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-orange-300 rounded-xl cursor-pointer bg-orange-50 hover:bg-orange-100 transition-colors">
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          ) : (
            <>
              <Upload className="w-5 h-5 text-orange-400 mb-1" />
              <span className="text-sm text-orange-600 font-medium">Upload Document</span>
              <span className="text-xs text-orange-400">JPG, PNG, PDF accepted</span>
            </>
          )}
          <input type="file" accept="image/*,.pdf" onChange={handleUpload} className="hidden" />
        </label>
      )}
    </div>
  );
};

export default function MinorConsentUpload({ data, onChange }) {
  const handleDoc = (field, url) => {
    onChange({ ...data, [field]: url });
  };

  const handleInfo = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const allDocsUploaded =
    data?.parental_consent_form_url &&
    data?.child_id_url &&
    data?.parent_id_url &&
    data?.proof_of_relationship_url &&
    data?.child_proof_of_residence_url &&
    data?.parent_proof_of_residence_url;

  return (
    <div className="p-5 rounded-xl border-2 border-orange-300 bg-orange-50 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h3 className="font-bold text-orange-900">Parental Consent Required — Minor Contractor</h3>
          <p className="text-sm text-orange-700 mt-1 leading-relaxed">
            Because you are under 18, you must provide parental/guardian consent and all required documentation before your profile can be approved. 
            All documents will be reviewed by our admin team.
          </p>
        </div>
      </div>

      <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 flex items-start gap-2 text-xs text-amber-800">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>All uploaded documents are kept confidential and used only for identity and consent verification. They will not be shared with customers.</span>
      </div>

      {/* Parent/Guardian Info */}
      <div className="bg-white rounded-xl border border-orange-200 p-4 space-y-4">
        <h4 className="font-semibold text-slate-800">Parent / Guardian Information</h4>
        <div>
          <Label htmlFor="parent_name">Parent/Guardian Full Legal Name *</Label>
          <Input
            id="parent_name"
            placeholder="Full legal name"
            value={data?.parent_name || ''}
            onChange={(e) => handleInfo('parent_name', e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="parent_email">Parent/Guardian Email *</Label>
            <Input
              id="parent_email"
              type="email"
              placeholder="parent@email.com"
              value={data?.parent_email || ''}
              onChange={(e) => handleInfo('parent_email', e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="parent_phone">Parent/Guardian Phone *</Label>
            <Input
              id="parent_phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={data?.parent_phone || ''}
              onChange={(e) => handleInfo('parent_phone', e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
      </div>

      {/* Document Uploads */}
      <div className="space-y-3">
        <h4 className="font-semibold text-slate-800">Required Documents</h4>

        <DocUploadField
          label="Signed Parental Consent Form"
          description="A signed document from your parent/guardian consenting to your participation on this platform as a contractor."
          fieldKey="parental_consent_form_url"
          value={data?.parental_consent_form_url}
          onUploaded={handleDoc}
        />

        <DocUploadField
          label="Child's Government-Issued ID or Birth Certificate"
          description="School ID, passport, or birth certificate showing the child's name and date of birth."
          fieldKey="child_id_url"
          value={data?.child_id_url}
          onUploaded={handleDoc}
        />

        <DocUploadField
          label="Parent/Guardian Government-Issued ID or Driver's License"
          description="Clear photo of the parent/guardian's ID. All four corners must be visible."
          fieldKey="parent_id_url"
          value={data?.parent_id_url}
          onUploaded={handleDoc}
        />

        <DocUploadField
          label="Proof of Parental/Guardian Relationship"
          description="Birth certificate showing parent-child relationship, adoption papers, or legal guardianship documents."
          fieldKey="proof_of_relationship_url"
          value={data?.proof_of_relationship_url}
          onUploaded={handleDoc}
        />

        <DocUploadField
          label="Child's Proof of Residence"
          description="Utility bill, bank statement, or official mail showing the child's current residential address."
          fieldKey="child_proof_of_residence_url"
          value={data?.child_proof_of_residence_url}
          onUploaded={handleDoc}
        />

        <DocUploadField
          label="Parent/Guardian's Proof of Residence"
          description="Utility bill, bank statement, or official mail showing the parent/guardian's current residential address."
          fieldKey="parent_proof_of_residence_url"
          value={data?.parent_proof_of_residence_url}
          onUploaded={handleDoc}
        />
      </div>

      {allDocsUploaded && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          All required documents uploaded. Your profile will be reviewed by our admin team.
        </div>
      )}
    </div>
  );
}