import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import NotionIntegrationPanel from '@/components/notion/NotionIntegrationPanel';

export default function NotionHub() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
    shadow: "3px 3px 0px #5C3500",
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #D0D0D2", borderTop: "3px solid " + T.dark, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16, background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <p style={{ color: T.muted, fontStyle: "italic" }}>Please sign in to access the Notion Hub.</p>
        <button
          style={{ padding: "8px 16px", background: T.dark, color: "#fff", borderRadius: 8, fontSize: 14, border: "none", cursor: "pointer" }}
          onClick={() => base44.auth.redirectToLogin()}
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingTop: 40, paddingBottom: 40, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", paddingLeft: 16, paddingRight: 16 }}>
        <NotionIntegrationPanel isAdmin={user.role === 'admin'} />
      </div>
    </div>
  );
}