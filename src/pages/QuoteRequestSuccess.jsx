import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function QuoteRequestSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [jobId] = useState(searchParams.get('job_id'));

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('missing_session');
      return;
    }

    // Simulate payment confirmation delay
    const timer = setTimeout(() => {
      setStatus('success');
    }, 2000);

    return () => clearTimeout(timer);
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {status === 'loading' && (
          <Card className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Confirming Payment</h1>
            <p className="text-slate-600">Processing your quote request submission...</p>
          </Card>
        )}

        {status === 'success' && (
          <Card className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Quote Request Submitted!</h1>
            <p className="text-slate-600 mb-6">
              Your quote request has been successfully submitted. Contractors will be notified and can respond with their rates.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-900">
                <strong>What's next:</strong> Check your email for contractor responses. You can also view all quotes in your dashboard.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="border-slate-300 text-slate-900 hover:bg-slate-50"
              >
                Go Back
              </Button>
              <Button
                onClick={() => navigate(`/Jobs`)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                View Job Details
              </Button>
            </div>
          </Card>
        )}

        {status === 'missing_session' && (
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Session</h1>
            <p className="text-slate-600 mb-6">Unable to confirm your quote request. Please try again.</p>

            <Button
              onClick={() => navigate(-1)}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              Go Back
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}