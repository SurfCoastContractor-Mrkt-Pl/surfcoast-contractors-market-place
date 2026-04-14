import React, { useState } from 'react';
import { FileText, CheckCircle, AlertCircle, Shield, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function ContractorVerificationCard({ contractor }) {
  const [verified, setVerified] = useState(contractor.identity_verified);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const toggleVerification = async () => {
    setLoading(true);
    try {
      await base44.entities.Contractor.update(contractor.id, { identity_verified: !verified });
      setVerified(!verified);
    } catch (e) {
      console.error('Verification update failed:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{contractor.name}</h3>
          <p className="text-sm text-slate-600">{contractor.email}</p>
          {contractor.trade_specialty && (
            <p className="text-xs text-slate-500 mt-1 capitalize">
              {contractor.trade_specialty.replace(/_/g, ' ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <Badge className={verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
            {verified ? 'Verified' : 'Pending'}
          </Badge>
        </div>
      </div>

      {/* Review Request */}
      {contractor.admin_review_requested && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm font-medium text-amber-900 mb-1">Review Requested</p>
          {contractor.admin_review_reason && (
            <p className="text-xs text-amber-800">{contractor.admin_review_reason}</p>
          )}
          {contractor.admin_review_submitted_at && (
            <p className="text-xs text-amber-700 mt-1">
              Submitted: {new Date(contractor.admin_review_submitted_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Identity Documents */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Identity Documents
        </h4>
        <div className="space-y-2 text-sm">
          <DocRow label="Government ID" url={contractor.id_document_url} onPreview={setPreviewUrl} />
          <DocRow label="Face Photo" url={contractor.face_photo_url} onPreview={setPreviewUrl} />
        </div>
      </div>

      {/* Credential Documents */}
      {contractor.credential_documents?.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Credentials ({contractor.credential_documents.length})</h4>
          <div className="space-y-2 text-sm">
            {contractor.credential_documents.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div>
                  <p className="font-medium text-slate-900 capitalize">{doc.type?.replace(/_/g, ' ')}</p>
                  {doc.label && <p className="text-xs text-slate-600">{doc.label}</p>}
                  {doc.legal_name_on_document && <p className="text-xs text-slate-500">{doc.legal_name_on_document}</p>}
                </div>
                {doc.file_url && (
                  <div className="flex gap-2">
                    <button onClick={() => setPreviewUrl(doc.file_url)} className="text-slate-500 hover:text-slate-800">
                      <Eye className="w-4 h-4" />
                    </button>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                      Open
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* License Info */}
      {contractor.is_licensed_sole_proprietor && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            {contractor.license_verified
              ? <CheckCircle className="w-4 h-4 text-green-600" />
              : <AlertCircle className="w-4 h-4 text-yellow-600" />}
            License Verification
          </h4>
          <div className="space-y-2 text-sm">
            {contractor.license_number && <InfoRow label="License #" value={contractor.license_number} />}
            {contractor.license_company_name && <InfoRow label="Company" value={contractor.license_company_name} />}
            {contractor.license_state && <InfoRow label="State" value={contractor.license_state} />}
            {contractor.license_card_url && <DocRow label="License Card" url={contractor.license_card_url} onPreview={setPreviewUrl} />}
          </div>
        </div>
      )}

      {/* Insurance / Bond */}
      {(contractor.insurance_company || contractor.bond_company) && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Coverage Documents</h4>
          <div className="space-y-2 text-sm">
            {contractor.insurance_document_url && <DocRow label="Insurance" url={contractor.insurance_document_url} onPreview={setPreviewUrl} />}
            {contractor.bond_document_url && <DocRow label="Bond" url={contractor.bond_document_url} onPreview={setPreviewUrl} />}
          </div>
        </div>
      )}

      {/* Verify Action */}
      <div className="pt-3 border-t border-slate-100">
        <Button
          onClick={toggleVerification}
          disabled={loading}
          size="sm"
          className={verified
            ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 w-full'
            : 'bg-green-600 hover:bg-green-700 text-white w-full'
          }
          variant="outline"
        >
          {loading ? 'Saving...' : verified ? 'Revoke Verification' : '✓ Mark as Verified'}
        </Button>
      </div>

      {/* Image Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-auto bg-white rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg z-10"
            >
              ×
            </button>
            <img src={previewUrl} alt="Document preview" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}

function DocRow({ label, url, onPreview }) {
  return (
    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
      <span className="text-slate-700">{label}</span>
      {url ? (
        <div className="flex items-center gap-2">
          <button onClick={() => onPreview(url)} className="text-slate-500 hover:text-slate-800" title="Preview">
            <Eye className="w-4 h-4" />
          </button>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
            Open
          </a>
        </div>
      ) : (
        <span className="text-slate-400 text-xs">Not uploaded</span>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between p-2 bg-slate-50 rounded">
      <span className="text-slate-700">{label}:</span>
      <span className="font-mono text-slate-900">{value}</span>
    </div>
  );
}