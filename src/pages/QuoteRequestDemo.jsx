import React, { useState } from 'react';
import QuoteRequestFormMultiStep from '@/components/quote/QuoteRequestFormMultiStep';
import QuoteRequestSuccessModal from '@/components/quote/QuoteRequestSuccessModal';

export default function QuoteRequestDemo() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const handleSuccess = (data) => {
    setSuccessData(data);
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Get a Quote</h1>
          <p className="text-lg text-slate-600">
            Tell a professional about your project needs and receive a custom quote
          </p>
        </div>

        <QuoteRequestFormMultiStep
          contractorId="demo-contractor-1"
          contractorName="John Smith"
          contractorEmail="contractor@example.com"
          onSuccess={handleSuccess}
        />
      </div>

      {showSuccess && successData && (
        <QuoteRequestSuccessModal
          contractorName="John Smith"
          contractorEmail="contractor@example.com"
          visitorEmail={successData.quoteRequest.customer_email}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
}