import { useState, useEffect } from 'react';
import HeroSection from "@/components/home/HeroSection.jsx";
import TabbedSection from "@/components/home/TabbedSection.jsx";
import IntegritySection from "@/components/home/IntegritySection.jsx";
import LaunchEngineSection from "@/components/home/LaunchEngineSection.jsx";
import FAQAccordion from "@/components/home/FAQAccordion.jsx";
import CTABar from "@/components/home/CTABar.jsx";


function TickerBar() {
  const [spotsRemaining, setSpotsRemaining] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    import('@/api/base44Client').then(({ base44 }) => {
      base44.entities.Contractor.filter({ is_founding_member: true }).then((founders) => {
        const taken = founders ? founders.length : 0;
        setSpotsRemaining(Math.max(0, 100 - taken));
      }).catch(() => setSpotsRemaining(null));
    });
  }, []);

  const label = spotsRemaining !== null
    ? `founding_100 — ${spotsRemaining} spot${spotsRemaining !== 1 ? 's' : ''} remaining · 1 year all-access free`
    : `founding_100 — limited spots remaining · 1 year all-access free`;

  const BUTTONS = [
    {
      label: 'Founding Entrepreneurs',
      to: '/BecomeContractor',
      tip: 'For independent workers building their own business — from tradespeople to freelancers. The first 100 to sign up get one full year of all-access free, no credit card required.',
    },
    {
      label: 'Post a Project',
      to: '/PostJob',
      tip: 'For clients who need work done. Post your project for free and invite Entrepreneurs to submit a proposal. Your contact information is never shared until both parties agree to work together.',
    },
    {
      label: 'Market Shop Vendors',
      to: '/MarketShopSignup',
      tip: 'For booth operators, farmers market sellers, swap meet vendors, and flea market vendors. Set up your shop, manage listings, and connect with local buyers.',
    },
  ];

  return (
    <div style={{ background: '#1A1A1B', padding: '6px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#e0e0e0', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700, fontStyle: 'italic' }}>{label}</span>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
        {BUTTONS.map((btn) => (
          <div key={btn.label} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <a href={btn.to} style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 5, padding: '4px 10px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {btn.label}
            </a>
            <span
              onMouseEnter={() => setTooltip(btn.label)}
              onMouseLeave={() => setTooltip(null)}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 28, minHeight: 28, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', color: '#ccc', fontSize: 10, fontWeight: 700, cursor: 'default', flexShrink: 0 }}
              aria-label="More info"
            >?
            </span>
            {tooltip === btn.label && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: '#fff', border: '1px solid #D0D0D2', borderRadius: 8, padding: '10px 14px', width: 240, fontSize: 12, color: '#1A1A1B', lineHeight: 1.55, boxShadow: '0 4px 16px rgba(0,0,0,0.18)', zIndex: 100 }}>
                {btn.tip}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh" }}>
      <TickerBar />
      <HeroSection />
      <TabbedSection />
      <IntegritySection />
      <LaunchEngineSection />
      <FAQAccordion />
      <div style={{ background: "#1A1A1B", borderTop: "1px solid #2a2a2b", padding: "12px 24px", textAlign: "center" }}>
        <p style={{ fontFamily: "monospace", fontSize: 11, color: "#888", margin: 0, fontStyle: "italic" }}>
          Connection platform only. SurfCoast does not employ, endorse, or guarantee any entrepreneur, vendor, or service. Every user on this platform is a fully independent individual solely responsible for their own work, taxes, licensing, and legal compliance. All users participate at their own risk.
        </p>
      </div>
      <div style={{ background: "#111", borderTop: "1px solid #2a2a2b", padding: "40px 24px", textAlign: "center" }}>
        <blockquote style={{ margin: "0 auto", maxWidth: 600 }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(18px, 3vw, 26px)", color: "#fff", fontStyle: "italic", lineHeight: 1.5, margin: "0 0 12px 0" }}>
            "Reality is wrong. Dreams are for real."
          </p>
          <cite style={{ fontFamily: "monospace", fontSize: 12, color: "#FF8C00", letterSpacing: "0.1em", fontStyle: "normal" }}>
            — Tupac Shakur
          </cite>
        </blockquote>
      </div>
      <CTABar />
    </div>
  );
}