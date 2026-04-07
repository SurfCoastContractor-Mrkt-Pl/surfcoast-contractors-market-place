import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function SubscriptionSuccess() {
  const [message, setMessage] = useState('Processing your subscription...');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
    shadow: "3px 3px 0px #5C3500",
  };

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
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 16, paddingRight: 16, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: 448 }}>
        {loading ? (
          <>
            <div style={{ width: 64, height: 64, margin: "0 auto 24px", border: "3px solid #D0D0D2", borderTop: "3px solid " + T.dark, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontSize: 18, color: T.muted, fontStyle: "italic" }}>{message}</p>
          </>
        ) : (
          <>
            <div style={{ width: 64, height: 64, margin: "0 auto 24px", borderRadius: "50%", background: "rgba(92, 53, 0, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 style={{ width: 32, height: 32, color: T.amber }} />
            </div>
            <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2rem)", fontWeight: 800, color: T.dark, margin: "0 0 8px 0", fontStyle: "italic" }}>Success!</h1>
            <p style={{ fontSize: 18, color: T.muted, marginBottom: 32, fontStyle: "italic" }}>{message}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a href="/Dashboard" style={{ display: "block", padding: "12px 24px", background: T.amber, color: "#fff", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 16, cursor: "pointer", border: "none" }}>
                Go to Dashboard
              </a>
              <a href="/BillingHistory" style={{ display: "block", padding: "12px 24px", border: "1.5px solid " + T.border, borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 16, cursor: "pointer", color: T.dark }}>
                View Billing
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}