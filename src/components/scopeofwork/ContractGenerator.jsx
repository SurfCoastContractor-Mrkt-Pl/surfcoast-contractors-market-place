import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { FileText, Loader2, ExternalLink } from 'lucide-react';

export default function ContractGenerator({ scope, contractorName, clientName }) {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);

  const handleGenerateContract = async () => {
    setLoading(true);
    try {
      const result = await base44.functions.invoke('createContractFromTemplate', {
        scopeId: scope.id,
        contractorName,
        clientName,
        jobTitle: scope.job_title,
        amount: scope.cost_amount,
      });
      setGenerated(result);
    } catch (error) {
      console.error('Contract generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-gray-900">Service Agreement</h3>
      </div>

      {!generated ? (
        <>
          <p className="text-sm text-gray-600 mb-4">
            Generate a professional service agreement using Google Docs. Both parties can review and electronically sign.
          </p>
          <button
            onClick={handleGenerateContract}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition flex items-center justify-center gap-2"
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
          </button>
        </>
      ) : (
        <div className="p-4 bg-white rounded-lg border border-green-200 space-y-3">
          <p className="text-sm font-semibold text-green-700">✓ Contract generated successfully!</p>
          <a
            href={generated.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            Open in Google Docs
            <ExternalLink className="w-4 h-4" />
          </a>
          <p className="text-xs text-gray-500">
            Both parties can view, edit, and sign the document. Changes are saved automatically.
          </p>
        </div>
      )}
    </div>
  );
}