import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Upload, Loader2, X, FileCheck, AlertTriangle, GraduationCap, Award, Briefcase, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const CREDENTIAL_TYPES = [
  { value: 'certificate', label: 'Professional Certificate', icon: Award },
  { value: 'degree', label: 'Academic Degree', icon: GraduationCap },
  { value: 'diploma', label: 'High School Diploma', icon: GraduationCap },
  { value: 'contractor_license', label: "Contractor's License (Sole Proprietor)", icon: Briefcase },
  { value: 'trade_license', label: 'Trade License', icon: FileCheck },
  { value: 'other', label: 'Other Credential', icon: Award },
];

const DEGREE_TYPES = ['degree', 'diploma'];
const LICENSE_TYPES = ['contractor_license'];

export default function CredentialDocumentsManager({ credentials, onChange, legalName }) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [expandedSchool, setExpandedSchool] = useState(null);
  const [newCred, setNewCred] = useState({
    type: '',
    label: '',
    legal_name_on_document: '',
    sole_proprietor_confirmed: false,
    file_url: '',
    school_name: '',
    school_location: '',
    graduation_year: '',
  });
  const [fileSelected, setFileSelected] = useState(null);

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
    const { file_url } = await base44.integrations.Core.UploadFile({ file: fileSelected });
    
    const entry = {
      type: newCred.type,
      label: newCred.label,
      legal_name_on_document: isDegree ? newCred.legal_name_on_document : '',
      sole_proprietor_confirmed: isLicense ? newCred.sole_proprietor_confirmed : false,
      file_url,
      school_name: newCred.school_name || '',
      school_location: newCred.school_location || '',
      graduation_year: newCred.graduation_year || '',
    };
    
    onChange([...(credentials || []), entry]);
    resetForm();
    setUploading(false);
    toast({ title: '✓ Credential Added', description: `"${entry.label}" has been saved to your profile.` });
  };

  const resetForm = () => {
    setNewCred({ type: '', label: '', legal_name_on_document: '', sole_proprietor_confirmed: false, file_url: '', school_name: '', school_location: '', graduation_year: '' });
    setFileSelected(null);
    setAddingNew(false);
  };

  const handleRemove = (idx) => {
    onChange((credentials || []).filter((_, i) => i !== idx));
    toast({ title: 'Credential Removed', description: 'The credential has been removed from your profile.' });
  };

  const canAdd = newCred.type && newCred.label && fileSelected &&
    (!isDegree || newCred.legal_name_on_document) &&
    (!isLicense || newCred.sole_proprietor_confirmed);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Credentials & Certifications</h2>
      <p className="text-sm text-slate-600 mb-6">Add your licenses, certifications, degrees, and other professional credentials</p>

      <div className="space-y-4">
        {/* Existing credentials */}
        {(credentials || []).length > 0 && (
          <div className="space-y-2">
            {credentials.map((cred, idx) => {
              const typeInfo = CREDENTIAL_TYPES.find(t => t.value === cred.type);
              const Icon = typeInfo?.icon || Award;
              const isSchoolInfo = cred.school_name || cred.school_location || cred.graduation_year;
              const isExpanded = expandedSchool === idx;

              return (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:shadow-sm transition-shadow">
                  {/* Main credential row */}
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-green-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800 truncate">{cred.label}</div>
                        <div className="text-xs text-slate-500">{typeInfo?.label}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isSchoolInfo && (
                        <button
                          type="button"
                          onClick={() => setExpandedSchool(isExpanded ? null : idx)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                      <a href={cred.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline px-2 py-1">
                        View
                      </a>
                      <button type="button" onClick={() => handleRemove(idx)} className="p-1 text-slate-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* School info (expandable) */}
                  {isSchoolInfo && isExpanded && (
                    <div className="px-3 pb-3 pt-0 border-t border-slate-100 bg-slate-50 text-xs space-y-1">
                      {cred.school_name && <div><span className="text-slate-600">School:</span> {cred.school_name}</div>}
                      {cred.school_location && <div><span className="text-slate-600">Location:</span> {cred.school_location}</div>}
                      {cred.graduation_year && <div><span className="text-slate-600">Graduated:</span> {cred.graduation_year}</div>}
                    </div>
                  )}

                  {/* Verification info */}
                  <div className="px-3 text-xs text-slate-500 py-1.5 bg-slate-50 border-t border-slate-100">
                    {cred.legal_name_on_document && <div>Name on doc: <span className="text-blue-600 font-medium">{cred.legal_name_on_document}</span></div>}
                    {cred.sole_proprietor_confirmed && <div className="text-green-600">✓ Sole proprietor confirmed</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add new credential form */}
        {addingNew ? (
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 space-y-4 bg-slate-50">
            {/* Document Type & Description */}
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
                <Label className="text-xs font-semibold">Document Title / Description *</Label>
                <Input
                  value={newCred.label}
                  onChange={(e) => setNewCred(p => ({ ...p, label: e.target.value }))}
                  placeholder="e.g., Bachelor of Civil Engineering"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Degree: legal name requirement */}
            {isDegree && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    <strong>Legal Name Requirement:</strong> The name on your degree or diploma must exactly match the legal name on your government-issued ID.
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Legal Name as it Appears on Document *</Label>
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

            {/* License: sole proprietor confirmation */}
            {isLicense && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    <strong>Sole Proprietor Only:</strong> Contractor licenses may only be registered as an individual sole proprietor.
                  </p>
                </div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCred.sole_proprietor_confirmed}
                    onChange={(e) => setNewCred(p => ({ ...p, sole_proprietor_confirmed: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 accent-amber-600"
                  />
                  <span className="text-xs text-amber-800">I confirm this license is registered solely under my name as an individual.</span>
                </label>
              </div>
            )}

            {/* Optional school info */}
            <details className="border border-slate-200 rounded-lg">
              <summary className="px-3 py-2 cursor-pointer font-medium text-sm text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors">
                + Add School Information (Optional)
              </summary>
              <div className="p-3 space-y-3 border-t border-slate-200">
                <div>
                  <Label className="text-xs font-semibold">School / Institution Name</Label>
                  <Input
                    value={newCred.school_name}
                    onChange={(e) => setNewCred(p => ({ ...p, school_name: e.target.value }))}
                    placeholder="e.g., Stanford University"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">School Location</Label>
                  <Input
                    value={newCred.school_location}
                    onChange={(e) => setNewCred(p => ({ ...p, school_location: e.target.value }))}
                    placeholder="City, State"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Graduation Year</Label>
                  <Input
                    value={newCred.graduation_year}
                    onChange={(e) => setNewCred(p => ({ ...p, graduation_year: e.target.value }))}
                    placeholder="2020"
                    className="mt-1"
                  />
                </div>
              </div>
            </details>

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

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
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
            Add Credential
          </Button>
        )}
      </div>
    </Card>
  );
}