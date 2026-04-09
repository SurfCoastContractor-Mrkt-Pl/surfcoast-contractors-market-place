import { useState, useEffect } from 'react';
import HomeNavBar from "@/components/home/HomeNavBar";
import HeroSection from "@/components/home/HeroSection";
import TabbedSection from "@/components/home/TabbedSection";
import IntegritySection from "@/components/home/IntegritySection";
import LaunchEngineSection from "@/components/home/LaunchEngineSection";
import FAQAccordion from "@/components/home/FAQAccordion";
import CTABar from "@/components/home/CTABar";

function TickerBar() {
  const [spotsRemaining, setSpotsRemaining] = useState(null);

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

  return (
    <div style={{ background: "#1A1A1B", padding: "6px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4, overflow: "hidden" }}>
      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#e0e0e0", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 700, fontStyle: "italic" }}>{label}</span>
      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#ffffff", flexShrink: 0, fontWeight: 700, fontStyle: "italic" }}>California · Nationwide</span>
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh" }}>
      <HomeNavBar />
      <TickerBar />
      <HeroSection />
      <TabbedSection />
      <IntegritySection />
      <LaunchEngineSection />
      <FAQAccordion />
      <CTABar />
    </div>
  );
}