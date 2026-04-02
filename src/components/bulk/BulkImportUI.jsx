import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function BulkImportUI({ importType = 'jobs' }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const data = importType === 'csv' ? parseCSV(text) : JSON.parse(text);

      const result = await base44.functions.invoke(`bulkImport${importType.charAt(0).toUpperCase() + importType.slice(1)}`, {
        [importType]: data,
      });

      setResult(result);
    } catch (error) {
      setResult({ error: error.message, created: 0, failed: 1 });
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (text) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, i) => {
        obj[header.trim()] = values[i]?.trim();
        return obj;
      }, {});
    });
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-gray-900">Bulk Import {importType}</h3>
      </div>

      {!result ? (
        <div className="space-y-4">
          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <input
              type="file"
              accept=".json,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <p className="text-gray-600 font-medium">Click to select file</p>
              <p className="text-sm text-gray-500">or drag and drop JSON/CSV</p>
            </label>
            {file && <p className="text-sm text-green-600 mt-2">✓ {file.name} selected</p>}
          </div>

          <button
            onClick={handleImport}
            disabled={loading || !file}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : (
              'Start Import'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              {result.error ? 'Import Failed' : 'Import Complete'}
            </p>
            {result.error ? (
              <div className="flex items-start gap-2 text-red-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{result.error}</p>
              </div>
            ) : (
              <div className="space-y-1 text-sm text-gray-600">
                <p>✓ Created: {result.created}</p>
                {result.failed > 0 && <p>✗ Failed: {result.failed}</p>}
              </div>
            )}
          </div>
          <button
            onClick={() => setResult(null)}
            className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Import More
          </button>
        </div>
      )}
    </div>
  );
}