import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

export default function QuoteWizardStep4({ formData, contractors }) {
  const selectedContractor = contractors.find(c => c.id === formData.contractorId);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-slate-50 rounded-lg p-6 space-y-4">
        <div className="border-b border-slate-200 pb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">PROJECT DETAILS</h3>
          <div className="space-y-2">
            <p className="text-slate-900 font-semibold">{formData.jobTitle}</p>
            <p className="text-slate-700 text-sm">{formData.description}</p>
            {formData.budget && <p className="text-slate-600 text-sm">Budget: {formData.budget}</p>}
            {formData.timeline && <p className="text-slate-600 text-sm">Timeline: {formData.timeline}</p>}
          </div>
        </div>

        <div className="border-b border-slate-200 pb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">YOUR CONTACT INFO</h3>
          <p className="text-slate-900 font-semibold">{formData.customerName}</p>
          <p className="text-slate-600 text-sm">{formData.customerEmail}</p>
        </div>

        <div className="border-b border-slate-200 pb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">SELECTED CONTRACTOR</h3>
          {selectedContractor && (
            <>
              <p className="text-slate-900 font-semibold">{selectedContractor.name}</p>
              <p className="text-slate-600 text-sm">
                {selectedContractor.trade_specialty && selectedContractor.trade_specialty.charAt(0).toUpperCase() + selectedContractor.trade_specialty.slice(1)}
              </p>
              <p className="text-slate-600 text-sm">{selectedContractor.location}</p>
              <div className="flex gap-4 mt-2 text-sm">
                <span>⭐ {selectedContractor.rating || 'N/A'}</span>
                <span>{selectedContractor.completed_jobs_count || 0} completed</span>
              </div>
            </>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">PHOTOS ATTACHED</h3>
          <p className="text-slate-700 font-semibold">{formData.photos.length} photo(s)</p>
        </div>
      </div>

      {/* Confirmation Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-green-900">Ready to send</p>
          <p className="text-sm text-green-800">
            Your quote request will be sent to {selectedContractor?.name}. They'll review your photos and details, then contact you directly with a quote.
          </p>
        </div>
      </div>

      {/* Important Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900 text-sm">What happens next?</p>
          <ul className="text-sm text-blue-800 mt-2 space-y-1">
            <li>✓ Contractor receives your quote request with photos</li>
            <li>✓ They'll evaluate the scope of work</li>
            <li>✓ You'll get contacted directly within 24-48 hours</li>
          </ul>
        </div>
      </div>
    </div>
  );
}