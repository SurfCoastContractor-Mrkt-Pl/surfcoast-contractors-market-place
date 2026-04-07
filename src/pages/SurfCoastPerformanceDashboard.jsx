import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import PerformanceAnalyticsDashboard from '@/components/contractor/PerformanceAnalyticsDashboard';

export default function SurfCoastPerformanceDashboard() {
  const [contractor, setContractor] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const contractors = await base44.entities.Contractor.filter({
          email: currentUser.email,
        });

        if (contractors && contractors.length > 0) {
          setContractor(contractors[0]);
        } else {
          setError('Contractor profile not found');
        }
      } catch (err) {
        setError('Failed to load contractor data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
      <div style={{ minHeight: "100vh", background: T.bg, padding: 24, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #D0D0D2", borderTop: "3px solid " + T.dark, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, padding: 24, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ background: T.card, border: "0.5px solid #EF5350", borderRadius: 10, boxShadow: "3px 3px 0px #EF5350", maxWidth: 640, padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <AlertCircle style={{ width: 20, height: 20, color: "#d32f2f" }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#c62828", margin: 0, fontStyle: "italic" }}>Error</h2>
          </div>
          <p style={{ color: "#c62828", fontStyle: "italic" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, padding: 24, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ background: T.card, border: "0.5px solid " + T.border, borderRadius: 10, boxShadow: T.shadow, maxWidth: 640, padding: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: T.dark, margin: "0 0 16px 0", fontStyle: "italic" }}>SurfCoast Performance Dashboard</h2>
          <p style={{ color: T.muted, fontStyle: "italic" }}>No contractor profile found. Please complete your contractor setup.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: 24, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.4rem)", fontWeight: 800, color: T.dark, margin: "0 0 8px 0", fontStyle: "italic" }}>SurfCoast Performance Dashboard</h1>
          <p style={{ color: T.muted, marginTop: 8, fontStyle: "italic" }}>Track your earnings, completion rates, and customer satisfaction metrics.</p>
        </div>

        <PerformanceAnalyticsDashboard
          contractorEmail={contractor.email}
          tierLevel={contractor.profile_tier || 'standard'}
        />
      </div>
    </div>
  );
}