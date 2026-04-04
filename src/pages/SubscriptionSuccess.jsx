import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function SubscriptionSuccess() {
  const [message, setMessage] = useState('Processing your subscription...');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      navigate('/SubscriptionUpgrade');
      return;
    }

    // Simulate processing (backend webhook would handle actual subscription creation)
    setTimeout(() => {
      setMessage('Subscription activated! Welcome back to SurfCoast.');
      setLoading(false);
    }, 2000);
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {loading ? (
          <>
            <div className="w-16 h-16 mx-auto mb-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-lg text-muted-foreground">{message}</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Success!</h1>
            <p className="text-lg text-muted-foreground mb-8">{message}</p>
            <div className="space-y-3">
              <a
                href="/Dashboard"
                className="block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90"
              >
                Go to Dashboard
              </a>
              <a
                href="/BillingHistory"
                className="block px-6 py-3 border-2 border-border rounded-lg font-semibold hover:bg-muted"
              >
                View Billing
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}