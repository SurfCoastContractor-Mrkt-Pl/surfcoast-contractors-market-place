import React from 'react';
import { FileText, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ContractorVerificationCard({ contractor }) {
  const getBadgeColor = (verified) => {
    return verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusIcon = (verified) => {
    return verified ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <AlertCircle className="w-5 h-5 text-yellow-600" />
    );
  };

  return (
    <div className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{contractor.name}</h3>
          <p className="text-sm text-slate-600">{contractor.email}</p>
          {contractor.line_of_work && (
            <p className="text-xs text-slate-500 mt-1 capitalize">
              {contractor.line_of_work.replace(/_/g, ' ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <Badge className={getBadgeColor(contractor.identity_verified)}>
            {contractor.identity_verified ? 'Verified' : 'Pending'}
          </Badge>
        </div>
      </div>

      {/* Review Request Details */}
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
          Identity Verification
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
            <span className="text-slate-700">ID Document</span>
            {contractor.id_document_url ? (
              <a
                href={contractor.id_document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View
              </a>
            ) : (
              <span className="text-slate-400 text-xs">Not uploaded</span>
            )}
          </div>
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
            <span className="text-slate-700">Face Photo</span>
            {contractor.face_photo_url ? (
              <a
                href={contractor.face_photo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View
              </a>
            ) : (
              <span className="text-slate-400 text-xs">Not uploaded</span>
            )}
          </div>
        </div>
      </div>

      {/* License Information (if applicable) */}
      {contractor.is_licensed_sole_proprietor && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            {getStatusIcon(contractor.license_verified)}
            License Verification
          </h4>
          <div className="space-y-2 text-sm">
            {contractor.license_number && (
              <div className="flex justify-between p-2 bg-slate-50 rounded">
                <span className="text-slate-700">License #:</span>
                <span className="font-mono text-slate-900">{contractor.license_number}</span>
              </div>
            )}
            {contractor.license_company_name && (
              <div className="flex justify-between p-2 bg-slate-50 rounded">
                <span className="text-slate-700">Company:</span>
                <span className="text-slate-900">{contractor.license_company_name}</span>
              </div>
            )}
            {contractor.license_state && (
              <div className="flex justify-between p-2 bg-slate-50 rounded">
                <span className="text-slate-700">State:</span>
                <span className="text-slate-900">{contractor.license_state}</span>
              </div>
            )}
            {contractor.license_status && (
              <div className="flex justify-between p-2 bg-slate-50 rounded">
                <span className="text-slate-700">Status:</span>
                <Badge className={contractor.license_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {contractor.license_status}
                </Badge>
              </div>
            )}
            {contractor.license_card_url && (
              <div className="flex justify-between p-2 bg-slate-50 rounded">
                <span className="text-slate-700">Card</span>
                <a href={contractor.license_card_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  View
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Credential Documents */}
      {contractor.credential_documents && contractor.credential_documents.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Credentials ({contractor.credential_documents.length})</h4>
          <div className="space-y-2 text-sm">
            {contractor.credential_documents.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div>
                  <p className="font-medium text-slate-900 capitalize">{doc.type.replace(/_/g, ' ')}</p>
                  {doc.label && <p className="text-xs text-slate-600">{doc.label}</p>}
                </div>
                {doc.file_url && (
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                    View
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insurance & Bond (if applicable) */}
      {(contractor.insurance_company || contractor.bond_company) && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Coverage Documents</h4>
          <div className="space-y-2 text-sm">
            {contractor.insurance_company && (
              <div className="flex justify-between p-2 bg-slate-50 rounded">
                <span className="text-slate-700">Insurance</span>
                {contractor.insurance_document_url ? (
                  <a href={contractor.insurance_document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View
                  </a>
                ) : (
                  <span className="text-slate-400 text-xs">Not uploaded</span>
                )}
              </div>
            )}
            {contractor.bond_company && (
              <div className="flex justify-between p-2 bg-slate-50 rounded">
                <span className="text-slate-700">Bond</span>
                {contractor.bond_document_url ? (
                  <a href={contractor.bond_document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View
                  </a>
                ) : (
                  <span className="text-slate-400 text-xs">Not uploaded</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}