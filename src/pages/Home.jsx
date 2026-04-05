import { useState } from "react";
import { Link } from "react-router-dom";

const T = {
  bg: "#EBEBEC",
  card: "#fff",
  dark: "#1A1A1B",
  sub: "#555",
  muted: "#888",
  border: "#D0D0D2",
  amber: "#8C5E10",
  amberBg: "#F0E0C0",
  amberTint: "#FBF5EC",
  shadow: "3px 3px 0px #8C5E10",
};

const cardStyle = {
  background: T.card,
  border: `0.5px solid ${T.border}`,
  borderRadius: 10,
  boxShadow: T.shadow,
};

const mono = { fontFamily: "monospace" };

const tag = (text, amber) => (
  <span
    key={text}
    style={{
      display: "inline-block",
      ...mono,
      fontSize: 10,
      padding: "3px 8px",
      borderRadius: 4,
      border: `0.5px solid ${amber ? "#D9B88A" : T.border}`,
      background: amber ? T.amberTint : T.bg,
      color: amber ? T.amber : T.muted,
      marginRight: 4,
      marginTop: 4,
    }}
  >
    {text}
  </span>
);

// ── Logo ───────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ lineHeight: 1.1 }}>
      <span
        style={{
          fontWeight: 800,
          fontSize: 22,
          background: "linear-gradient(90deg, #e84e1b 0%, #7c3aed 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        SurfCoast
      </span>
      <div style={{ ...mono, fontSize: 8, color: "#999", letterSpacing: "0.18em", marginTop: 1 }}>
        MARKETPLACE
      </div>
    </div>
  );
}

// ── Ticker ─────────────────────────────────────────────────────
function TickerBar() {
  return (
    <div style={{ background: T.dark, padding: "6px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
      <span style={{ ...mono, fontSize: 11, color: "#aaa" }}>founding_100 — 77 spots remaining · 1 year all-access free</span>
      <span style={{ ...mono, fontSize: 11, color: T.amber }}>California · Nationwide</span>
    </div>
  );
}

// ── Navbar ─────────────────────────────────────────────────────
function Navbar() {
  const [enterOpen, setEnterOpen] = useState(false);

  return (
    <nav style={{ background: "#fff", borderBottom: `1px solid ${T.border}`, padding: "12px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <Link to="/" style={{ textDecoration: "none", marginRight: 20 }}><Logo /></Link>

      <div style={{ display: "flex", gap: 20, flex: 1, justifyContent: "center", flexWrap: "wrap" }}>
        {[
          { label: "Market Shop", to: "/MarketShopSignup" },
          { label: "About Us", to: "/About" },
          { label: "Pricing", to: "/Pricing" },
        ].map(({ label, to }) => (
          <Link key={label} to={to} style={{ textDecoration: "none", fontSize: 14, color: T.sub, fontWeight: 500 }}>
            {label}
          </Link>
        ))}
      </div>

      <div style={{ position: "relative" }}>
        <button
          onClick={() => setEnterOpen((v) => !v)}
          style={{ background: T.dark, border: "none", borderRadius: 6, padding: "7px 18px", fontSize: 13, color: "#fff", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
        >
          Enter
          <span style={{ fontSize: 9, opacity: 0.7 }}>▼</span>
        </button>

        {enterOpen && (
          <>
            {/* backdrop */}
            <div onClick={() => setEnterOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: "#fff", border: `1px solid ${T.border}`, borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", minWidth: 170, zIndex: 20, overflow: "hidden" }}>
              <Link to="/Dashboard" style={{ textDecoration: "none" }} onClick={() => setEnterOpen(false)}>
                <div style={{ padding: "11px 18px", fontSize: 13, color: T.dark, cursor: "pointer", borderBottom: `1px solid ${T.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = T.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  Sign In
                </div>
              </Link>
              <Link to="/BecomeContractor" style={{ textDecoration: "none" }} onClick={() => setEnterOpen(false)}>
                <div style={{ padding: "11px 18px", fontSize: 13, color: T.amber, fontWeight: 700, cursor: "pointer", borderBottom: `1px solid ${T.border}`, background: T.amberTint }}
                  onMouseEnter={e => e.currentTarget.style.background = T.amberBg}
                  onMouseLeave={e => e.currentTarget.style.background = T.amberTint}>
                  I'm a Pro
                </div>
              </Link>
              <Link to="/PostJob" style={{ textDecoration: "none" }} onClick={() => setEnterOpen(false)}>
                <div style={{ padding: "11px 18px", fontSize: 13, color: "#fff", fontWeight: 700, cursor: "pointer", background: T.dark }}
                  onMouseEnter={e => e.currentTarget.style.background = "#333"}
                  onMouseLeave={e => e.currentTarget.style.background = T.dark}>
                  Need a Pro
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

// ── Hero ───────────────────────────────────────────────────────
function HeroPlatformCard() {
  const block = (borderColor, labelColor, labelText, tiles) => (
    <div style={{ borderLeft: `3px solid ${borderColor}`, paddingLeft: 12, marginBottom: 14 }}>
      <div style={{ ...mono, fontSize: 10, color: labelColor, marginBottom: 8, letterSpacing: "0.06em" }}>{labelText}</div>
      {tiles.map(({ text, tinted }) => (
        <div key={text} style={{ background: tinted ? T.amberTint : T.bg, border: `0.5px solid ${tinted ? "#D9B88A" : T.border}`, borderRadius: 6, padding: "6px 10px", fontSize: 12, color: tinted ? T.amber : T.sub, marginBottom: 5, ...mono }}>
          {text}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ ...cardStyle, padding: 20, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
        <span style={{ ...mono, fontSize: 11, color: T.muted }}>surfcoast / platform_map</span>
        <span style={{ ...mono, fontSize: 11, color: T.amber }}>● live</span>
      </div>
      {block(T.border, T.muted, "SURFCOAST MARKETPLACE — THE VENUE", [
        { text: "Service Side — Clients · Contractors", tinted: false },
        { text: "Market Shop — Vendors · Consumers", tinted: false },
      ])}
      {block(T.amber, T.amber, "WAVE OS — STANDALONE SOFTWARE BRAND", [
        { text: "WAVE Service — Starter → Premium", tinted: true },
        { text: "WAVEshop OS — Vendor software", tinted: true },
      ])}
      <div style={{ background: T.amberTint, border: `0.5px solid #D9B88A`, borderRadius: 6, padding: "7px 10px", fontSize: 11, color: T.amber, ...mono }}>
        Logic gate: consumers cannot access service side
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section style={{ background: "#fff", padding: "56px 24px 44px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 48, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 380px", minWidth: 0 }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 14, letterSpacing: "0.06em" }}>// PLATFORM · CALIFORNIA · NATIONWIDE</div>
          <h1 style={{ fontSize: 44, fontWeight: 800, color: T.dark, lineHeight: 1.12, marginBottom: 16 }}>
            Built for the worker.<br />Not the <span style={{ color: T.amber }}>algorithm.</span>
          </h1>
          <p style={{ fontSize: 15, color: "#444", lineHeight: 1.65, marginBottom: 26 }}>
            SurfCoast Marketplace is the venue. WAVE OS is the software. Together they form the complete operating system for the modern sole-proprietor.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
            <Link to="/PostJob" style={{ textDecoration: "none" }}>
              <button style={{ background: T.dark, color: "#fff", border: "none", borderRadius: 6, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Post a Job — Free</button>
            </Link>
            <Link to="/wave-os-details" style={{ textDecoration: "none" }}>
              <button style={{ background: T.amberBg, color: T.amber, border: "none", borderRadius: 6, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Explore WAVE OS</button>
            </Link>
            <Link to="/BecomeContractor" style={{ textDecoration: "none" }}>
              <button style={{ background: "transparent", color: T.dark, border: `1px solid ${T.border}`, borderRadius: 6, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Join as Contractor</button>
            </Link>
          </div>
          <div style={{ display: "flex", border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
            {[
              { amount: "$0", label: "To respond to leads", amber: true },
              { amount: "18%", label: "Facilitation fee only", amber: false },
              { amount: "$19", label: "WAVE OS starts at", amber: true },
            ].map(({ amount, label, amber }, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", padding: "12px 8px", borderRight: i < 2 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ ...mono, fontSize: 20, fontWeight: 700, color: amber ? T.amber : T.dark }}>{amount}</div>
                <div style={{ fontSize: 11, color: T.sub, marginTop: 3 }}>{label}</div>
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
          label: "SERVICE SIDE · CONTRACTOR",
          heading: "The Worker",
          desc: "Respond to every lead for free. Pay 18% only when a job closes through the platform. WAVE OS is optional.",
          tags: [["RESPOND · $0", false], ["18% ON CLOSE", false], ["WAVE OS OPTIONAL", true]],
          cta: { label: "Join as Contractor", to: "/BecomeContractor" },
        },
        {
          topBorder: T.border,
          labelColor: "#777",
          label: "MARKET SHOP · VENDOR",
          heading: "The Seller",
          desc: "Claim a booth or space at a farmers market or swap meet. Upgrade to WAVEshop OS for live inventory management.",
          tags: [["BOOTH", false], ["SPACE", false], ["WAVEshop OS · $35/mo", false]],
          cta: { label: "Open a Shop", to: "/MarketShopSignup" },
        },
        {
          topBorder: T.border,
          labelColor: "#777",
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
            <div key={r.label} style={{ ...cardStyle, borderTop: `3px solid ${r.topBorder}`, padding: 20, display: "flex", flexDirection: "column" }}>
              <div style={{ ...mono, fontSize: 10, color: r.labelColor, marginBottom: 8, letterSpacing: "0.06em" }}>{r.label}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: T.dark, marginBottom: 8 }}>{r.heading}</h3>
              <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6, marginBottom: 12, flex: 1 }}>{r.desc}</p>
              <div style={{ marginBottom: 14 }}>{r.tags.map(([t, a]) => tag(t, a))}</div>
              <Link to={r.cta.to} style={{ textDecoration: "none" }}>
                <button style={{ ...mono, fontSize: 11, background: "transparent", border: `1px solid ${T.border}`, borderRadius: 5, padding: "5px 12px", color: T.dark, cursor: "pointer" }}>{r.cta.label} →</button>
              </Link>
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
        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.bg}` }}>
          <div>
            <div style={{ fontSize: 13, color: T.dark, fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: 11, color: T.muted }}>{note}</div>
          </div>
          <span style={{ ...mono, fontSize: 14, fontWeight: 700, color: amberVal ? T.amber : T.dark }}>{value}</span>
        </div>
      );
      return (
        <div>
          <p style={{ fontSize: 14, color: T.sub, marginBottom: 24, lineHeight: 1.6 }}>We never charge a contractor to respond to a lead. Every fee is a filter that keeps the platform signal high.</p>
          <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 240px", paddingRight: 28 }}>
              <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 12, letterSpacing: "0.06em" }}>FOR CONTRACTORS</div>
              {row("Facilitation fee", "on job close", "18%", false)}
              {row("Respond to RFP", "no upfront cost", "$0", true)}
              {row("Timed session", "60-min window", "$1.50", false)}
              {row("Unlimited messaging", "monthly add-on", "$50/mo", false)}
              {row("Basic Dashboard", "always included", "Free", true)}
            </div>
            <div style={{ width: 1, background: T.border, flexShrink: 0 }} />
            <div style={{ flex: "1 1 240px", paddingLeft: 28 }}>
              <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 12, letterSpacing: "0.06em" }}>FOR CLIENTS</div>
              {row("Job posting", "no account needed", "$0", true)}
              {row("Request for Proposal", "direct to contractor", "$1.75", false)}
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
          <p style={{ fontSize: 14, color: T.sub, marginBottom: 24, lineHeight: 1.6 }}>Post one project and hire multiple trade specialists independently. Slots close as contractors are hired — no double-booking, no confusion.</p>
          <div style={{ background: T.bg, borderRadius: 10, padding: 20 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.dark, marginBottom: 4 }}>Kitchen Renovation — Full Project</div>
              <div style={{ ...mono, fontSize: 11, color: T.muted }}>Posted by: Client · Budget: $18,000 · Timeline: 6 weeks</div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {slots.map((s) => (
                <div key={s.trade} style={{ flex: "1 1 110px", background: s.filled ? T.amberTint : "#fff", border: `0.5px solid ${s.filled ? "#D9B88A" : T.border}`, borderRadius: 8, padding: "14px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, color: s.filled ? T.amber : "#CCC", marginBottom: 5 }}>{s.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: s.filled ? T.dark : "#AAA", marginBottom: 4 }}>{s.trade}</div>
                  <div style={{ ...mono, fontSize: 10, color: s.filled ? T.amber : "#CCC" }}>{s.status}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Link to="/PostJob" style={{ textDecoration: "none" }}>
              <button style={{ ...mono, fontSize: 11, background: T.dark, color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer" }}>Post a multi-trade job →</button>
            </Link>
          </div>
        </div>
      );
    },
  },
];

function TabbedSection() {
  const [active, setActive] = useState("roles");
  const current = TAB_DATA.find((t) => t.id === active);

  return (
    <section style={{ background: T.bg, padding: "52px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.06em" }}>// PLATFORM OVERVIEW</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: T.dark, marginBottom: 24 }}>How the platform works.</h2>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 0, marginBottom: 28, background: "#fff", border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: "hidden", width: "fit-content" }}>
          {TAB_DATA.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              style={{
                ...mono,
                fontSize: 12,
                padding: "9px 20px",
                border: "none",
                borderRight: `1px solid ${T.border}`,
                background: active === t.id ? T.amberTint : "transparent",
                color: active === t.id ? T.amber : T.muted,
                fontWeight: active === t.id ? 700 : 400,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>{current && current.content()}</div>
      </div>
    </section>
  );
}

// ── Integrity Section ──────────────────────────────────────────
function IntegritySection() {
  return (
    <section style={{ background: "#F5F5F6", padding: "52px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 10, letterSpacing: "0.06em" }}>// INTEGRITY & ACCOUNT HOLD ENFORCEMENT</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: T.dark, marginBottom: 8 }}>100% compliance. Automated.</h2>
        <p style={{ fontSize: 14, color: T.sub, marginBottom: 28, lineHeight: 1.6 }}>Non-compliance triggers immediate account holds with no manual review required.</p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          {[
            { label: "TRIGGER_01 // 72HR_PHOTO_RULE", heading: "72-Hour Photo Rule", desc: "Contractors must upload after-photos within 72 hours of the agreed work date. Failure triggers an immediate account hold blocking all platform activity.", badge: "immediate account hold" },
            { label: "TRIGGER_02 // MUTUAL_RATINGS", heading: "Mandatory Mutual Ratings", desc: "Both parties must submit ratings at closeout. Non-compliant accounts are held until the rating is submitted.", badge: "hold: non-compliant party only" },
          ].map((c) => (
            <div key={c.label} style={{ ...cardStyle, flex: "1 1 240px", padding: 20 }}>
              <div style={{ ...mono, fontSize: 10, color: T.muted, marginBottom: 8, letterSpacing: "0.06em" }}>{c.label}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: T.dark, marginBottom: 8 }}>{c.heading}</h3>
              <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6, marginBottom: 12 }}>{c.desc}</p>
              <span style={{ ...mono, fontSize: 10, background: T.amberTint, border: `0.5px solid #D9B88A`, color: T.amber, borderRadius: 4, padding: "3px 8px" }}>{c.badge}</span>
            </div>
          ))}
        </div>

        <div style={{ ...cardStyle, padding: 18 }}>
          <div style={{ ...mono, fontSize: 10, color: T.muted, marginBottom: 8, letterSpacing: "0.06em" }}>HOLD STATUS — FULL PLATFORM BLOCK</div>
          <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>A hold blocks all platform activity — job applications, messaging, payments, and RFP access — until the required action is completed. Holds lift automatically once compliance is confirmed.</p>
        </div>
      </div>
    </section>
  );
}

// ── Launch Engine ──────────────────────────────────────────────
function LaunchEngineSection() {
  const cards = [
    { topBorder: T.dark, number: "100", numberColor: T.dark, label: "FOUNDING_100", desc: "The first 100 contractors receive 1 full year of all-access free. No credit card. No catch.", tag: "1 year all-access free", amber: true },
    { topBorder: "transparent", number: "14", numberColor: "#AAA", label: "STANDARD_TRIAL", desc: "After Founding 100 fills, new contractors start with a 14-day free trial to explore the platform.", tag: "standard onboarding", amber: false },
    { topBorder: T.amber, number: "5:1", numberColor: T.amber, label: "THE_5_FOR_1_LOOP", desc: "During your trial, refer 5 signups to earn 1 extra free day. Stackable. Trial window only.", tag: "trial window only", amber: true },
  ];

  return (
    <section style={{ background: T.bg, padding: "52px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.06em" }}>// LAUNCH ENGINE</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: T.dark, marginBottom: 8 }}>Three mechanics. One flywheel.</h2>
        <p style={{ fontSize: 14, color: T.sub, marginBottom: 28, lineHeight: 1.6 }}>Each mechanic feeds the next. Early movers win.</p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {cards.map((c) => (
            <div key={c.label} style={{ ...cardStyle, borderTop: `3px solid ${c.topBorder}`, padding: 20, flex: "1 1 200px" }}>
              <div style={{ ...mono, fontSize: 38, fontWeight: 700, color: c.numberColor, marginBottom: 4 }}>{c.number}</div>
              <div style={{ ...mono, fontSize: 10, color: T.muted, marginBottom: 10, letterSpacing: "0.06em" }}>{c.label}</div>
              <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6, marginBottom: 12 }}>{c.desc}</p>
              {tag(c.tag, c.amber)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Bar ────────────────────────────────────────────────────
function CTABar() {
  return (
    <section style={{ background: T.dark, padding: "44px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Ready to run your business on WAVE OS?</h2>
          <p style={{ fontSize: 14, color: "#666" }}>Free to start. No lead fees. California-born. Nationwide.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/BecomeContractor" style={{ textDecoration: "none" }}>
            <button style={{ background: "#fff", color: T.dark, border: "none", borderRadius: 6, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Join the Founding 100</button>
          </Link>
          <Link to="/PostJob" style={{ textDecoration: "none" }}>
            <button style={{ background: "transparent", color: "#888", border: `1px solid #444`, borderRadius: 6, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Post an RFP</button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────
function Footer() {
  const col = (header, links) => (
    <div style={{ flex: "1 1 150px" }}>
      <div style={{ ...mono, fontSize: 10, color: "#888", marginBottom: 14, letterSpacing: "0.1em" }}>{header}</div>
      {links.map(({ label, to }) => (
        <div key={label} style={{ marginBottom: 8 }}>
          <Link to={to} style={{ fontSize: 13, color: "#555", textDecoration: "none" }}>{label}</Link>
        </div>
      ))}
    </div>
  );

  return (
    <footer style={{ background: T.dark }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 24px 24px" }}>
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap", marginBottom: 36 }}>
          <div style={{ flex: "1 1 200px" }}>
            <Logo />
            <div style={{ ...mono, fontSize: 9, color: "#555", letterSpacing: "0.14em", marginTop: 4, marginBottom: 10 }}>MARKETPLACE · WAVE OS</div>
            <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6, maxWidth: 210 }}>The complete operating system for California's independent workforce.</p>
          </div>
          {col("PLATFORM", [
            { label: "Marketplace", to: "/FindContractors" },
            { label: "WAVE OS", to: "/wave-os-details" },
            { label: "WAVEshop OS", to: "/MarketShopSignup" },
            { label: "RFP Engine", to: "/PostJob" },
            { label: "Founding 100", to: "/BecomeContractor" },
          ])}
          {col("COMPANY", [
            { label: "About", to: "/About" },
            { label: "Pricing", to: "/Pricing" },
            { label: "Blog", to: "/Blog" },
            { label: "Terms", to: "/Terms" },
            { label: "Privacy", to: "/PrivacyPolicy" },
          ])}
        </div>
        <div style={{ borderTop: `1px solid #2a2a2b`, paddingTop: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ ...mono, fontSize: 11, color: "#555" }}>© {new Date().getFullYear()} SurfCoast. All rights reserved.</span>
          <span style={{ ...mono, fontSize: 11, color: "#555" }}>toll-road model · not a lead farm</span>
        </div>
      </div>
    </footer>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function Home() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh" }}>
      <TickerBar />
      <Navbar />
      <HeroSection />
      <TabbedSection />
      <IntegritySection />
      <LaunchEngineSection />
      <CTABar />
      <Footer />
    </div>
  );
}