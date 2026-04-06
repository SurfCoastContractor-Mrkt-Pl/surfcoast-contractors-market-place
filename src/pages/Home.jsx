import { useState } from "react";
import { Link } from "react-router-dom";

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

// ── Ticker ─────────────────────────────────────────────────────
function TickerBar() {
  return (
    <div style={{ background: T.dark, padding: "6px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
      <span style={{ ...mono, fontSize: 11, color: "#e0e0e0" }}>founding_100 — 77 spots remaining · 1 year all-access free</span>
      <span style={{ ...mono, fontSize: 11, color: T.amber }}>California · Nationwide</span>
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
        { text: "Service Side — Clients · Contractors", tinted: false },
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
  return (
    <section style={{ background: "#fff", padding: "56px 24px 44px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 48, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 380px", minWidth: 0 }}>
        <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 14, letterSpacing: "0.06em" }}>// SERVICE · COMMUNITY · NATIONWIDE</div>
        <h1 style={{ fontSize: 44, fontWeight: 800, color: T.dark, lineHeight: 1.12, marginBottom: 16 }}>
          Built for the worker.<br />Not the <span style={{ color: T.amber }}>algorithm.</span>
        </h1>
        <p style={{ fontSize: 15, color: T.dark, lineHeight: 1.65, marginBottom: 26 }}>
          SurfCoast CMP — also known as SurfCoast Contractors Marketplace and SurfCoast Marketplace — connects everyday workers with everyday people across the USA. Your profile and listing are free. Communication sessions start at $1.50 per 10 minutes. A facilitation fee of 18% applies only when work is successfully completed through the platform.
        </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "nowrap", marginBottom: 28, overflowX: "auto" }}>
            <Link to="/PostJob" style={{ textDecoration: "none", flexShrink: 0 }}>
              <button style={{ background: "#fff", color: T.dark, border: `1px solid ${T.border}`, borderRadius: 5, padding: "7px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", transition: "box-shadow 0.2s ease" }} onMouseEnter={e => e.currentTarget.style.boxShadow = purpleBlueGlow} onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>Post a Job — Free</button>
            </Link>
            <Link to="/wave-os-details" style={{ textDecoration: "none", flexShrink: 0 }}>
              <button style={{ background: T.amberBg, color: T.amber, border: `1px solid #D9B88A`, borderRadius: 5, padding: "7px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", transition: "box-shadow 0.2s ease" }} onMouseEnter={e => e.currentTarget.style.boxShadow = purpleBlueGlow} onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>What is WAVE OS?</button>
            </Link>
            <Link to="/BecomeContractor" style={{ textDecoration: "none", flexShrink: 0 }}>
              <button style={{ background: "#fff", color: T.dark, border: `1px solid ${T.border}`, borderRadius: 5, padding: "7px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", transition: "box-shadow 0.2s ease" }} onMouseEnter={e => e.currentTarget.style.boxShadow = purpleBlueGlow} onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>Join as Contractor</button>
            </Link>
            <Link to="/MarketShopSignup" style={{ textDecoration: "none", flexShrink: 0 }}>
              <button style={{ background: "#fff", color: T.dark, border: `1px solid ${T.border}`, borderRadius: 5, padding: "7px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", transition: "box-shadow 0.2s ease" }} onMouseEnter={e => e.currentTarget.style.boxShadow = purpleBlueGlow} onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>Market Shop</button>
            </Link>
          </div>
          <div style={{ display: "flex", border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: "hidden", transition: "box-shadow 0.2s ease" }} {...hoverGlowSm}>
            {[
              { amount: "$0", label: "Profile and listing", amber: true },
              { amount: "5%", label: "Facilitation fee (vendors)", amber: false },
              { amount: "18%", label: "Facilitation fee (contractors)", amber: true },
            ].map(({ amount, label, amber }, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", padding: "12px 8px", borderRight: i < 2 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ ...mono, fontSize: 20, fontWeight: 700, color: amber ? T.amber : T.dark }}>{amount}</div>
                <div style={{ fontSize: 11, color: T.dark, marginTop: 3 }}>{label}</div>
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
              <div style={{ ...mono, fontSize: 10, color: r.labelColor, marginBottom: 8, letterSpacing: "0.06em" }}>{r.label}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: T.dark, marginBottom: 8 }}>{r.heading}</h3>
              <p style={{ fontSize: 13, color: T.dark, lineHeight: 1.6, marginBottom: 12, flex: 1 }}>{r.desc}</p>
              <div style={{ marginBottom: 14 }}>{r.tags.map(([t, a]) => tag(t, a))}</div>
              <Link to={r.cta.to} style={{ textDecoration: "none" }}>
                <button style={{ ...mono, fontSize: 11, background: "transparent", border: `1px solid ${T.border}`, borderRadius: 5, padding: "5px 12px", color: T.dark, cursor: "pointer", transition: "box-shadow 0.2s ease" }} {...hoverGlowSm}>{r.cta.label} →</button>
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
        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.bg}`, transition: "box-shadow 0.2s ease", borderRadius: 4 }} {...hoverGlowSm}>
          <div>
            <div style={{ fontSize: 13, color: T.dark, fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: 11, color: "#444" }}>{note}</div>
          </div>
          <span style={{ ...mono, fontSize: 14, fontWeight: 700, color: amberVal ? T.amber : T.dark }}>{value}</span>
        </div>
      );
      return (
        <div>
          <p style={{ fontSize: 14, color: T.dark, marginBottom: 24, lineHeight: 1.6 }}>We never charge a contractor to respond to a lead. Every fee is a filter that keeps the platform signal high.</p>
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
          <p style={{ fontSize: 14, color: T.dark, marginBottom: 24, lineHeight: 1.6 }}>Post one project and hire multiple trade specialists independently. Slots close as contractors are hired — no double-booking, no confusion.</p>
          <div style={{ background: T.bg, borderRadius: 10, padding: 20, transition: "box-shadow 0.2s ease" }} {...hoverGlowSm}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.dark, marginBottom: 4 }}>Kitchen Renovation — Full Project</div>
              <div style={{ ...mono, fontSize: 11, color: "#444" }}>Posted by: Client · Budget: $18,000 · Timeline: 6 weeks</div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {slots.map((s) => (
                <div key={s.trade} style={{ flex: "1 1 110px", background: s.filled ? T.amberTint : "#fff", border: `0.5px solid ${s.filled ? "#D9B88A" : T.border}`, borderRadius: 8, padding: "14px 12px", textAlign: "center", transition: "box-shadow 0.2s ease" }} {...hoverGlowSm}>
                  <div style={{ fontSize: 18, color: s.filled ? T.amber : "#777", marginBottom: 5 }}>{s.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: s.filled ? T.dark : "#555", marginBottom: 4 }}>{s.trade}</div>
                  <div style={{ ...mono, fontSize: 10, color: s.filled ? T.amber : "#666" }}>{s.status}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Link to="/PostJob" style={{ textDecoration: "none" }}>
              <button style={{ ...mono, fontSize: 11, background: T.dark, color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer", transition: "box-shadow 0.2s ease" }} {...hoverGlowSm}>Post a multi-trade job →</button>
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

        <div style={{ display: "flex", gap: 0, marginBottom: 28, background: "#fff", border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: "hidden", width: "fit-content" }}>
          {TAB_DATA.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = goldGlowSm; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
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
                transition: "background 0.15s, box-shadow 0.2s ease",
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
  return (
    <section style={{ background: "#F5F5F6", padding: "52px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 10, letterSpacing: "0.06em" }}>// INTEGRITY & ACCOUNT HOLD ENFORCEMENT</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: T.dark, marginBottom: 8 }}>100% compliance. Automated.</h2>
        <p style={{ fontSize: 14, color: T.dark, marginBottom: 28, lineHeight: 1.6 }}>Non-compliance triggers immediate account holds with no manual review required.</p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          {[
            { label: "TRIGGER_01 // 72HR_PHOTO_RULE", heading: "72-Hour Photo Rule", desc: "Contractors must upload after-photos within 72 hours of the agreed work date. Failure triggers an immediate account hold blocking all platform activity.", badge: "immediate account hold" },
            { label: "TRIGGER_02 // MUTUAL_RATINGS", heading: "Mandatory Mutual Ratings", desc: "Both parties must submit ratings at closeout. Non-compliant accounts are held until the rating is submitted.", badge: "hold: non-compliant party only" },
          ].map((c) => (
            <div key={c.label} style={{ ...cardStyle, flex: "1 1 240px", padding: 20 }} {...hoverGlow}>
              <div style={{ ...mono, fontSize: 10, color: T.muted, marginBottom: 8, letterSpacing: "0.06em" }}>{c.label}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: T.dark, marginBottom: 8 }}>{c.heading}</h3>
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
    { topBorder: T.dark, number: "100", numberColor: T.dark, label: "FOUNDING_100", desc: "The first 100 contractors receive 1 full year of all-access free. No credit card. No catch.", tag: "1 year all-access free", amber: true },
    { topBorder: "transparent", number: "14", numberColor: "#AAA", label: "STANDARD_TRIAL", desc: "After Founding 100 fills, new contractors start with a 14-day free trial to explore the platform.", tag: "standard onboarding", amber: false },
    { topBorder: T.amber, number: "5:1", numberColor: T.amber, label: "THE_5_FOR_1_LOOP", desc: "During your trial, refer 5 signups to earn 1 extra free day. Stackable. Trial window only.", tag: "trial window only", amber: true },
  ];

  return (
    <section style={{ background: T.bg, padding: "52px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.06em" }}>// LAUNCH ENGINE</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: T.dark, marginBottom: 8 }}>Three mechanics. One flywheel.</h2>
        <p style={{ fontSize: 14, color: T.dark, marginBottom: 28, lineHeight: 1.6 }}>Each mechanic feeds the next. Early movers win.</p>

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

// ── FAQ Section ───────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "How do contractors find work without paying for leads?",
    a: "SurfCoast Contractors Marketplace (surfcoastcmp.com) allows anyone to create a profile, list their services, and be discovered by clients at no cost — there are zero lead fees and no shared leads. Your profile and listing are always free. When you are ready to communicate with a potential client, a session fee of $1.50 per 10 minutes applies, or $50 per month for unlimited messaging. When a job is booked and completed through the platform, SurfCoast charges an 18% facilitation fee on the job total. Optional WAVE OS business management tools are available starting at $19 per month, unlocked by completing jobs on the platform. The first 100 workers to sign up receive free full access for one year.",
  },
  {
    q: "What is a free alternative to Angi for contractors?",
    a: "SurfCoast CMP — also known as SurfCoast Contractors Marketplace and SurfCoast Marketplace — is a strong alternative to Angi for independent workers in the United States. Unlike Angi, SurfCoast Contractors Marketplace charges no upfront lead fees and does not sell shared leads. Your profile and listing are free. When you are ready to communicate with a potential client, a $1.50 per 10-minute session fee applies — this keeps both sides serious and filters out spam. Workers pay only when work is closed: an 18% facilitation fee per completed job. Optional WAVE OS business management tools start at $19 per month and unlock based on jobs completed — not upfront payment. The first 100 signups receive free full access for one year.",
  },
  {
    q: "Why are contractors leaving Angi and HomeAdvisor?",
    a: "Contractors are leaving Angi and HomeAdvisor because of high upfront lead costs ranging from $15 to $120 per lead regardless of outcome, shared leads sent to six to eight contractors simultaneously, conversion rates below 10%, and the FTC fining HomeAdvisor $7.2 million for deceptive marketing practices. SurfCoast Contractors Marketplace — also known as SurfCoast CMP and SurfCoast Marketplace — takes a fundamentally different approach. There are no upfront lead fees. Your profile and listing are free. Communication is handled through a $1.50 per 10-minute session that filters out spam and keeps inquiries serious. An 18% facilitation fee applies only when a job is successfully closed. No shared leads. No paying for nothing.",
  },
  {
    q: "What is SurfCoast CMP?",
    a: "SurfCoast CMP — also known as SurfCoast Contractors Marketplace and SurfCoast Marketplace — is a nationwide marketplace connecting everyday workers with everyday people across the United States. Whether you are a tradesperson, freelancer, creative, or independent professional, you have a home here. Motivated individuals as young as 13 are welcome. Your profile and listing are free. An 18% facilitation fee applies only on completed jobs.",
  },
  {
    q: "Who founded SurfCoast CMP?",
    a: "SurfCoast Contractors Marketplace was founded in 2026 by Hector A. Navarrete — a plumber who received his C36 license in 2022 and owns SurfCoast Plumbing. The platform is headquartered in the Inland Empire, California. He built it because he lived the same frustrations that every independent worker on here has faced.",
  },
  {
    q: "What is WAVE OS?",
    a: "WAVE OS is the optional business software built into SurfCoast Marketplace. Think of it as your business command center — scheduling, invoicing, job tracking, client management, and analytics. It starts at $19 per month and unlocks as you complete jobs on the platform. You do not need it to use the marketplace. A free Basic Dashboard covers the essentials for everyone.",
  },
  {
    q: "How much does everything cost?",
    a: "Your profile and listing are free. Communication sessions cost $1.50 per 10 minutes or $50 per month for unlimited messaging. Clients pay $1.75 to send a proposal request — a formal request for proposal (RFP) — to a specific worker. The platform charges an 18% facilitation fee only when a job is completed and paid through the platform. Swap Meet vendors pay $20 per month or 5% per sale. The first 100 signups get one full year completely free.",
  },
  {
    q: "What is the Swap Meet?",
    a: "The Swap Meet is a section of SurfCoast Marketplace where everyday people can buy, sell, and trade tools, equipment, materials, and goods with other vendors or directly with consumers. Browsing is free for everyone. When you are ready to purchase, items are paid for at checkout through the platform. Vendors pay either $20 per month flat or a 5% facilitation fee per sale.",
  },
  {
    q: "Do I need to be licensed to join SurfCoast Marketplace?",
    a: "No. SurfCoast is built for everyone — from licensed master tradespeople to someone just starting out. We support over 60 categories of workers including trades, freelancers, creatives, pet sitters, tutors, and more. Motivated individuals as young as 13 are welcome to start building their path here. If you have a skill and the drive to build something with it, you belong here.",
  },
];

function FAQSection() {
  return (
    <section style={{ background: "#fff", padding: "52px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ_ITEMS.map(({ q, a }) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": a },
        })),
      })}} />
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.06em" }}>// FREQUENTLY ASKED QUESTIONS</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: T.dark, marginBottom: 28 }}>Common questions.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: 16 }}>
          {FAQ_ITEMS.map(({ q, a }) => (
            <div key={q} style={{ ...cardStyle, padding: 24 }} {...hoverGlow}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.dark, marginBottom: 10, lineHeight: 1.4 }}>{q}</h3>
              <p style={{ fontSize: 13, color: T.dark, lineHeight: 1.65, margin: 0 }}>{a}</p>
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
          <p style={{ fontSize: 14, color: "#bbb" }}>Free to start. No lead fees. California-born. Nationwide.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/BecomeContractor" style={{ textDecoration: "none" }}>
            <button style={{ background: "#fff", color: T.dark, border: "none", borderRadius: 6, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "box-shadow 0.2s ease" }} {...hoverGlowSm}>Join the Founding 100</button>
          </Link>
          <Link to="/PostJob" style={{ textDecoration: "none" }}>
            <button style={{ background: "transparent", color: "#ccc", border: `1px solid #666`, borderRadius: 6, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "box-shadow 0.2s ease" }} {...hoverGlowSm}>Post an RFP</button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function Home() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh" }}>
      <TickerBar />
      <HeroSection />
      <TabbedSection />
      <IntegritySection />
      <LaunchEngineSection />
      <FAQSection />
      <CTABar />
    </div>
  );
}