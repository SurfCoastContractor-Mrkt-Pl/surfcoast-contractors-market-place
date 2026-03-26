import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'npm:uuid';

export default function QuoteRequestPaymentGate({ jobId, jobTitle, payerType, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payerEmail, setPayerEmail] = useState('');
  const [payerName, setPayerName] = useState('');

  const handleSubmitQuoteRequest = async (e) => {
    e.preventDefault();
    setError(null);

    if (!payerEmail || !payerName) {
      setError('Please enter your name and email');
      return;
    }

    setLoading(true);
    try {
      const idempotencyKey = uuidv4();
      const response = await base44.functions.invoke('createQuoteRequestCheckout', {
        payerEmail,
        payerName,
        payerType,
        jobId,
        jobTitle,
        idempotencyKey,
      });

      if (response.data?.checkout_url) {
        // Check if in iframe
        if (window.self !== window.top) {
          setError('Checkout must be opened from the published app, not an iframe.');
          setLoading(false);
          return;
        }
        window.location.href = response.data.checkout_url;
      } else {
        setError(response.data?.error || 'Failed to create checkout session');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Quote request payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Submit Quote Request</h3>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-900">
            <strong>$1.75</strong> to submit a quote request for <strong>{jobTitle}</strong>. Unlock contractor contact info.
          </p>
        </div>

        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-900 ml-2">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmitQuoteRequest} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
            <input
              type="text"
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your Email</label>
            <input
              type="email"
              value={payerEmail}
              onChange={(e) => setPayerEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay $1.75 & Submit Quote'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}