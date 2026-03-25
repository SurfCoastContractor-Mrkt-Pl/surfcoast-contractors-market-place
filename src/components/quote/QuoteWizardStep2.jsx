import React from 'react';

const TRADE_CATEGORIES = [
  'electrician',
  'plumber',
  'carpenter',
  'hvac',
  'mason',
  'roofer',
  'painter',
  'welder',
  'tiler',
  'landscaper'
];

export default function QuoteWizardStep2({ formData, setFormData, contractors }) {
  const handleTradeSelect = (trade) => {
    setFormData(prev => ({ ...prev, tradeCategory: trade }));
  };

  const handleContractorSelect = (contractor) => {
    setFormData(prev => ({
      ...prev,
      contractorId: contractor.id,
      contractorName: contractor.name,
      contractorEmail: contractor.email
    }));
  };

  const filteredContractors = formData.tradeCategory
    ? contractors.filter(c => c.trade_specialty === formData.tradeCategory)
    : contractors;

  return (
    <div className="space-y-8">
      {/* Trade Selection */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-4">Select Trade Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TRADE_CATEGORIES.map(trade => (
            <button
              key={trade}
              onClick={() => handleTradeSelect(trade)}
              className={`p-3 rounded-lg border-2 transition-all font-medium capitalize ${
                formData.tradeCategory === trade
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              {trade}
            </button>
          ))}
        </div>
      </div>

      {/* Contractor Selection */}
      {formData.tradeCategory && (
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-4">
            Select a Contractor ({filteredContractors.length} available)
          </label>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredContractors.length > 0 ? (
              filteredContractors.map(contractor => (
                <button
                  key={contractor.id}
                  onClick={() => handleContractorSelect(contractor)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    formData.contractorId === contractor.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="font-semibold text-slate-900">{contractor.name}</div>
                  <div className="text-sm text-slate-600">{contractor.location}</div>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="text-slate-700">⭐ {contractor.rating || 'N/A'}</span>
                    <span className="text-slate-700">{contractor.completed_jobs_count || 0} jobs</span>
                    <span className="text-slate-700">${contractor.hourly_rate || 'Quote'}/hr</span>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-slate-600 text-center py-8">No contractors available for this trade</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}