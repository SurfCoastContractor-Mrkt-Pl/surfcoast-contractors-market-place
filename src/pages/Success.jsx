import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function Success() {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('payment_id');

    if (!paymentId) {
      setError('No payment ID found. Please contact support.');
      setIsVerifying(false);
      return;
    }

    // Payment will be confirmed by webhook, just show success message
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        {isVerifying ? (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Processing Payment</h1>
            <p className="text-slate-600">Please wait while we confirm your payment...</p>
          </>
        ) : error ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-red-900 mb-2">Payment Error</h1>
            <p className="text-red-700 mb-6">{error}</p>
            <Button onClick={() => navigate(-1)} className="bg-red-600 hover:bg-red-700 text-white">
              Go Back
            </Button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
            <p className="text-slate-600 mb-6">Your platform access fee has been processed. A confirmation email has been sent to you.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white w-full">
              Return to Home
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}