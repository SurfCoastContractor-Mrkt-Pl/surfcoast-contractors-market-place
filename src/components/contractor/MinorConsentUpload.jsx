import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, CheckCircle2, AlertTriangle, ShieldAlert, Camera, FileText, Home, User } from 'lucide-react';
import MinorLaborLaws from './MinorLaborLaws';

const DocUploadField = ({ label, description, fieldKey, value, onUploaded, isPhoto = false }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onUploaded(fieldKey, file_url);
    setUploading(false);
  };

  const accept = isPhoto ? 'image/*' : 'image/*,.pdf';
  const uploadLabel = isPhoto ? 'Upload Photo' : 'Upload Document';
  const subLabel = isPhoto ? 'JPG, PNG accepted' : 'JPG, PNG, PDF accepted';

  return (
    <div className="bg-white rounded-xl border border-orange-200 p-4 space-y-2">
      <Label className="font-semibold text-slate-800 flex items-center gap-1">
        {label} *
        {value && <CheckCircle2 className="w-4 h-4 text-green-500 ml-1" />}
      </Label>
      {description && <p className="text-xs text-slate-500">{description}</p>}
      {value ? (
        <div className="relative">
          {isPhoto ? (
            <div className="relative">
              <img src={value} alt="Uploaded" className="w-32 h-32 object-cover rounded-lg border border-green-200" />
              <label className="absolute inset-0 cursor-pointer opacity-0">
                <input type="file" accept={accept} onChange={handleUpload} className="hidden" />
              </label>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-green-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Photo uploaded — click to replace
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="truncate">Document uploaded</span>
              <label className="ml-auto cursor-pointer text-xs text-slate-400 hover:text-slate-600 underline">
                Replace
                <input type="file" accept={accept} onChange={handleUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-orange-300 rounded-xl cursor-pointer bg-orange-50 hover:bg-orange-100 transition-colors">
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          ) : (
            <>
              {isPhoto ? <Camera className="w-5 h-5 text-orange-400 mb-1" /> : <Upload className="w-5 h-5 text-orange-400 mb-1" />}
              <span className="text-sm text-orange-600 font-medium">{uploadLabel}</span>
              <span className="text-xs text-orange-400">{subLabel}</span>
            </>
          )}
          <input type="file" accept={accept} onChange={handleUpload} className="hidden" />
        </label>
      )}
    </div>
  );
};

const SectionHeader = ({ icon: IconComp, title, subtitle }) => (
  <div className="flex items-center gap-2 pb-2 border-b border-orange-200">
    <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
      <IconComp className="w-4 h-4 text-orange-600" />
    </div>
    <div>
      <h4 className="font-semibold text-slate-800 text-sm">{title}</h4>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
  </div>
);

export default function MinorConsentUpload({ data, onChange, location = '', age = null }) {
  const handleDoc = (field, url) => {
    onChange({ ...data, [field]: url });
  };

  const handleInfo = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const allDocsUploaded =
    data?.child_selfie_url &&
    data?.child_id_url &&
    data?.parental_consent_form_url &&
    data?.parent_id_url &&
    data?.proof_of_relationship_url &&
    data?.child_proof_of_residence_url &&
    data?.parent_proof_of_residence_url;

  const completedCount = [
    data?.child_selfie_url,
    data?.child_id_url,
    data?.parental_consent_form_url,
    data?.parent_id_url,
    data?.proof_of_relationship_url,
    data?.child_proof_of_residence_url,
    data?.parent_proof_of_residence_url,
  ].filter(Boolean).length;

  return (
    <div className="p-5 rounded-xl border-2 border-orange-300 bg-orange-50 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5 text-orange-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-orange-900">Parental / Guardian Consent Required</h3>
          <p className="text-sm text-orange-700 mt-1 leading-relaxed">
            Because you are under 18, your parent or legal guardian must provide consent and all required documentation before your profile can be approved.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-orange-200">
              <div
                className="h-2 rounded-full bg-orange-500 transition-all"
                style={{ width: `${(completedCount / 7) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-orange-700">{completedCount}/7 completed</span>
          </div>
        </div>
      </div>

      <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 flex items-start gap-2 text-xs text-amber-800">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>All documents are kept strictly confidential and used only for identity and consent verification. They are never shared with customers.</span>
      </div>

      {/* Location-specific labor laws */}
      <MinorLaborLaws location={location} age={age} />

      {/* Section 1: Child Identity */}
      <div className="bg-white rounded-xl border border-orange-200 p-4 space-y-4">
        <SectionHeader icon={User} title="Minor's Identity Verification" subtitle="Selfie + government-issued ID to confirm identity"/>

        <DocUploadField
          label="Minor's Selfie / Face Photo"
          description="A clear, unobstructed photo of the minor's face taken in good lighting. Used to match against their ID document."
          fieldKey="child_selfie_url"
          value={data?.child_selfie_url}
          onUploaded={handleDoc}
          isPhoto={true}
        />

        <DocUploadField
          label="Minor's Government-Issued ID or Birth Certificate"
          description="School ID, passport, state ID, or birth certificate clearly showing the minor's full name and date of birth."
          fieldKey="child_id_url"
          value={data?.child_id_url}
          onUploaded={handleDoc}
        />
      </div>

      {/* Section 2: Parent/Guardian Info */}
      <div className="bg-white rounded-xl border border-orange-200 p-4 space-y-4">
        <SectionHeader icon={FileText} title="Parent / Guardian Information" subtitle="Legal name and contact details" />
        <div>
          <Label htmlFor="parent_name">Parent/Guardian Full Legal Name *</Label>
          <Input
            id="parent_name"
            placeholder="As it appears on official ID"
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

      {/* Section 3: Parent/Guardian Documents */}
      <div className="bg-white rounded-xl border border-orange-200 p-4 space-y-4">
        <SectionHeader icon={FileText} title="Parent / Guardian Documentation" subtitle="ID, consent form, and proof of relationship" />

        <DocUploadField
          label="Signed Parental Consent Form"
          description="A signed document from the parent/guardian explicitly consenting to the minor's participation as a contractor on this platform."
          fieldKey="parental_consent_form_url"
          value={data?.parental_consent_form_url}
          onUploaded={handleDoc}
        />

        <DocUploadField
          label="Parent/Guardian Government-Issued ID or Driver's License"
          description="Clear photo of the parent or guardian's government-issued photo ID or driver's license. All four corners must be visible."
          fieldKey="parent_id_url"
          value={data?.parent_id_url}
          onUploaded={handleDoc}
        />

        <DocUploadField
          label="Legal Guardianship or Proof of Parental Relationship"
          description="If a legal guardian (not biological parent): court-issued guardianship order or legal guardianship certificate. If a parent: birth certificate showing parent-child relationship or adoption papers."
          fieldKey="proof_of_relationship_url"
          value={data?.proof_of_relationship_url}
          onUploaded={handleDoc}
        />
      </div>

      {/* Section 4: Proof of Residence */}
      <div className="bg-white rounded-xl border border-orange-200 p-4 space-y-4">
        <SectionHeader icon={Home} title="Proof of Residence" subtitle="Required for both the minor and the parent/guardian" />

        <DocUploadField
          label="Minor's Proof of Residence"
          description="A utility bill, bank statement, school enrollment letter, or government mail dated within the last 90 days showing the minor's current residential address."
          fieldKey="child_proof_of_residence_url"
          value={data?.child_proof_of_residence_url}
          onUploaded={handleDoc}
        />

        <DocUploadField
          label="Parent/Guardian's Proof of Residence"
          description="A utility bill, bank statement, lease agreement, or government mail dated within the last 90 days showing the parent/guardian's current residential address."
          fieldKey="parent_proof_of_residence_url"
          value={data?.parent_proof_of_residence_url}
          onUploaded={handleDoc}
        />
      </div>

      {/* Parental Responsibility & Hours Policy */}
      <div className="bg-white rounded-xl border border-orange-200 p-4 space-y-3">
        <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          Parental / Guardian Responsibilities & Work Limits
        </h4>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="text-orange-500 font-bold shrink-0">•</span>
            The parent or guardian is responsible for <strong>personally overseeing all work activities</strong> while the minor is on the job.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 font-bold shrink-0">•</span>
            The parent or guardian must make all <strong>safety decisions</strong> and any other important decisions that arise during the engagement.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 font-bold shrink-0">•</span>
            Minor contractors are <strong>limited to 20 hours of work per week</strong>. Once this limit is reached, the account will be locked automatically.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 font-bold shrink-0">•</span>
            The account will remain locked for <strong>one full week after the last completed job</strong> before it is automatically unlocked.
          </li>
        </ul>
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
          <input
            type="checkbox"
            id="minor_policy_confirm"
            required
            className="mt-0.5 w-4 h-4 accent-orange-600"
          />
          <label htmlFor="minor_policy_confirm" className="text-sm text-orange-900 cursor-pointer leading-relaxed">
            I, the parent/guardian, confirm that I understand and accept responsibility for overseeing the minor's work, ensuring their safety, making necessary decisions on their behalf, and acknowledge the 20-hour weekly work limit.
          </label>
        </div>
      </div>

      {allDocsUploaded ? (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          All 7 required items submitted. Your application will be reviewed by our admin team.
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-orange-100 border border-orange-300 rounded-lg text-sm text-orange-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {7 - completedCount} item(s) still required before you can submit.
        </div>
      )}
    </div>
  );
}