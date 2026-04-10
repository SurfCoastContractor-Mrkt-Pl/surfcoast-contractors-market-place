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
        { topBorder: T.dark, labelColor: T.muted, label: "FOR PEOPLE WHO NEED HELP", heading: "The Client", desc: "Post your project free. Submit a Request for Proposal for $1.75 to invite an Entrepreneur to respond. This action does not initiate direct conversation or share contact information. No communication between parties is possible until both agree to work together. If both parties agree to work together (reaching an 'Agreed' status), direct communication via our secure messaging system is enabled for the duration of the project until it closes out. Clients can also pay a separate $1.50 fee for a 10-minute direct messaging session to initiate communication with an Entrepreneur before an agreement is reached.", tags: [["POST PROJECT · FREE", false], ["REQUEST FOR PROPOSAL · $1.75", true], ["MESSAGING · AGREED STATUS ONLY", false]], cta: { label: "Post a Project", to: "/PostJob" } },
        { topBorder: T.amber, labelColor: T.amber, label: "FOR ENTREPRENEURS & WORKERS", heading: "The Entrepreneur", desc: "Respond to every Request for Proposal for free. We only ask for a Project Completion Fee of 18% when you successfully close a project. The WAVE OS system has tools to help you grow when you need it, but it is not required to complete your journey; it just helps make it easier.", tags: [["RESPOND · $0", false], ["18% PROJECT COMPLETION FEE", false], ["WAVE OS · WHEN YOU'RE READY", true]], cta: { label: "Join as Entrepreneur", to: "/BecomeContractor" } },
        { topBorder: T.border, labelColor: "#444", label: "MARKET SHOP · VENDOR", heading: "The Seller", desc: "Claim a booth or space at a farmers market or swap meet. WAVEshop OS gives you live inventory management, scheduling, and analytics — all designed for in-person sellers.", tags: [["BOOTH", false], ["SPACE", false], ["WAVEshop OS · $35/mo", false]], cta: { label: "Open a Shop", to: "/MarketShopSignup" } },
        { topBorder: T.border, labelColor: "#444", label: "MARKET SHOP · CONSUMER", heading: "The Shopper", desc: "Browse local vendors and find unique items. This account is built for shopping, not for hiring or being hired.", tags: [["MARKET SHOP ONLY", false], ["NO SERVICE SIDE", true]], cta: { label: "Browse Markets", to: "/MarketDirectory" } },
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
          <p style={{ fontSize: 14, color: T.dark, marginBottom: 24, lineHeight: 1.6, fontWeight: 700, fontStyle: "italic" }}>We believe in transparency. We don't believe in lead fees. Every fee helps keep the community thriving and connections genuine.</p>
          <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 240px", paddingRight: 28 }}>
              <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 12, letterSpacing: "0.06em", fontWeight: 700, fontStyle: "italic" }}>FOR ENTREPRENEURS</div>
              {row("Project Completion Fee", "on job close through platform", "18%", false)}
              {row("Respond to Project Opportunity", "no upfront cost, ever", "$0", true)}
              {row("Direct Messaging Session", "10-min window", "$1.50", false)}
              {row("Unlimited messaging", "monthly add-on", "$50/mo", false)}
              {row("Basic Dashboard", "always included", "Free", true)}
            </div>
            <div style={{ width: 1, background: T.border, flexShrink: 0 }} />
            <div style={{ flex: "1 1 240px", paddingLeft: 28 }}>
              <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 12, letterSpacing: "0.06em", fontWeight: 700, fontStyle: "italic" }}>FOR CLIENTS</div>
              {row("Post a project", "no account needed", "$0", true)}
              {row("Request for Proposal", "invite an entrepreneur to respond", "$1.75", false)}
              {row("Direct Messaging Session", "10-min window", "$1.50", false)}
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
            <Link to="/PostJob" style={{ textDecoration: "none", display: "inline-block", ...mono, fontSize: 11, background: T.dark, color: "#fff", border: "none", borderRadius: 6, padding: "9px 16px" }}>Post a multi-trade project →</Link>
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
    <section ref={ref} data-section="platform_overview" style={{ background: T.bg, padding: "40px 16px" }}>
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