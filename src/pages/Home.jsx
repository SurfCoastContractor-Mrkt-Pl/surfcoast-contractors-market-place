import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import HomeNavBar from "@/components/home/HomeNavBar";
import useScrollTracking from "@/hooks/useScrollTracking";
import FAQAccordion from "@/components/home/FAQAccordion";

const T = {
  bg: "#EBEBEC",
  card: "#fff",
  dark: "#1A1A1B",
  sub: "#1A1A1B",
  muted: "#333",
  border: "#D0D0D2",
  amber: "#5C3500",
  amberBg: "#F0E0C0",
  amberTint: "#FBF5EC",
  shadow: "3px 3px 0px #5C3500",
};

const cardStyle = {
  background: T.card,
  border: `0.5px solid ${T.border}`,
  borderRadius: 10,
  boxShadow: T.shadow,
  transition: "box-shadow 0.2s ease",
};

const goldGlow = "3px 3px 0px #5C3500, 0 0 18px 4px rgba(255, 180, 0, 0.35)";
const goldGlowSm = "0 0 14px 3px rgba(255, 180, 0, 0.3)";
const purpleBlueGlow = "0 0 18px 5px rgba(100, 80, 220, 0.45)";

const hoverGlow = {
  onMouseEnter: (e) => { e.currentTarget.style.boxShadow = goldGlow; },
  onMouseLeave: (e) => { e.currentTarget.style.boxShadow = T.shadow; },
};

const hoverGlowSm = {
  onMouseEnter: (e) => { e.currentTarget.style.boxShadow = goldGlowSm; },
  onMouseLeave: (e) => { e.currentTarget.style.boxShadow = "none"; },
};

const mono = { fontFamily: "monospace", fontWeight: 700, fontStyle: "italic" };

// Memoized style objects
const buttonStyle = (bg, color, border) => ({
  textDecoration: "none",
  display: "block",
  width: "100%",
  maxWidth: 320,
  background: bg,
  color,
  border,
  borderRadius: 8,
  padding: "14px 18px",
  fontSize: 14,
  fontWeight: 700,
  textAlign: "center",
  fontFamily: "system-ui, -apple-system, sans-serif",
  lineHeight: 1.3,
});

const tabButtonBase = {
  fontFamily: "monospace",
  fontSize: 12,
  padding: "9px 20px",
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
  transition: "background 0.15s, box-shadow 0.2s ease",
};

const tagStyle = (amber) => ({
  display: "inline-block",
  fontFamily: "monospace",
  fontWeight: 700,
  fontStyle: "italic",
  fontSize: 10,
  padding: "3px 8px",
  borderRadius: 4,
  border: `0.5px solid ${amber ? "#D9B88A" : T.border}`,
  background: amber ? T.amberTint : T.bg,
  color: amber ? T.amber : T.muted,
  marginRight: 4,
  marginTop: 4,
});

const faqButtonStyle = {
  width: "100%",
  background: "transparent",
  border: "none",
  padding: "20px",
  textAlign: "left",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
};

const tag = (text, amber) => (
  <span key={text} style={{ ...tagStyle(amber), ...mono }}>
    {text}
  </span>
);

// ── Ticker ─────────────────────────────────────────────────────
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
    <div style={{ background: T.dark, padding: "6px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4, overflow: "hidden" }}>
      <span style={{ ...mono, fontSize: 11, color: "#e0e0e0", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      <span style={{ ...mono, fontSize: 11, color: "#ffffff", flexShrink: 0 }}>California · Nationwide</span>
    </div>
  );
}

// ── Hero ───────────────────────────────────────────────────────
function HeroPlatformCard() {
  const block = (borderColor, labelColor, labelText, tiles) => (
    <div style={{ borderLeft: `3px solid ${borderColor}`, paddingLeft: 12, marginBottom: 14 }}>
      <div style={{ ...mono, fontSize: 10, color: labelColor, marginBottom: 8, letterSpacing: "0.06em" }}>{labelText}</div>
      {tiles.map(({ text, tinted }) => (
        <div key={text} style={{ background: tinted ? T.amberTint : T.bg, border: `0.5px solid ${tinted ? "#D9B88A" : T.border}`, borderRadius: 6, padding: "6px 10px", fontSize: 12, color: tinted ? T.amber : T.sub, marginBottom: 5, ...mono, transition: "box-shadow 0.2s ease", cursor: "default" }} {...hoverGlowSm}>
          {text}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ ...cardStyle, padding: 20, minWidth: 0 }} {...hoverGlow}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
        <span style={{ ...mono, fontSize: 11, color: T.muted }}>surfcoast / platform_map</span>
        <span style={{ ...mono, fontSize: 11, color: T.amber }}>● live</span>
      </div>
      {block(T.border, T.muted, "SURFCOAST MARKETPLACE — THE VENUE", [
        { text: "Service Side — Clients · Entrepreneurs", tinted: false },
        { text: "Market Shop — Vendors · Consumers", tinted: false },
      ])}
      {block(T.amber, T.amber, "WAVE OS — STANDALONE SOFTWARE BRAND", [
        { text: "WAVE TIERS, WAVEshop OS", tinted: true },
        { text: "What is WAVE OS?", tinted: true },
      ])}
      <div style={{ background: T.amberTint, border: `0.5px solid #D9B88A`, borderRadius: 6, padding: "7px 10px", fontSize: 11, color: T.amber, ...mono, transition: "box-shadow 0.2s ease" }} {...hoverGlowSm}>
        Logic gate: consumers cannot access service side
      </div>
    </div>
  );
}

function HeroSection() {
  const ref = useScrollTracking('hero');
  return (
    <section ref={ref} style={{ background: "#ECECED", padding: "32px 16px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 380px", minWidth: 0 }}>
        <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 14, letterSpacing: "0.06em", fontWeight: 700, fontStyle: "italic" }}>// SERVICE · COMMUNITY · NATIONWIDE</div>
        <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.75rem)", fontWeight: 800, color: T.dark, lineHeight: 1.12, marginBottom: 16 }}>
          Built for the worker.<br />Not the <span style={{ color: T.amber }}>algorithm.</span>
        </h1>
        <p style={{ fontSize: 15, color: T.dark, lineHeight: 1.6, marginBottom: 26, fontWeight: 400 }}>
          <strong>Free profile.</strong> Respond to leads at $0. Pay 18% only when work closes. <strong>No lead fees. No shared leads. No spam.</strong>
        </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28, flexDirection: "column", alignItems: "flex-start" }}>
            <Link to="/PostJob" style={buttonStyle("#fff", T.dark, `2px solid ${T.border}`)}>
              Post a Job — Free
            </Link>
            <Link to="/BecomeContractor" style={buttonStyle(T.amberBg, T.amber, `2px solid #D9B88A`)}>
              Join as Entrepreneur
            </Link>
          </div>
          <div style={{ display: "flex", background: "#fff", border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: "hidden", transition: "box-shadow 0.2s ease", width: "100%" }} {...hoverGlowSm}>
            {[
              { amount: "$0", label: "Profile & listing", amber: true },
              { amount: "5%", label: "Vendors fee", amber: false },
              { amount: "18%", label: "Entrepreneurs fee", amber: true },
            ].map(({ amount, label, amber }, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", padding: "12px 4px", borderRight: i < 2 ? `1px solid ${T.border}` : "none", minWidth: 0 }}>
                <div style={{ ...mono, fontSize: 20, fontWeight: 700, color: amber ? T.amber : T.dark }}>{amount}</div>
                <div style={{ fontSize: 10, color: T.dark, marginTop: 3, lineHeight: 1.3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: "1 1 300px", minWidth: 0 }}>
          <HeroPlatformCard />
        </div>
      </div>
    </section>
  );
}

// ── Tabbed Platform Section ────────────────────────────────────
const TAB_DATA = [
  {
    id: "roles",
    label: "Who It's For",
    content: () => {
      const roles = [
        {
          topBorder: T.dark,
          labelColor: T.muted,
          label: "SERVICE SIDE · CLIENT",
          heading: "The Hirer",
          desc: "Post jobs free. Send an RFP for $1.75 directly to any contractor. A $1.50 session opens a 60-minute communication window.",
          tags: [["POST JOB · FREE", false], ["RFP · $1.75", true], ["SESSION · $1.50", false]],
          cta: { label: "Post a Job", to: "/PostJob" },
        },
        {
          topBorder: T.amber,
          labelColor: T.amber,
          label: "SERVICE SIDE · ENTREPRENEUR",
          heading: "The Worker",
          desc: "Respond to every lead for free. Pay 18% only when a job closes through the platform. WAVE OS is optional.",
          tags: [["RESPOND · $0", false], ["18% ON CLOSE", false], ["WAVE OS OPTIONAL", true]],
          cta: { label: "Join as Entrepreneur", to: "/BecomeContractor" },
        },
        {
          topBorder: T.border,
          labelColor: "#444",
          label: "MARKET SHOP · VENDOR",
          heading: "The Seller",
          desc: "Claim a booth or space at a farmers market or swap meet. Upgrade to WAVEshop OS for live inventory management.",
          tags: [["BOOTH", false], ["SPACE", false], ["WAVEshop OS · $35/mo", false]],
          cta: { label: "Open a Shop", to: "/MarketShopSignup" },
        },
        {
          topBorder: T.border,
          labelColor: "#444",
          label: "MARKET SHOP · CONSUMER",
          heading: "The Shopper",
          desc: "Browse and shop from local vendors. Consumer accounts are scoped to Market Shop only — no service side access.",
          tags: [["MARKET SHOP ONLY", false], ["NO SERVICE SIDE", true]],
          cta: { label: "Browse Markets", to: "/MarketDirectory" },
        },
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

function TabbedSection() {
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
              style={{
                ...tabButtonBase,
                ...mono,
                borderRight: `1px solid ${T.border}`,
                background: active === t.id ? T.amberTint : "transparent",
                color: active === t.id ? T.amber : T.muted,
                fontWeight: active === t.id ? 700 : 400,
              }}
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

// ── Integrity Section ──────────────────────────────────────────
function IntegritySection() {
  const ref = useScrollTracking('integrity');
  return (
    <section ref={ref} style={{ background: "#F5F5F6", padding: "40px 16px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 10, letterSpacing: "0.06em", fontWeight: 700, fontStyle: "italic" }}>// INTEGRITY & ACCOUNT HOLD ENFORCEMENT</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: T.dark, marginBottom: 8, fontStyle: "italic" }}>100% compliance. Automated.</h2>
        <p style={{ fontSize: 14, color: T.dark, marginBottom: 28, lineHeight: 1.6, fontWeight: 700, fontStyle: "italic" }}>Non-compliance triggers immediate account holds with no manual review required.</p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          {[
            { label: "TRIGGER_01 // 72HR_PHOTO_RULE", heading: "72-Hour Photo Rule", desc: "Entrepreneurs must upload after-photos within 72 hours of the agreed work date. Failure triggers an immediate account hold blocking all platform activity.", badge: "immediate account hold" },
            { label: "TRIGGER_02 // MUTUAL_RATINGS", heading: "Mandatory Mutual Ratings", desc: "Both parties must submit ratings at closeout. Non-compliant accounts are held until the rating is submitted.", badge: "hold: non-compliant party only" },
          ].map((c) => (
            <div key={c.label} style={{ ...cardStyle, flex: "1 1 240px", padding: 20 }} {...hoverGlow}>
              <div style={{ ...mono, fontSize: 10, color: T.muted, marginBottom: 8, letterSpacing: "0.06em", fontWeight: 700, fontStyle: "italic" }}>{c.label}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: T.dark, marginBottom: 8, fontStyle: "italic" }}>{c.heading}</h3>
              <p style={{ fontSize: 13, color: T.dark, lineHeight: 1.6, marginBottom: 12 }}>{c.desc}</p>
              <span style={{ ...mono, fontSize: 10, background: T.amberTint, border: `0.5px solid #D9B88A`, color: T.amber, borderRadius: 4, padding: "3px 8px" }}>{c.badge}</span>
            </div>
          ))}
        </div>

        <div style={{ ...cardStyle, padding: 18 }} {...hoverGlow}>
          <div style={{ ...mono, fontSize: 10, color: T.muted, marginBottom: 8, letterSpacing: "0.06em" }}>HOLD STATUS — FULL PLATFORM BLOCK</div>
          <p style={{ fontSize: 13, color: T.dark, lineHeight: 1.6 }}>A hold blocks all platform activity — job applications, messaging, payments, and RFP access — until the required action is completed. Holds lift automatically once compliance is confirmed.</p>
        </div>
      </div>
    </section>
  );
}

// ── Launch Engine ──────────────────────────────────────────────
function LaunchEngineSection() {
  const cards = [
    { topBorder: T.dark, number: "100", numberColor: T.dark, label: "FOUNDING_100", desc: "The first 100 entrepreneurs receive 1 full year of all-access free. No credit card. No catch.", tag: "1 year all-access free", amber: true },
    { topBorder: "transparent", number: "14", numberColor: "#AAA", label: "STANDARD_TRIAL", desc: "After Founding 100 fills, new entrepreneurs start with a 14-day free trial to explore the platform.", tag: "standard onboarding", amber: false },
    { topBorder: T.amber, number: "5:1", numberColor: T.amber, label: "THE_5_FOR_1_LOOP", desc: "During your trial, refer 5 signups to earn 1 extra free day. Stackable. Trial window only.", tag: "trial window only", amber: true },
  ];

  const ref = useScrollTracking('launch_engine');
  return (
    <section style={{ background: T.bg, padding: "40px 16px" }}>
      <div ref={ref} style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.06em", fontWeight: 700, fontStyle: "italic" }}>// LAUNCH ENGINE</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: T.dark, marginBottom: 8, fontStyle: "italic" }}>Three mechanics. One flywheel.</h2>
        <p style={{ fontSize: 14, color: T.dark, marginBottom: 28, lineHeight: 1.6, fontWeight: 700, fontStyle: "italic" }}>Each mechanic feeds the next. Early movers win.</p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {cards.map((c) => (
            <div key={c.label} style={{ ...cardStyle, borderTop: `3px solid ${c.topBorder}`, padding: 20, flex: "1 1 200px" }} {...hoverGlow}>
              <div style={{ ...mono, fontSize: 38, fontWeight: 700, color: c.numberColor, marginBottom: 4 }}>{c.number}</div>
              <div style={{ ...mono, fontSize: 10, color: T.muted, marginBottom: 10, letterSpacing: "0.06em" }}>{c.label}</div>
              <p style={{ fontSize: 13, color: T.dark, lineHeight: 1.6, marginBottom: 12 }}>{c.desc}</p>
              {tag(c.tag, c.amber)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



function CTABar() {
  const ref = useScrollTracking('cta_bar');
  return (
    <section ref={ref} style={{ background: T.dark, padding: "44px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Ready to run your business on WAVE OS?</h2>
          <p style={{ fontSize: 14, color: "#bbb" }}>Free to start. No lead fees. California-born. Nationwide.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/BecomeContractor" style={{ textDecoration: "none", display: "inline-block", background: "#fff", color: T.dark, border: "none", borderRadius: 6, padding: "11px 18px", fontSize: 14, fontWeight: 700 }}>Join the Founding 100</Link>
        </div>
      </div>
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────────
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