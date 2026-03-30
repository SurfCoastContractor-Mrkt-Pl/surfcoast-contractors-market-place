import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Loader2, AlertCircle, CheckCircle2, Copy } from 'lucide-react';

const DOCUMENT_TYPES = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'contract', label: 'Contract' },
  { value: 'permit', label: 'Permit' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'estimate', label: 'Estimate' },
];

export default function DocumentExtractor({ onExtracted }) {
  const [documentType, setDocumentType] = useState('invoice');
  const [fileUrls, setFileUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setError(null);

    for (const file of files) {
      try {
        const response = await base44.integrations.Core.UploadFile({ file });
        setFileUrls(prev => [...prev, response.file_url]);
      } catch (err) {
        setError(`Failed to upload ${file.name}`);
      }
    }
  };

  const handleExtract = async () => {
    if (fileUrls.length === 0) {
      setError('Please upload at least one document');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('extractDocumentData', {
        file_urls: fileUrls,
        document_type: documentType,
      });
      setExtractedData(response.data.data);
      onExtracted?.(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to extract data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(extractedData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
      <h3 className="font-semibold text-slate-900">Document Data Extraction</h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-2 block">Document Type</span>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          >
            {DOCUMENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-2 block">Upload Documents</span>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="hidden"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="cursor-pointer">
              <span className="text-sm text-slate-600">Click to upload or drag files</span>
            </label>
          </div>
        </label>

        {fileUrls.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">{fileUrls.length} file(s) uploaded</p>
            <button
              onClick={handleExtract}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                'Extract Data'
              )}
            </button>
          </div>
        )}

        {extractedData && (
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="p-4 bg-green-50 rounded-lg flex gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 mb-1">Data Extracted Successfully</p>
                <p className="text-xs text-green-700">
                  Confidence: {extractedData.confidence ? `${(extractedData.confidence * 100).toFixed(0)}%` : 'N/A'}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-xs text-slate-700 whitespace-pre-wrap">
                {JSON.stringify(extractedData.extracted_fields, null, 2)}
              </pre>
            </div>

            <button
              onClick={handleCopy}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Data'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}