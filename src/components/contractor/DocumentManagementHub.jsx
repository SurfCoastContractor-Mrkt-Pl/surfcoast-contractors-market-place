import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { AlertCircle, FileText, Eye, EyeOff, Upload, CheckCircle2, Clock, AlertTriangle, ExternalLink, Shield, Lock, Pencil, Check, X } from 'lucide-react';

// Documents sourced directly from Contractor entity fields
const DOCUMENT_SECTIONS = [
  {
    id: 'license',
    label: 'Contractor License',
    icon: '📜',
    fields: [
      { key: 'license_card_url', label: 'License Card', expiryKey: null },
      { key: 'license_certificate_url', label: 'License Certificate', expiryKey: null },
      { key: 'business_license_url', label: 'Business License', expiryKey: null },
    ],
    visibilityKey: null,
    metaFields: [
      { key: 'license_number', label: 'License #' },
      { key: 'license_state', label: 'State' },
      { key: 'license_status', label: 'Status' },
    ],
  },
  {
    id: 'his_license',
    label: 'HIS License',
    icon: '🏠',
    fields: [
      { key: 'his_license_url', label: 'HIS License Document', expiryKey: null },
    ],
    visibilityKey: 'his_license',
    metaFields: [
      { key: 'his_license_number', label: 'HIS License #' },
      { key: 'his_license_state', label: 'State' },
      { key: 'his_license_status', label: 'Status' },
    ],
  },
  {
    id: 'insurance',
    label: 'Insurance',
    icon: '🛡️',
    fields: [
      { key: 'insurance_document_url', label: 'Insurance Certificate', expiryKey: 'insurance_expiry' },
    ],
    visibilityKey: 'insurance',
    metaFields: [
      { key: 'insurance_company', label: 'Company' },
      { key: 'insurance_policy_number', label: 'Policy #' },
      { key: 'insurance_coverage_amount', label: 'Coverage' },
      { key: 'insurance_expiry', label: 'Expiry', isDate: true },
    ],
  },
  {
    id: 'bond',
    label: 'Bond',
    icon: '🔒',
    fields: [
      { key: 'bond_document_url', label: 'Bond Document', expiryKey: 'bond_expiry' },
    ],
    visibilityKey: 'bond',
    metaFields: [
      { key: 'bond_company', label: 'Company' },
      { key: 'bond_amount', label: 'Amount' },
      { key: 'bond_expiry', label: 'Expiry', isDate: true },
    ],
  },
  {
    id: 'certifications',
    label: 'Certifications',
    icon: '🎓',
    fields: [],
    visibilityKey: 'certifications',
    isArray: true,
    arrayKey: 'additional_certifications',
  },
  {
    id: 'contracts',
    label: 'Home Improvement Contracts',
    icon: '📋',
    fields: [],
    visibilityKey: 'contracts',
    isArray: true,
    arrayKey: 'home_improvement_contracts',
  },
];

function ExpiryBadge({ dateStr }) {
  if (!dateStr) return null;
  const expiry = new Date(dateStr);
  const today = new Date();
  const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return <Badge className="bg-red-100 text-red-700 text-xs gap-1"><AlertCircle className="w-3 h-3" />Expired</Badge>;
  if (daysLeft <= 30) return <Badge className="bg-amber-100 text-amber-700 text-xs gap-1"><AlertTriangle className="w-3 h-3" />Expires in {daysLeft}d</Badge>;
  if (daysLeft <= 90) return <Badge className="bg-yellow-100 text-yellow-700 text-xs">Expires {expiry.toLocaleDateString()}</Badge>;
  return <Badge className="bg-green-100 text-green-700 text-xs gap-1"><CheckCircle2 className="w-3 h-3" />Valid until {expiry.toLocaleDateString()}</Badge>;
}

function DocumentUploadField({ label, fieldKey, currentUrl, expiryKey, expiryValue, contractor, onUpdate }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await onUpdate({ [fieldKey]: file_url });
    setUploading(false);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-700">{label}</div>
          {expiryKey && expiryValue && <ExpiryBadge dateStr={expiryValue} />}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        {currentUrl ? (
          <>
            <a href={currentUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
              <ExternalLink className="w-3.5 h-3.5" />View
            </a>
            <label className="cursor-pointer text-xs text-slate-500 hover:text-slate-700 border border-slate-300 rounded px-2 py-1">
              {uploading ? 'Uploading...' : 'Replace'}
              <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
            <Badge className="bg-green-100 text-green-700 text-xs">Uploaded</Badge>
          </>
        ) : (
          <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            {uploading ? 'Uploading...' : 'Upload'}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>
    </div>
  );
}

function MetaFieldsEditor({ metaFields, contractor, onUpdate, saving }) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState({});

  const handleEdit = () => {
    const initial = {};
    metaFields.forEach(mf => { initial[mf.key] = contractor?.[mf.key] || ''; });
    setValues(initial);
    setEditing(true);
  };

  const handleSave = () => {
    onUpdate(values);
    setEditing(false);
  };

  const handleCancel = () => setEditing(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Document Details</span>
        {!editing ? (
          <Button variant="ghost" size="sm" onClick={handleEdit} className="gap-1.5 h-7 text-xs text-slate-600">
            <Pencil className="w-3 h-3" /> Edit
          </Button>
        ) : (
          <div className="flex gap-1.5">
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1 h-7 text-xs bg-green-600 hover:bg-green-700 text-white">
              <Check className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel} className="gap-1 h-7 text-xs text-slate-500">
              <X className="w-3 h-3" /> Cancel
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metaFields.map(mf => (
          <div key={mf.key} className="p-2 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs text-slate-500 mb-1">{mf.label}</div>
            {editing ? (
              <Input
                type={mf.isDate ? 'date' : 'text'}
                value={values[mf.key] || ''}
                onChange={(e) => setValues(v => ({ ...v, [mf.key]: e.target.value }))}
                className="h-7 text-sm px-2"
                placeholder={`Enter ${mf.label.toLowerCase()}`}
              />
            ) : (
              <div className="text-sm font-medium text-slate-800">
                {contractor?.[mf.key] ? (
                  mf.isDate ? <ExpiryBadge dateStr={contractor[mf.key]} /> : contractor[mf.key]
                ) : (
                  <span className="text-slate-400 text-xs italic">Not set — click Edit</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DocumentManagementHub({ contractorId, contractorEmail }) {
  const [activeSection, setActiveSection] = useState('license');
  const queryClient = useQueryClient();

  const { data: contractors } = useQuery({
    queryKey: ['doc-hub-contractor', contractorId],
    queryFn: () => base44.entities.Contractor.filter({ id: contractorId }),
    enabled: !!contractorId,
  });

  const contractor = contractors?.[0];

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Contractor.update(contractorId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['doc-hub-contractor', contractorId] }),
  });

  const toggleVisibility = (visKey, currentValue) => {
    const current = contractor?.document_visibility || {};
    updateMutation.mutate({
      document_visibility: { ...current, [visKey]: currentValue === 'public' ? 'private' : 'public' },
    });
  };

  const section = DOCUMENT_SECTIONS.find(s => s.id === activeSection);
  const visibility = contractor?.document_visibility || {};

  // Count expiry warnings
  const expiryWarnings = [];
  if (contractor?.insurance_expiry) {
    const d = Math.ceil((new Date(contractor.insurance_expiry) - new Date()) / 86400000);
    if (d <= 90) expiryWarnings.push({ label: 'Insurance', days: d });
  }
  if (contractor?.bond_expiry) {
    const d = Math.ceil((new Date(contractor.bond_expiry) - new Date()) / 86400000);
    if (d <= 90) expiryWarnings.push({ label: 'Bond', days: d });
  }

  return (
    <div className="space-y-4">
      {/* Expiry Alerts */}
      {expiryWarnings.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Document Expiry Alerts</p>
            {expiryWarnings.map(w => (
              <p key={w.label} className="text-xs text-amber-700 mt-0.5">
                {w.label}: {w.days < 0 ? 'EXPIRED — update immediately' : `expires in ${w.days} days`}
              </p>
            ))}
          </div>
        </div>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Document Management Hub</h2>
            <p className="text-xs text-slate-500 mt-0.5">Upload credentials and control what clients can see on your public profile.</p>
          </div>
          <Shield className="w-6 h-6 text-slate-400" />
        </div>

        {/* Section tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {DOCUMENT_SECTIONS.map(s => {
            // Count how many docs are uploaded in this section
            let count = 0;
            if (!s.isArray) {
              s.fields.forEach(f => { if (contractor?.[f.key]) count++; });
            } else {
              count = (contractor?.[s.arrayKey] || []).length;
            }
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                  activeSection === s.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                <span>{s.icon}</span>
                {s.label}
                {count > 0 && (
                  <span className={`text-xs rounded-full px-1.5 py-0.5 ${activeSection === s.id ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {section && (
          <div className="space-y-4">
            {/* Visibility Toggle */}
            {section.visibilityKey && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  {visibility[section.visibilityKey] === 'public' ? (
                    <Eye className="w-4 h-4 text-blue-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-500" />
                  )}
                  <span className="text-sm font-medium text-slate-700">
                    Visible to clients:{' '}
                    <span className={visibility[section.visibilityKey] === 'public' ? 'text-blue-700' : 'text-slate-500'}>
                      {visibility[section.visibilityKey] === 'public' ? 'Public' : 'Private'}
                    </span>
                  </span>
                </div>
                <Switch
                  checked={visibility[section.visibilityKey] === 'public'}
                  onCheckedChange={() => toggleVisibility(section.visibilityKey, visibility[section.visibilityKey])}
                />
              </div>
            )}

            {/* Meta info fields */}
            {section.metaFields && section.metaFields.length > 0 && (
              <MetaFieldsEditor
                metaFields={section.metaFields}
                contractor={contractor}
                onUpdate={(data) => updateMutation.mutate(data)}
                saving={updateMutation.isPending}
              />
            )}

            {/* Document upload fields */}
            {!section.isArray && (
              <div className="space-y-2">
                {section.fields.map(f => (
                  <DocumentUploadField
                    key={f.key}
                    label={f.label}
                    fieldKey={f.key}
                    currentUrl={contractor?.[f.key]}
                    expiryKey={f.expiryKey}
                    expiryValue={f.expiryKey ? contractor?.[f.expiryKey] : null}
                    contractor={contractor}
                    onUpdate={(data) => updateMutation.mutate(data)}
                  />
                ))}
              </div>
            )}

            {/* Array-based sections (certifications, contracts) */}
            {section.isArray && (
              <div className="space-y-2">
                {(contractor?.[section.arrayKey] || []).length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">
                    No {section.label.toLowerCase()} uploaded yet.
                  </p>
                ) : (
                  (contractor?.[section.arrayKey] || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-800 truncate">
                            {item.name || item.contract_name || `Document ${idx + 1}`}
                          </div>
                          {item.issuer && <div className="text-xs text-slate-500">{item.issuer}</div>}
                          {item.trade && <div className="text-xs text-slate-500">{item.trade} — {item.state}</div>}
                          {item.expiry && <ExpiryBadge dateStr={item.expiry} />}
                        </div>
                      </div>
                      {item.document_url || item.file_url ? (
                        <a href={item.document_url || item.file_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline shrink-0">
                          <ExternalLink className="w-3.5 h-3.5" />View
                        </a>
                      ) : null}
                    </div>
                  ))
                )}
                <p className="text-xs text-slate-400 text-center mt-2">
                  Manage {section.label.toLowerCase()} from the License & Credentials section in your Profile tab.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-6 flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500">
            Documents marked <strong>Private</strong> are only visible to you and platform admins. Toggle <strong>Public</strong> to allow verified clients to view them on your profile.
          </p>
        </div>
      </Card>
    </div>
  );
}