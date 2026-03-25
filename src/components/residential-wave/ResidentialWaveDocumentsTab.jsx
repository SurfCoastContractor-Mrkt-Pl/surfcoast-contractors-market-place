import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import DocumentUploadZone from './DocumentUploadZone';

const DOCUMENT_TYPES = {
  cslb_contractor_license: 'CSLB Contractor License',
  his_license: 'H.I.S. License',
  bond: 'Bond Document',
  insurance: 'Insurance Certificate',
  other: 'Other Document'
};

export default function ResidentialWaveDocumentsTab({ userEmail }) {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedType, setSelectedType] = useState('cslb_contractor_license');
  const [documentName, setDocumentName] = useState('');
  const queryClient = useQueryClient();

  const { data: documents } = useQuery({
    queryKey: ['residentialWaveDocuments', userEmail],
    queryFn: () => base44.entities.ResidentialWaveDocument.filter({ contractor_email: userEmail }),
    enabled: !!userEmail,
  });

  const createDocumentMutation = useMutation({
    mutationFn: (docData) => base44.entities.ResidentialWaveDocument.create({
      ...docData,
      contractor_email: userEmail,
      contractor_id: userEmail,
      upload_date: new Date().toISOString().split('T')[0],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentialWaveDocuments', userEmail] });
      setShowUploadForm(false);
      setDocumentName('');
      setSelectedType('cslb_contractor_license');
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (id) => base44.entities.ResidentialWaveDocument.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentialWaveDocuments', userEmail] });
    },
  });

  const handleUploadComplete = (uploadData) => {
    createDocumentMutation.mutate({
      document_type: uploadData.document_type,
      document_name: documentName || uploadData.file_name,
      file_url: uploadData.file_url,
      file_size: uploadData.file_size,
    });
  };

  const groupedDocuments = documents?.reduce((acc, doc) => {
    if (!acc[doc.document_type]) {
      acc[doc.document_type] = [];
    }
    acc[doc.document_type].push(doc);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Documents & Credentials</h2>
        <Button onClick={() => setShowUploadForm(!showUploadForm)}>
          Upload Document
        </Button>
      </div>

      {showUploadForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900">Document Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900">Document Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g., CSLB License 2024"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <DocumentUploadZone
              selectedType={selectedType}
              onUploadComplete={handleUploadComplete}
            />

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowUploadForm(false)}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {Object.keys(groupedDocuments).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([docType, docs]) => (
            <div key={docType}>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                {DOCUMENT_TYPES[docType]}
                <span className="text-sm font-normal text-slate-600">({docs.length})</span>
              </h3>
              <div className="grid gap-4">
                {docs.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded">
                              <FileDocIcon />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{doc.document_name || 'Unnamed Document'}</p>
                              <p className="text-sm text-slate-600">
                                Uploaded {doc.upload_date} • {(doc.file_size / 1024 / 1024).toFixed(2)}MB
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.expiration_date && (
                            <div className="flex items-center gap-1">
                              {new Date(doc.expiration_date) < new Date() ? (
                                <AlertCircle className="w-5 h-5 text-red-600" />
                              ) : (
                                <Clock className="w-5 h-5 text-yellow-600" />
                              )}
                              <span className="text-xs text-slate-600">{doc.expiration_date}</span>
                            </div>
                          )}
                          {doc.is_verified && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-5 h-5" />
                              <span className="text-xs">Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.file_url, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteDocumentMutation.mutate(doc.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-50">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-600 mb-4">No documents uploaded yet.</p>
            <p className="text-sm text-slate-500">Store your CSLB licenses, H.I.S. licenses, and bond documents securely here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FileDocIcon() {
  return (
    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}