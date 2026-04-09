import { useState } from 'react';
import { Link } from 'react-router-dom';
import useScrollTracking from '@/hooks/useScrollTracking';

const T = {
  bg: "#EBEBEC",
  card: "#fff",
  dark: "#1A1A1B",
  muted: "#333",
  border: "#D0D0D2",
  amber: "#5C3500",
  amberBg: "#F0E0C0",
  amberTint: "#FBF5EC",
  shadow: "3px 3px 0px #5C3500",
};

const mono = { fontFamily: "monospace", fontWeight: 700, fontStyle: "italic" };
const goldGlowSm = "0 0 14px 3px rgba(255, 180, 0, 0.3)";
const hoverGlowSm = {
  onMouseEnter: (e) => { e.currentTarget.style.boxShadow = goldGlowSm; },
  onMouseLeave: (e) => { e.currentTarget.style.boxShadow = "none"; },
};

const cardStyle = {
  background: T.card,
  border: `0.5px solid ${T.border}`,
  borderRadius: 10,
  boxShadow: T.shadow,
  transition: "box-shadow 0.2s ease",
};

const hoverGlow = {
  onMouseEnter: (e) => { e.currentTarget.style.boxShadow = "3px 3px 0px #5C3500, 0 0 18px 4px rgba(255, 180, 0, 0.35)"; },
  onMouseLeave: (e) => { e.currentTarget.style.boxShadow = T.shadow; },
};

const tag = (text, amber) => (
  <span key={text} style={{ display: "inline-block", ...mono, fontSize: 10, padding: "3px 8px", borderRadius: 4, border: `0.5px solid ${amber ? "#D9B88A" : T.border}`, background: amber ? T.amberTint : T.bg, color: amber ? T.amber : T.muted, marginRight: 4, marginTop: 4 }}>
    {text}
  </span>
);

const TAB_DATA = [
  {
    id: "roles",
    label: "Who It's For",
    content: () => {
      const roles = [
        { topBorder: T.dark, labelColor: T.muted, label: "SERVICE SIDE · CLIENT", heading: "The Hirer", desc: "Post jobs free. Send an RFP for $1.75 directly to any contractor. A $1.50 session opens a 60-minute communication window.", tags: [["POST JOB · FREE", false], ["RFP · $1.75", true], ["SESSION · $1.50", false]], cta: { label: "Post a Job", to: "/PostJob" } },
        { topBorder: T.amber, labelColor: T.amber, label: "SERVICE SIDE · ENTREPRENEUR", heading: "The Worker", desc: "Respond to every lead for free. Pay 18% only when a job closes through the platform. WAVE OS is optional.", tags: [["RESPOND · $0", false], ["18% ON CLOSE", false], ["WAVE OS OPTIONAL", true]], cta: { label: "Join as Entrepreneur", to: "/BecomeContractor" } },
        { topBorder: T.border, labelColor: "#444", label: "MARKET SHOP · VENDOR", heading: "The Seller", desc: "Claim a booth or space at a farmers market or swap meet. Upgrade to WAVEshop OS for live inventory management.", tags: [["BOOTH", false], ["SPACE", false], ["WAVEshop OS · $35/mo", false]], cta: { label: "Open a Shop", to: "/MarketShopSignup" } },
        { topBorder: T.border, labelColor: "#444", label: "MARKET SHOP · CONSUMER", heading: "The Shopper", desc: "Browse and shop from local vendors. Consumer accounts are scoped to Market Shop only — no service side access.", tags: [["MARKET SHOP ONLY", false], ["NO SERVICE SIDE", true]], cta: { label: "Browse Markets", to: "/MarketDirectory" } },
      ];
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {roles.map((r) => (
            <div key={r.label} style={{ ...cardStyle, borderTop: `3px solid ${r.topBorder}`, padding: 20, display: "flex", flexDirection: "column" }} {...hoverGlow}>
              <div style={{ ...mono, fontSize: 10, color: r.labelColor, marginBottom: 8, letterSpacing: "0.06em", fontWeight: 700, fontStyle: "italic" }}>{r.label}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: T.dark, marginBottom: 8 }}>{r.heading}</h3>
              <p style={{ fontSize: 13, color: T.dark, lineHeight: 1.6, marginBottom: 12, flex: 1, fontWeight: 700, fontStyle: "italic" }}>{r.desc}</p>
              <div style={{ marginBottom: 14 }}>{r.tags.map(([t, a]) => tag(t, a))}</div>
              <Link to={r.cta.to} style={{ textDecoration: "none", display: "inline-block", ...mono, fontSize: 11, background: "transparent", border: `1px solid ${T.border}`, borderRadius: 5, padding: "6px 12px", color: T.dark }}>{r.cta.label} →</Link>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "fees",
    label: "How Fees Work",
    content: () => {
      const row = (label, note, value, amberVal) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.bg}`, transition: "box-shadow 0.2s ease", borderRadius: 4 }} {...hoverGlowSm}>
          <div>
            <div style={{ fontSize: 13, color: T.dark, fontWeight: 600, fontStyle: "italic" }}>{label}</div>
            <div style={{ fontSize: 11, color: "#444", fontWeight: 700, fontStyle: "italic" }}>{note}</div>
          </div>
          <span style={{ ...mono, fontSize: 14, fontWeight: 700, color: amberVal ? T.amber : T.dark }}>{value}</span>
        </div>
      );
      return (
        <div>
          <p style={{ fontSize: 14, color: T.dark, marginBottom: 24, lineHeight: 1.6, fontWeight: 700, fontStyle: "italic" }}>We never charge an entrepreneur to respond to a lead. Every fee is a filter that keeps the platform signal high.</p>
          <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 240px", paddingRight: 28 }}>
              <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 12, letterSpacing: "0.06em", fontWeight: 700, fontStyle: "italic" }}>FOR ENTREPRENEURS</div>
              {row("Facilitation fee", "on job close", "18%", false)}
              {row("Respond to RFP", "no upfront cost", "$0", true)}
              {row("Timed session", "60-min window", "$1.50", false)}
              {row("Unlimited messaging", "monthly add-on", "$50/mo", false)}
              {row("Basic Dashboard", "always included", "Free", true)}
            </div>
            <div style={{ width: 1, background: T.border, flexShrink: 0 }} />
            <div style={{ flex: "1 1 240px", paddingLeft: 28 }}>
              <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 12, letterSpacing: "0.06em", fontWeight: 700, fontStyle: "italic" }}>FOR CLIENTS</div>
              {row("Job posting", "no account needed", "$0", true)}
              {row("Request for Proposal", "direct to entrepreneur", "$1.75", false)}
              {row("Timed session", "60-min window", "$1.50", false)}
              {row("Unlimited messaging", "monthly add-on", "$50/mo", false)}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: "multitrade",
    label: "Multi-Trade Jobs",
    content: () => {
      const slots = [
        { trade: "Plumber", status: "● filled", icon: "✓", filled: true },
        { trade: "Electrician", status: "◆ hiring", icon: "◷", filled: true },
        { trade: "Painter", status: "○ open", icon: "+", filled: false },
        { trade: "Carpenter", status: "○ open", icon: "+", filled: false },
      ];
      return (
        <div>
          <p style={{ fontSize: 14, color: T.dark, marginBottom: 24, lineHeight: 1.6, fontWeight: 700, fontStyle: "italic" }}>Post one project and hire multiple trade specialists independently. Slots close as entrepreneurs are hired — no double-booking, no confusion.</p>
          <div style={{ background: T.bg, borderRadius: 10, padding: 20, transition: "box-shadow 0.2s ease" }} {...hoverGlowSm}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.dark, marginBottom: 4, fontStyle: "italic" }}>Kitchen Renovation — Full Project</div>
              <div style={{ ...mono, fontSize: 11, color: "#444", fontWeight: 700, fontStyle: "italic" }}>Posted by: Client · Budget: $18,000 · Timeline: 6 weeks</div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {slots.map((s) => (
                <div key={s.trade} style={{ flex: "1 1 110px", background: s.filled ? T.amberTint : "#fff", border: `0.5px solid ${s.filled ? "#D9B88A" : T.border}`, borderRadius: 8, padding: "14px 12px", textAlign: "center", transition: "box-shadow 0.2s ease" }} {...hoverGlowSm}>
                  <div style={{ fontSize: 18, color: s.filled ? T.amber : "#777", marginBottom: 5 }}>{s.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: s.filled ? T.dark : "#555", marginBottom: 4, fontStyle: "italic" }}>{s.trade}</div>
                  <div style={{ ...mono, fontSize: 10, color: s.filled ? T.amber : "#666", fontWeight: 700, fontStyle: "italic" }}>{s.status}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Link to="/PostJob" style={{ textDecoration: "none", display: "inline-block", ...mono, fontSize: 11, background: T.dark, color: "#fff", border: "none", borderRadius: 6, padding: "9px 16px" }}>Post a multi-trade job →</Link>
          </div>
        </div>
      );
    },
  },
];

const tabButtonBase = {
  fontFamily: "monospace",
  fontSize: 12,
  padding: "9px 20px",
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
  transition: "background 0.15s, box-shadow 0.2s ease",
};

export default function TabbedSection() {
  const ref = useScrollTracking('platform_overview');
  const [active, setActive] = useState("roles");
  const current = TAB_DATA.find((t) => t.id === active);

  return (
    <section ref={ref} style={{ background: T.bg, padding: "40px 16px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.06em", fontWeight: 700, fontStyle: "italic" }}>// PLATFORM OVERVIEW</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: T.dark, marginBottom: 24, fontStyle: "italic" }}>How the platform works.</h2>

        <div style={{ display: "flex", gap: 0, marginBottom: 28, background: "#ECECED", border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: "auto", width: "100%", maxWidth: "fit-content" }}>
          {TAB_DATA.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = goldGlowSm; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
              style={{ ...tabButtonBase, ...mono, borderRight: `1px solid ${T.border}`, background: active === t.id ? T.amberTint : "transparent", color: active === t.id ? T.amber : T.muted, fontWeight: active === t.id ? 700 : 400 }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div>{current && current.content()}</div>
      </div>
    </section>
  );
}