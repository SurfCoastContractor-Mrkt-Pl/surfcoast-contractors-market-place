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

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
    shadow: "3px 3px 0px #5C3500",
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingTop: 48, paddingBottom: 48, paddingLeft: 16, paddingRight: 16, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {status === 'loading' && (
          <div style={{ background: T.card, border: "0.5px solid " + T.border, borderRadius: 10, boxShadow: T.shadow, padding: 32, textAlign: "center" }}>
            <div style={{ width: 48, height: 48, border: "3px solid #D0D0D2", borderTop: "3px solid " + T.dark, borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
            <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 1.8rem)", fontWeight: 800, color: T.dark, margin: "0 0 8px 0", fontStyle: "italic" }}>Confirming Payment</h1>
            <p style={{ color: T.muted, fontStyle: "italic" }}>Processing your quote request submission...</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ background: T.card, border: "0.5px solid " + T.border, borderRadius: 10, boxShadow: T.shadow, padding: 32, textAlign: "center" }}>
            <CheckCircle style={{ width: 48, height: 48, color: T.amber, margin: "0 auto 16px" }} />
            <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 1.8rem)", fontWeight: 800, color: T.dark, margin: "0 0 8px 0", fontStyle: "italic" }}>Quote Request Submitted!</h1>
            <p style={{ color: T.muted, marginBottom: 24, fontStyle: "italic" }}>
              Your quote request has been successfully submitted. Contractors will be notified and can respond with their rates.
            </p>

            <div style={{ background: "#FBF5EC", border: "0.5px solid #D9B88A", borderRadius: 8, padding: 16, marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: T.amber, fontStyle: "italic" }}>
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
          </div>
        )}

        {status === 'missing_session' && (
          <div style={{ background: T.card, border: "0.5px solid " + T.border, borderRadius: 10, boxShadow: T.shadow, padding: 32, textAlign: "center" }}>
            <AlertCircle style={{ width: 48, height: 48, color: "#cc0000", margin: "0 auto 16px" }} />
            <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 1.8rem)", fontWeight: 800, color: T.dark, margin: "0 0 8px 0", fontStyle: "italic" }}>Invalid Session</h1>
            <p style={{ color: T.muted, marginBottom: 24, fontStyle: "italic" }}>Unable to confirm your quote request. Please try again.</p>

            <Button
              onClick={() => navigate(-1)}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              Go Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}