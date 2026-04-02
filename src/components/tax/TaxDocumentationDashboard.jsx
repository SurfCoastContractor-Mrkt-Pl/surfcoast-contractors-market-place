import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { FileText, Download, Loader2 } from 'lucide-react';

export default function TaxDocumentationDashboard({ contractorId }) {
  const [year, setYear] = useState(new Date().getFullYear() - 1);
  const [loading, setLoading] = useState(false);
  const [form1099, setForm1099] = useState(null);

  const handleGenerate1099 = async () => {
    setLoading(true);
    try {
      const result = await base44.functions.invoke('generate1099', {
        contractorId,
        year,
      });
      setForm1099(result.form1099);
    } catch (error) {
      console.error('Failed to generate 1099:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-gray-900">Tax Documentation</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Tax Year
          </label>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            {[...Array(5)].map((_, i) => {
              const y = new Date().getFullYear() - i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>

        <button
          onClick={handleGenerate1099}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Generate 1099-NEC
            </>
          )}
        </button>

        {form1099 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Gross Income</p>
                <p className="font-bold text-lg text-gray-900">
                  ${form1099.box_1_misc_income.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Total Transactions</p>
                <p className="font-bold text-lg text-gray-900">{form1099.total_payments}</p>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}