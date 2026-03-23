import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ServiceAgreementGenerator({ contractor }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', null
  const [docLink, setDocLink] = useState(null);
  const [error, setError] = useState('');

  const handleGenerateAgreement = async () => {
    setLoading(true);
    setStatus(null);
    setError('');

    try {
      const response = await base44.functions.invoke('generateContractorAgreement', {
        contractor_id: contractor.id,
      });

      if (response.data.success) {
        setDocLink(response.data.document_link);
        setStatus('success');
      } else {
        setError(response.data.error || 'Failed to generate agreement');
        setStatus('error');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate agreement');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Service Agreement</h3>
            <p className="text-sm text-slate-600 mt-1">
              Generate a customized service agreement with your contractor information pre-filled.
            </p>
          </div>
        </div>
      </div>

      {status === 'success' ? (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-green-900">Agreement generated successfully!</p>
            <p className="text-sm text-green-800 mt-1">
              A Google Docs link has been sent to your email. You can now open, edit, and sign it.
            </p>
            <a
              href={docLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Open Agreement
            </a>
          </div>
        </div>
      ) : status === 'error' ? (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-900">Failed to generate agreement</p>
            <p className="text-sm text-red-800 mt-1">{error}</p>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex gap-3">
          <Button
            onClick={handleGenerateAgreement}
            disabled={loading}
            className="gap-2"
            style={{ backgroundColor: '#1E5A96' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generate Agreement
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}