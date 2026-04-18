import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { getVerifyLicenseUrl } from '@/lib/env';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Upload, CheckCircle2, Loader2, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC'
];

function LicenseStatusBadge({ status }) {
  if (status === 'active') return <Badge className="bg-green-100 text-green-700 text-xs">✓ Verified</Badge>;
  if (status === 'pending_review') return <Badge className="bg-yellow-100 text-yellow-700 text-xs">⏳ Pending Review</Badge>;
  if (status === 'inactive' || status === 'expired') return <Badge className="bg-orange-100 text-orange-700 text-xs">⚠ Inactive</Badge>;
  return <Badge className="bg-slate-100 text-slate-500 text-xs">○ Not Verified</Badge>;
}

function FileUploadField({ label, currentUrl, fieldKey, onUpload, uploading }) {
  return (
    <div>
      <Label className="text-xs font-medium text-slate-700 mb-1 block">{label}</Label>
      <div className="flex items-center gap-2">
        {currentUrl && (
          <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline truncate max-w-[140px]">
            View uploaded file
          </a>
        )}
        <label className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors text-xs text-slate-600">
          {uploading === fieldKey ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          {currentUrl ? 'Replace' : 'Upload'}
          <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => onUpload(e, fieldKey)} />
        </label>
      </div>
    </div>
  );
}

function CollapsibleSection({ title, children, hasData, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-800">{title}</span>
          <span className="text-xs text-slate-400 italic">optional</span>
          {hasData && <Badge className="bg-green-100 text-green-700 text-xs py-0">✓ Added</Badge>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="p-4 space-y-3 bg-white">{children}</div>}
    </div>
  );
}

export default function LicensedProfessionalDocuments({ contractor }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [fields, setFields] = useState({
    license_state: contractor?.license_state || '',
    license_number: contractor?.license_number || '',
    license_company_name: contractor?.license_company_name || '',
    license_card_url: contractor?.license_card_url || '',
    license_certificate_url: contractor?.license_certificate_url || '',
    business_license_url: contractor?.business_license_url || '',
    his_license_state: contractor?.his_license_state || '',
    his_license_number: contractor?.his_license_number || '',
    his_license_status: contractor?.his_license_status || '',
    his_license_url: contractor?.his_license_url || '',
    bond_company: contractor?.bond_company || '',
    bond_amount: contractor?.bond_amount || '',
    bond_expiry: contractor?.bond_expiry || '',
    bond_document_url: contractor?.bond_document_url || '',
    insurance_company: contractor?.insurance_company || '',
    insurance_policy_number: contractor?.insurance_policy_number || '',
    insurance_coverage_amount: contractor?.insurance_coverage_amount || '',
    insurance_expiry: contractor?.insurance_expiry || '',
    insurance_document_url: contractor?.insurance_document_url || '',
  });
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [homeContracts, setHomeContracts] = useState(contractor?.home_improvement_contracts || []);
  const [addingContract, setAddingContract] = useState(false);
  const [newContract, setNewContract] = useState({ trade: '', state: '', contract_name: '', document_url: '' });
  const [certifications, setCertifications] = useState(contractor?.additional_certifications || []);
  const [addingCert, setAddingCert] = useState(false);
  const [newCert, setNewCert] = useState({ name: '', issuer: '', expiry: '', document_url: '' });

  // Show for all contractors — license/insurance/bond are optional for non-licensed sole proprietors

  const save = async (extra = {}) => {
    setSaving(true);
    await base44.entities.Contractor.update(contractor.id, { ...fields, ...extra });
    queryClient.invalidateQueries({ queryKey: ['my-contractor'] });
    setSaving(false);
    toast({ title: '✓ Saved', description: 'Your information has been saved successfully.' });
  };

  const handleFileUpload = async (e, fieldKey) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(fieldKey);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const updated = { ...fields, [fieldKey]: file_url };
    setFields(updated);
    await base44.entities.Contractor.update(contractor.id, { [fieldKey]: file_url });
    queryClient.invalidateQueries({ queryKey: ['my-contractor'] });
    setUploading(null);
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch(getVerifyLicenseUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractor_id: contractor.id,
          license_number: fields.license_number,
          license_state: fields.license_state,
          contractor_name: contractor.name,
          license_company_name: fields.license_company_name,
        }),
      });
      const data = await res.json();
      setVerifyResult(data);
    } catch (err) {
      setVerifyResult({ error: true, message: 'Verification request failed. Please try again.' });
    }
    setVerifying(false);
  };

  const handleAddContract = async () => {
    const updated = [...homeContracts, { ...newContract, uploaded_at: new Date().toISOString() }];
    setHomeContracts(updated);
    await base44.entities.Contractor.update(contractor.id, { home_improvement_contracts: updated });
    queryClient.invalidateQueries({ queryKey: ['my-contractor'] });
    setNewContract({ trade: '', state: '', contract_name: '', document_url: '' });
    setAddingContract(false);
  };

  const handleContractFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setNewContract(prev => ({ ...prev, document_url: file_url }));
  };

  const handleAddCert = async () => {
    const updated = [...certifications, { ...newCert, uploaded_at: new Date().toISOString() }];
    setCertifications(updated);
    await base44.entities.Contractor.update(contractor.id, { additional_certifications: updated });
    queryClient.invalidateQueries({ queryKey: ['my-contractor'] });
    setNewCert({ name: '', issuer: '', expiry: '', document_url: '' });
    setAddingCert(false);
  };

  const handleCertFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setNewCert(prev => ({ ...prev, document_url: file_url }));
  };

  const f = (key) => ({ value: fields[key] || '', onChange: (e) => setFields(prev => ({ ...prev, [key]: e.target.value })) });

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Licensed Professional Documents</h2>
          <LicenseStatusBadge status={contractor?.license_status} />
        </div>
      </div>

      <div className="space-y-5">

        {/* ── REQUIRED: Contractor License ── */}
        <div className="rounded-xl border-2 border-slate-200 p-4 space-y-4" style={{ borderColor: '#d4a843' }}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">Contractor License</span>
            <Badge className="bg-red-100 text-red-600 text-xs py-0">Required</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-slate-700 mb-1 block">License State *</Label>
              <Select value={fields.license_state} onValueChange={(v) => setFields(prev => ({ ...prev, license_state: v }))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-700 mb-1 block">License Number *</Label>
              <Input {...f('license_number')} placeholder="e.g. C-12345" className="h-9 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-medium text-slate-700 mb-1 block">Company / DBA Name <span className="text-slate-400">(optional)</span></Label>
              <Input {...f('license_company_name')} placeholder="e.g. Smith Electrical LLC" className="h-9 text-sm" />
            </div>
          </div>

          {/* Verify button */}
          <div>
            <Button
              size="sm"
              onClick={handleVerify}
              disabled={verifying || !fields.license_number || !fields.license_state}
              className="text-white text-xs"
              style={{ backgroundColor: '#1E5A96' }}
            >
              {verifying ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Verifying…</> : '🔍 Verify License'}
            </Button>

            {verifyResult && (
              <div className={`mt-2 rounded-lg p-3 text-xs space-y-1 ${verifyResult.error ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-700'}`}>
                <p className="font-medium">{verifyResult.message || verifyResult.error}</p>
                {verifyResult.is_inactive && (
                  <div className="flex items-center gap-1.5 mt-1 text-orange-700 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Your profile will display an Inactive License badge.
                  </div>
                )}
                {verifyResult.documents_required?.length > 0 && (
                  <div className="mt-1">
                    <p className="font-semibold text-slate-800 mb-1">Documents required:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {verifyResult.documents_required.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* File uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100">
            <FileUploadField label="License Card (front + back)" currentUrl={fields.license_card_url} fieldKey="license_card_url" onUpload={handleFileUpload} uploading={uploading} />
            <FileUploadField label="License Certificate or Diploma" currentUrl={fields.license_certificate_url} fieldKey="license_certificate_url" onUpload={handleFileUpload} uploading={uploading} />
            <FileUploadField label="State Business License" currentUrl={fields.business_license_url} fieldKey="business_license_url" onUpload={handleFileUpload} uploading={uploading} />
          </div>

          <div className="pt-3 border-t border-amber-100">
            <Button onClick={() => save()} disabled={saving} className="w-full text-white font-semibold h-10" style={{ backgroundColor: '#1E5A96' }}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : <><CheckCircle2 className="w-4 h-4 mr-2" />Save License Info</>}
            </Button>
          </div>
        </div>

        {/* ── OPTIONAL SECTIONS ── */}

        {/* HIS License */}
        <CollapsibleSection title="HIS License 🏠" hasData={!!contractor?.his_license_number}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-slate-700 mb-1 block">HIS License State</Label>
              <Select value={fields.his_license_state} onValueChange={(v) => setFields(prev => ({ ...prev, his_license_state: v }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent className="max-h-60">{US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-700 mb-1 block">HIS License Number</Label>
              <Input {...f('his_license_number')} placeholder="HIS license #" className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-700 mb-1 block">HIS License Status</Label>
              <Select value={fields.his_license_status} onValueChange={(v) => setFields(prev => ({ ...prev, his_license_status: v }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <FileUploadField label="HIS License Document" currentUrl={fields.his_license_url} fieldKey="his_license_url" onUpload={handleFileUpload} uploading={uploading} />
          </div>
          <div className="pt-2 border-t border-slate-100">
            <Button onClick={() => save()} disabled={saving} className="w-full text-white font-semibold h-10" style={{ backgroundColor: '#1E5A96' }}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : <><CheckCircle2 className="w-4 h-4 mr-2" />Save HIS License</>}
            </Button>
          </div>
        </CollapsibleSection>

        {/* Bond */}
        <CollapsibleSection title="Bond Information 🔒" hasData={!!contractor?.bond_company}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label className="text-xs font-medium text-slate-700 mb-1 block">Bond Company</Label><Input {...f('bond_company')} placeholder="Company name" className="h-9 text-sm" /></div>
            <div><Label className="text-xs font-medium text-slate-700 mb-1 block">Bond Amount</Label><Input {...f('bond_amount')} placeholder="e.g. $50,000" className="h-9 text-sm" /></div>
            <div><Label className="text-xs font-medium text-slate-700 mb-1 block">Bond Expiry</Label><Input {...f('bond_expiry')} type="date" className="h-9 text-sm" /></div>
            <FileUploadField label="Bond Document" currentUrl={fields.bond_document_url} fieldKey="bond_document_url" onUpload={handleFileUpload} uploading={uploading} />
          </div>
          <div className="pt-2 border-t border-slate-100">
            <Button onClick={() => save()} disabled={saving} className="w-full text-white font-semibold h-10" style={{ backgroundColor: '#1E5A96' }}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : <><CheckCircle2 className="w-4 h-4 mr-2" />Save Bond Info</>}
            </Button>
          </div>
        </CollapsibleSection>

        {/* Insurance */}
        <CollapsibleSection title="Business Insurance 🛡️" hasData={!!contractor?.insurance_company}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label className="text-xs font-medium text-slate-700 mb-1 block">Insurance Company</Label><Input {...f('insurance_company')} placeholder="Company name" className="h-9 text-sm" /></div>
            <div><Label className="text-xs font-medium text-slate-700 mb-1 block">Policy Number</Label><Input {...f('insurance_policy_number')} placeholder="Policy #" className="h-9 text-sm" /></div>
            <div><Label className="text-xs font-medium text-slate-700 mb-1 block">Coverage Amount</Label><Input {...f('insurance_coverage_amount')} placeholder="e.g. $1,000,000" className="h-9 text-sm" /></div>
            <div><Label className="text-xs font-medium text-slate-700 mb-1 block">Expiry Date</Label><Input {...f('insurance_expiry')} type="date" className="h-9 text-sm" /></div>
            <FileUploadField label="Insurance Document" currentUrl={fields.insurance_document_url} fieldKey="insurance_document_url" onUpload={handleFileUpload} uploading={uploading} />
          </div>
          <div className="pt-2 border-t border-slate-100">
            <Button onClick={() => save()} disabled={saving} className="w-full text-white font-semibold h-10" style={{ backgroundColor: '#1E5A96' }}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : <><CheckCircle2 className="w-4 h-4 mr-2" />Save Insurance Info</>}
            </Button>
          </div>
        </CollapsibleSection>

        {/* Home Improvement Contracts */}
        <CollapsibleSection title="Home Improvement Contracts 📄" hasData={homeContracts.length > 0}>
          {homeContracts.length > 0 && (
            <div className="space-y-2 mb-3">
              {homeContracts.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs">
                  <span className="text-slate-700">{c.contract_name || 'Contract'} — {c.trade}, {c.state}</span>
                  <div className="flex items-center gap-2">
                    {c.document_url && <a href={c.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>}
                    <button onClick={async () => { const updated = homeContracts.filter((_, j) => j !== i); setHomeContracts(updated); await base44.entities.Contractor.update(contractor.id, { home_improvement_contracts: updated }); queryClient.invalidateQueries({ queryKey: ['my-contractor'] }); }}>
                      <X className="w-3.5 h-3.5 text-red-400 hover:text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {addingContract ? (
            <div className="space-y-2 p-3 border border-dashed border-slate-300 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs mb-1 block">Trade</Label><Input value={newContract.trade} onChange={e => setNewContract(p => ({ ...p, trade: e.target.value }))} placeholder="e.g. Electrical" className="h-8 text-xs" /></div>
                <div>
                  <Label className="text-xs mb-1 block">State</Label>
                  <Select value={newContract.state} onValueChange={(v) => setNewContract(p => ({ ...p, state: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="State" /></SelectTrigger>
                    <SelectContent className="max-h-52">{US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-2"><Label className="text-xs mb-1 block">Contract Name</Label><Input value={newContract.contract_name} onChange={e => setNewContract(p => ({ ...p, contract_name: e.target.value }))} placeholder="e.g. Residential Remodel Contract" className="h-8 text-xs" /></div>
              </div>
              <label className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-amber-400 text-xs text-slate-600 w-fit">
                <Upload className="w-3 h-3" />{newContract.document_url ? 'File uploaded ✓' : 'Upload Contract File'}
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleContractFileUpload} />
              </label>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddContract} disabled={!newContract.trade || !newContract.state} className="text-white text-xs h-7" style={{ backgroundColor: '#1E5A96' }}>Add</Button>
                <Button size="sm" variant="outline" onClick={() => setAddingContract(false)} className="text-xs h-7">Cancel</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setAddingContract(true)} className="text-xs gap-1">+ Add Contract</Button>
          )}
        </CollapsibleSection>

        {/* Additional Certifications */}
        <CollapsibleSection title="Additional Certifications 🏆" hasData={certifications.length > 0}>
          {certifications.length > 0 && (
            <div className="space-y-2 mb-3">
              {certifications.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs">
                  <span className="text-slate-700">{c.name}{c.issuer ? ` — ${c.issuer}` : ''}{c.expiry ? ` (exp. ${c.expiry})` : ''}</span>
                  <div className="flex items-center gap-2">
                    {c.document_url && <a href={c.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>}
                    <button onClick={async () => { const updated = certifications.filter((_, j) => j !== i); setCertifications(updated); await base44.entities.Contractor.update(contractor.id, { additional_certifications: updated }); queryClient.invalidateQueries({ queryKey: ['my-contractor'] }); }}>
                      <X className="w-3.5 h-3.5 text-red-400 hover:text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {addingCert ? (
            <div className="space-y-2 p-3 border border-dashed border-slate-300 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs mb-1 block">Certification Name</Label><Input value={newCert.name} onChange={e => setNewCert(p => ({ ...p, name: e.target.value }))} placeholder="e.g. OSHA 30" className="h-8 text-xs" /></div>
                <div><Label className="text-xs mb-1 block">Issuing Organization</Label><Input value={newCert.issuer} onChange={e => setNewCert(p => ({ ...p, issuer: e.target.value }))} placeholder="e.g. OSHA" className="h-8 text-xs" /></div>
                <div><Label className="text-xs mb-1 block">Expiry Date</Label><Input value={newCert.expiry} onChange={e => setNewCert(p => ({ ...p, expiry: e.target.value }))} type="date" className="h-8 text-xs" /></div>
              </div>
              <label className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-amber-400 text-xs text-slate-600 w-fit">
                <Upload className="w-3 h-3" />{newCert.document_url ? 'File uploaded ✓' : 'Upload Certificate'}
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleCertFileUpload} />
              </label>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddCert} disabled={!newCert.name} className="text-white text-xs h-7" style={{ backgroundColor: '#1E5A96' }}>Add</Button>
                <Button size="sm" variant="outline" onClick={() => setAddingCert(false)} className="text-xs h-7">Cancel</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setAddingCert(true)} className="text-xs gap-1">+ Add Certification</Button>
          )}
        </CollapsibleSection>

      </div>
    </Card>
  );
}