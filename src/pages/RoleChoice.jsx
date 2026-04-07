import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Briefcase, Hammer, ArrowRight } from 'lucide-react';

const T = {
  bg: "#EBEBEC",
  card: "#fff",
  dark: "#1A1A1B",
  muted: "#333",
  border: "#D0D0D2",
  orange: "#FF8C00",
  orangeBg: "#FFF5E6",
  orangeTint: "#FFE8CC",
  peachy: "#FFA341",
  shadow: "3px 3px 0px #FF8C00",
  goldGlow: "3px 3px 0px #FF8C00, 0 0 18px 4px rgba(255, 140, 0, 0.35)",
};

const cardStyle = {
  background: T.card,
  border: `0.5px solid ${T.border}`,
  borderRadius: 10,
  boxShadow: T.shadow,
  transition: "box-shadow 0.2s ease",
  padding: 24,
};

const hoverGlow = {
  onMouseEnter: (e) => { e.currentTarget.style.boxShadow = T.goldGlow; },
  onMouseLeave: (e) => { e.currentTarget.style.boxShadow = T.shadow; },
};

const mono = { fontFamily: "monospace", fontWeight: 700, fontStyle: "italic" };

export default function RoleChoice() {
  const navigate = useNavigate();

  const handleContractorClick = () => {
    navigate(createPageUrl('BecomeContractor'));
  };

  const handleCustomerClick = () => {
    navigate(createPageUrl('ConsumerSignup'));
  };

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh", background: T.bg }}>
      {/* Header */}
      <div style={{ background: T.bg, padding: "32px 16px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 14, letterSpacing: "0.06em" }}>// GET STARTED</div>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.75rem)", fontWeight: 800, color: T.dark, marginBottom: 8, fontStyle: "italic" }}>
            What brings you here?
          </h1>
          <p style={{ fontSize: 15, color: T.dark, lineHeight: 1.65, fontWeight: 700, fontStyle: "italic" }}>
            Choose your path to get started on SurfCoast.
          </p>
        </div>
      </div>

      {/* Role Cards */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
          {/* Contractor Card */}
          <button
            onClick={handleContractorClick}
            style={{ ...cardStyle, cursor: "pointer", border: "none", textAlign: "left", display: "flex", flexDirection: "column" }} 
            {...hoverGlow}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, background: T.orangeTint, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Hammer style={{ width: 32, height: 32, color: T.orange }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: T.dark, fontStyle: "italic" }}>I'm an Entrepreneur</h2>
            </div>

            <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 20, fontWeight: 600, fontStyle: "italic" }}>
              Offer services, find clients, and build your reputation on the SurfCoast marketplace.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24, flex: 1 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ ...mono, fontSize: 11, color: T.orange, fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 13, color: T.dark, fontWeight: 600, fontStyle: "italic" }}>Free profile, no credit card needed</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ ...mono, fontSize: 11, color: T.orange, fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 13, color: T.dark, fontWeight: 600, fontStyle: "italic" }}>$1.50/10 min communication fee</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ ...mono, fontSize: 11, color: T.orange, fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 13, color: T.dark, fontWeight: 600, fontStyle: "italic" }}>18% facilitation fee on completed jobs</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ ...mono, fontSize: 11, color: T.orange, fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 13, color: T.dark, fontWeight: 600, fontStyle: "italic" }}>Optional WAVE OS tools starting at $19/mo</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.orange, fontWeight: 700, ...mono, fontSize: 12 }}>
              Create Profile <ArrowRight style={{ width: 16, height: 16 }} />
            </div>
          </button>

          {/* Customer Card */}
          <button
            onClick={handleCustomerClick}
            style={{ ...cardStyle, cursor: "pointer", border: "none", textAlign: "left", display: "flex", flexDirection: "column" }}
            {...hoverGlow}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, background: T.orangeTint, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Briefcase style={{ width: 32, height: 32, color: T.orange }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: T.dark, fontStyle: "italic" }}>I Need Work Done</h2>
            </div>

            <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 20, fontWeight: 600, fontStyle: "italic" }}>
              Post projects, find trusted entrepreneurs, and manage work from start to finish.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24, flex: 1 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ ...mono, fontSize: 11, color: T.orange, fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 13, color: T.dark, fontWeight: 600, fontStyle: "italic" }}>Search by trade, location, or rating</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ ...mono, fontSize: 11, color: T.orange, fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 13, color: T.dark, fontWeight: 600, fontStyle: "italic" }}>Post jobs with photos & requirements</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ ...mono, fontSize: 11, color: T.orange, fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 13, color: T.dark, fontWeight: 600, fontStyle: "italic" }}>Receive quotes and compare options</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ ...mono, fontSize: 11, color: T.orange, fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 13, color: T.dark, fontWeight: 600, fontStyle: "italic" }}>Track progress, approve work, pay safely</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.orange, fontWeight: 700, ...mono, fontSize: 12 }}>
              Post Your First Job <ArrowRight style={{ width: 16, height: 16 }} />
            </div>
          </button>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 64, textAlign: "center", paddingTop: 32, borderTop: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 13, color: T.muted, fontStyle: "italic", marginBottom: 16 }}>
            Already signed up? <button onClick={() => window.location.href = '/login'} style={{ ...mono, fontSize: 13, background: "none", border: "none", color: T.orange, cursor: "pointer", textDecoration: "underline" }}>Log in here</button>
          </p>
        </div>
      </div>
    </div>
  );
}