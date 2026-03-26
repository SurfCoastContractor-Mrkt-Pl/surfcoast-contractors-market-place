import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { logError } from '@/lib/errorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, X, FileCheck, AlertTriangle, GraduationCap, Award, Briefcase } from 'lucide-react';

const CREDENTIAL_TYPES = [
  { value: 'certificate', label: 'Certificate', icon: Award },
  { value: 'degree', label: 'Academic Degree', icon: GraduationCap },
  { value: 'diploma', label: 'Diploma', icon: GraduationCap },
  { value: 'contractor_license', label: "Contractor's License (Sole Proprietor)", icon: Briefcase },
  { value: 'trade_license', label: 'Trade License', icon: FileCheck },
  { value: 'other', label: 'Other Credential', icon: Award },
];

const DEGREE_TYPES = ['degree', 'diploma'];
const LICENSE_TYPES = ['contractor_license'];

export default function CredentialDocumentsUpload({ credentials, onChange, legalName }) {
  const [uploading, setUploading] = useState(false);
  const [newCred, setNewCred] = useState({ type: '', label: '', legal_name_on_document: '', sole_proprietor_confirmed: false, file_url: '' });
  const [fileSelected, setFileSelected] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const isDegree = DEGREE_TYPES.includes(newCred.type);
  const isLicense = LICENSE_TYPES.includes(newCred.type);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) setFileSelected(file);
  };

  const handleAdd = async () => {
    if (!newCred.type || !newCred.label || !fileSelected) return;
    if (isDegree && !newCred.legal_name_on_document) return;
    if (isLicense && !newCred.sole_proprietor_confirmed) return;

    setUploading(true);
    setUploadError(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: fileSelected });
      const entry = {
        type: newCred.type,
        label: newCred.label,
        legal_name_on_document: isDegree ? newCred.legal_name_on_document : '',
        sole_proprietor_confirmed: isLicense ? newCred.sole_proprietor_confirmed : false,
        file_url,
      };
      onChange([...(credentials || []), entry]);
      setNewCred({ type: '', label: '', legal_name_on_document: '', sole_proprietor_confirmed: false, file_url: '' });
      setFileSelected(null);
      setAddingNew(false);
    } catch (error) {
      setUploadError('Failed to upload credential document. Please try again.');
      logError('CredentialDocumentsUpload.handleAdd', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (idx) => {
    onChange((credentials || []).filter((_, i) => i !== idx));
  };

  const canAdd = newCred.type && newCred.label && fileSelected &&
    (!isDegree || newCred.legal_name_on_document) &&
    (!isLicense || newCred.sole_proprietor_confirmed);

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {uploadError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{uploadError}</p>
            <button
              onClick={() => setUploadError(null)}
              className="text-xs text-red-600 hover:text-red-700 mt-1 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Existing credentials */}
      {(credentials || []).length > 0 && (
        <div className="space-y-2">
          {credentials.map((cred, idx) => {
            const typeInfo = CREDENTIAL_TYPES.find(t => t.value === cred.type);
            const Icon = typeInfo?.icon || Award;
            return (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-green-700" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800">{cred.label}</div>
                    <div className="text-xs text-slate-500">{typeInfo?.label}</div>
                    {cred.legal_name_on_document && (
                      <div className="text-xs text-blue-600">Name on doc: {cred.legal_name_on_document}</div>
                    )}
                    {cred.sole_proprietor_confirmed && (
                      <div className="text-xs text-green-600">✓ Sole proprietor confirmed</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={cred.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View</a>
                  <button type="button" onClick={() => handleRemove(idx)} className="text-slate-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add new credential form */}
      {addingNew ? (
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 space-y-4 bg-slate-50">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold">Document Type *</Label>
              <Select value={newCred.type} onValueChange={(v) => setNewCred(p => ({ ...p, type: v, legal_name_on_document: '', sole_proprietor_confirmed: false }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {CREDENTIAL_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Description / Title *</Label>
              <Input
                value={newCred.label}
                onChange={(e) => setNewCred(p => ({ ...p, label: e.target.value }))}
                placeholder="e.g., Bachelor of Civil Engineering"
                className="mt-1"
              />
            </div>
          </div>

          {/* Degree/Diploma: must match legal name on ID */}
          {isDegree && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  <strong>Legal Name Requirement:</strong> The name on your degree or diploma must exactly match the legal name on your government-issued ID / Driver's License on file.
                </p>
              </div>
              <div>
                <Label className="text-xs font-semibold">Legal Name as it Appears on Degree/Diploma *</Label>
                <Input
                  value={newCred.legal_name_on_document}
                  onChange={(e) => setNewCred(p => ({ ...p, legal_name_on_document: e.target.value }))}
                  placeholder={`Must match: ${legalName || 'your ID name'}`}
                  className="mt-1"
                />
                {legalName && newCred.legal_name_on_document && newCred.legal_name_on_document.toLowerCase().trim() !== legalName.toLowerCase().trim() && (
                  <p className="text-xs text-red-600 mt-1">⚠ Name does not match your registered legal name: "{legalName}"</p>
                )}
              </div>
            </div>
          )}

          {/* Contractor License: sole proprietor only */}
          {isLicense && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  <strong>Sole Proprietor Only:</strong> Contractor licenses may only be registered under an individual sole proprietor. Company, partnership, or crew licenses are not accepted.
                </p>
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newCred.sole_proprietor_confirmed}
                  onChange={(e) => setNewCred(p => ({ ...p, sole_proprietor_confirmed: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 accent-amber-600"
                />
                <span className="text-xs text-amber-800">I confirm this contractor's license is registered solely under my name as an individual sole proprietor.</span>
              </label>
            </div>
          )}

          {/* File Upload */}
          <div>
            <Label className="text-xs font-semibold">Upload Document (PDF, JPG, PNG) *</Label>
            <label className="flex items-center gap-3 mt-1 p-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
              <Upload className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="text-sm text-slate-600">
                {fileSelected ? fileSelected.name : 'Click to select file'}
              </span>
              <input type="file" accept="image/*,.pdf" onChange={handleFileSelect} className="hidden" />
            </label>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => { setAddingNew(false); setFileSelected(null); setNewCred({ type: '', label: '', legal_name_on_document: '', sole_proprietor_confirmed: false, file_url: '' }); }}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-slate-900"
              onClick={handleAdd}
              disabled={!canAdd || uploading}
            >
              {uploading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Uploading...</> : 'Add Credential'}
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => setAddingNew(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Add Credential Document
        </Button>
      )}
    </div>
  );
}