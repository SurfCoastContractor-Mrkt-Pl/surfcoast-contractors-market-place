import { Link } from "react-router-dom";

// ── Design tokens ──────────────────────────────────────────────
const T = {
  bg: "#EBEBEC",
  card: "#fff",
  dark: "#1A1A1B",
  text: "#1A1A1B",
  body: "#444",
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

// ── Logo component ─────────────────────────────────────────────
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

// ── Section 1 — Ticker bar ─────────────────────────────────────
function TickerBar() {
  return (
    <div
      style={{
        background: T.dark,
        padding: "6px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 6,
      }}
    >
      <span style={{ ...mono, fontSize: 11, color: "#aaa" }}>
        founding_100 — 77 spots remaining · 1 year all-access free
      </span>
      <span style={{ ...mono, fontSize: 11, color: T.amber }}>
        California · Nationwide
      </span>
    </div>
  );
}

// ── Section 2 — Navbar ─────────────────────────────────────────
function Navbar() {
  return (
    <nav
      style={{
        background: "#fff",
        borderBottom: `1px solid ${T.border}`,
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <Link to="/" style={{ textDecoration: "none", marginRight: 24 }}>
        <Logo />
      </Link>

      {/* Center nav */}
      <div style={{ display: "flex", gap: 20, flex: 1, justifyContent: "center", flexWrap: "wrap" }}>
        {[
          { label: "Service Side", color: T.sub },
          { label: "WAVE OS", color: T.amber },
          { label: "Market Shop", color: T.sub },
          { label: "Post RFP", color: T.sub },
          { label: "Pricing", color: T.sub },
        ].map(({ label, color }) => (
          <span key={label} style={{ fontSize: 14, color, cursor: "pointer", fontWeight: 500 }}>
            {label}
          </span>
        ))}
      </div>

      {/* Right buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link to="/Dashboard" style={{ textDecoration: "none" }}>
          <button
            style={{
              background: "transparent",
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              padding: "7px 14px",
              fontSize: 13,
              color: T.dark,
              cursor: "pointer",
            }}
          >
            Sign in
          </button>
        </Link>
        <Link to="/wave-os-details" style={{ textDecoration: "none" }}>
          <button
            style={{
              background: T.amberBg,
              border: "none",
              borderRadius: 6,
              padding: "7px 14px",
              fontSize: 13,
              color: T.amber,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            WAVE OS
          </button>
        </Link>
        <Link to="/BecomeContractor" style={{ textDecoration: "none" }}>
          <button
            style={{
              background: T.dark,
              border: "none",
              borderRadius: 6,
              padding: "7px 14px",
              fontSize: 13,
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Get started free
          </button>
        </Link>
      </div>
    </nav>
  );
}

// ── Section 3 — Hero ───────────────────────────────────────────
function HeroPlatformCard() {
  const blockStyle = (borderColor) => ({
    borderLeft: `3px solid ${borderColor}`,
    paddingLeft: 12,
    marginBottom: 12,
  });
  const tileStyle = (tinted) => ({
    background: tinted ? T.amberTint : T.bg,
    border: `0.5px solid ${tinted ? "#D9B88A" : T.border}`,
    borderRadius: 6,
    padding: "6px 10px",
    fontSize: 12,
    color: tinted ? T.amber : T.sub,
    marginBottom: 6,
    ...mono,
  });

  return (
    <div style={{ ...cardStyle, padding: 20, minWidth: 0 }}>
      {/* Card header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          paddingBottom: 10,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <span style={{ ...mono, fontSize: 11, color: T.muted }}>surfcoast / platform_map</span>
        <span style={{ ...mono, fontSize: 11, color: T.amber }}>● live</span>
      </div>

      {/* Block 1 — Marketplace */}
      <div style={blockStyle(T.border)}>
        <div style={{ ...mono, fontSize: 10, color: T.muted, marginBottom: 8, letterSpacing: "0.06em" }}>
          SURFCOAST MARKETPLACE — THE VENUE
        </div>
        <div style={tileStyle(false)}>Service Side — Clients · Contractors</div>
        <div style={tileStyle(false)}>Market Shop — Vendors · Consumers</div>
      </div>

      {/* Block 2 — WAVE OS */}
      <div style={blockStyle(T.amber)}>
        <div style={{ ...mono, fontSize: 10, color: T.amber, marginBottom: 8, letterSpacing: "0.06em" }}>
          WAVE OS — STANDALONE SOFTWARE BRAND
        </div>
        <div style={tileStyle(true)}>WAVE Service — Starter → Premium</div>
        <div style={tileStyle(true)}>WAVEshop OS — Vendor software</div>
      </div>

      {/* Logic gate notice */}
      <div
        style={{
          background: T.amberTint,
          border: `0.5px solid #D9B88A`,
          borderRadius: 6,
          padding: "7px 10px",
          fontSize: 11,
          color: T.amber,
          ...mono,
        }}
      >
        Logic gate: consumers cannot access service side
      </div>
    </div>
  );
}

function HeroSection() {
  const statStyle = {
    flex: 1,
    textAlign: "center",
    padding: "12px 8px",
  };

  return (
    <section style={{ background: "#fff", padding: "60px 24px 48px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 48, flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* Left */}
        <div style={{ flex: "1 1 380px", minWidth: 0 }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 16, letterSpacing: "0.06em" }}>
            // PLATFORM · CALIFORNIA · NATIONWIDE
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: T.dark, lineHeight: 1.15, marginBottom: 16 }}>
            Built for the worker.{" "}
            <br />
            Not the{" "}
            <span style={{ color: T.amber }}>algorithm.</span>
          </h1>
          <p style={{ fontSize: 16, color: "#444", lineHeight: 1.65, marginBottom: 28 }}>
            SurfCoast Marketplace is the venue. WAVE OS is the software. Together they form
            the complete operating system for the modern sole-proprietor.
          </p>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
            <Link to="/PostJob" style={{ textDecoration: "none" }}>
              <button style={{ background: T.dark, color: "#fff", border: "none", borderRadius: 6, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Post a Job — Free
              </button>
            </Link>
            <Link to="/wave-os-details" style={{ textDecoration: "none" }}>
              <button style={{ background: T.amberBg, color: T.amber, border: "none", borderRadius: 6, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Explore WAVE OS
              </button>
            </Link>
            <Link to="/BecomeContractor" style={{ textDecoration: "none" }}>
              <button style={{ background: "transparent", color: T.dark, border: `1px solid ${T.border}`, borderRadius: 6, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Join as Contractor
              </button>
            </Link>
          </div>

          {/* Stats bar */}
          <div
            style={{
              display: "flex",
              border: `0.5px solid ${T.border}`,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {[
              { amount: "$0", label: "To respond to leads", amberAmt: true },
              { amount: "18%", label: "Facilitation fee only", amberAmt: false },
              { amount: "$19", label: "WAVE OS starts at", amberAmt: true },
            ].map(({ amount, label, amberAmt }, i) => (
              <div
                key={i}
                style={{
                  ...statStyle,
                  borderRight: i < 2 ? `1px solid ${T.border}` : "none",
                }}
              >
                <div style={{ ...mono, fontSize: 20, fontWeight: 700, color: amberAmt ? T.amber : T.dark }}>
                  {amount}
                </div>
                <div style={{ fontSize: 11, color: T.sub, marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <HeroPlatformCard />
        </div>
      </div>
    </section>
  );
}

// ── Section 4 — Role bento grid ───────────────────────────────
function BentoGrid() {
  const tagStyle = (amber) => ({
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
  });

  const cards = [
    {
      topBorder: T.dark,
      labelColor: T.muted,
      label: "SERVICE SIDE · CLIENT",
      heading: "The Hirer",
      desc: "Post a job listing for free. Pay $1.75 to send a Request for Proposal directly to a contractor. A $1.50 timed session unlocks a 60-minute communication window.",
      tags: [
        { text: "POST JOB · FREE", amber: false },
        { text: "RFP · $1.75", amber: true },
        { text: "SESSION · $1.50", amber: false },
      ],
    },
    {
      topBorder: T.amber,
      labelColor: T.amber,
      label: "SERVICE SIDE · CONTRACTOR",
      heading: "The Worker",
      desc: "Respond to every lead for free. An 18% facilitation fee applies when a job closes through the platform. WAVE OS is optional but gives you the edge.",
      tags: [
        { text: "RESPOND · $0", amber: false },
        { text: "18% FEE", amber: false },
        { text: "WAVE OS OPTIONAL", amber: true },
      ],
    },
    {
      topBorder: "#D0D0D2",
      labelColor: "#777",
      label: "MARKET SHOP · VENDOR",
      heading: "The Seller",
      desc: "List your Market Booth or claim a Space at a farmers market or swap meet. Upgrade to WAVEshop OS for live inventory management.",
      tags: [
        { text: "BOOTH", amber: false },
        { text: "SPACE", amber: false },
        { text: "WAVEshop OS · $35/mo", amber: false },
      ],
    },
    {
      topBorder: "#D0D0D2",
      labelColor: "#777",
      label: "MARKET SHOP · CONSUMER",
      heading: "The Shopper",
      desc: "Browse and shop from local vendors at farmers markets and swap meets. Consumer accounts are scoped to the Market Shop only.",
      tags: [
        { text: "MARKET SHOP ONLY", amber: false },
        { text: "NO SERVICE SIDE ACCESS", amber: true },
      ],
    },
  ];

  return (
    <section style={{ background: T.bg, padding: "60px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              style={{
                ...cardStyle,
                borderTop: `3px solid ${card.topBorder}`,
                padding: 22,
              }}
            >
              <div style={{ ...mono, fontSize: 10, color: card.labelColor, marginBottom: 10, letterSpacing: "0.06em" }}>
                {card.label}
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: T.dark, marginBottom: 10 }}>
                {card.heading}
              </h3>
              <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6, marginBottom: 14 }}>
                {card.desc}
              </p>
              <div>
                {card.tags.map((t) => (
                  <span key={t.text} style={tagStyle(t.amber)}>
                    {t.text}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section 5 — Service Side Financials ───────────────────────
function FinancialsSection() {
  const rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: `1px solid ${T.bg}`,
  };

  const contractorRows = [
    { label: "Facilitation fee", note: "on job close", value: "18%", amberVal: false },
    { label: "Respond to RFP", note: "no upfront cost", value: "$0", amberVal: true },
    { label: "Timed session", note: "60-min window", value: "$1.50", amberVal: false },
    { label: "Unlimited messaging", note: "monthly", value: "$50/mo", amberVal: false },
    { label: "Basic Dashboard", note: "always included", value: "Free", amberVal: true },
  ];

  const clientRows = [
    { label: "Job posting", note: "no account needed", value: "$0", amberVal: true },
    { label: "Request for Proposal", note: "direct to contractor", value: "$1.75", amberVal: false },
    { label: "Timed session", note: "60-min window", value: "$1.50", amberVal: false },
    { label: "Unlimited messaging", note: "monthly", value: "$50/mo", amberVal: false },
  ];

  return (
    <section style={{ background: "#fff", padding: "60px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 10, letterSpacing: "0.06em" }}>
          // SERVICE SIDE FINANCIALS
        </div>
        <h2 style={{ fontSize: 34, fontWeight: 800, color: T.dark, marginBottom: 10 }}>
          The toll-road model.
        </h2>
        <p style={{ fontSize: 15, color: T.sub, marginBottom: 36, maxWidth: 560, lineHeight: 1.6 }}>
          We never charge a contractor to respond to a lead. Every fee is a filter.
        </p>

        <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
          {/* Contractors */}
          <div style={{ flex: "1 1 260px", paddingRight: 32 }}>
            <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 14, letterSpacing: "0.06em" }}>
              FOR CONTRACTORS
            </div>
            {contractorRows.map((r) => (
              <div key={r.label} style={rowStyle}>
                <div>
                  <div style={{ fontSize: 13, color: T.dark, fontWeight: 600 }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{r.note}</div>
                </div>
                <span style={{ ...mono, fontSize: 14, fontWeight: 700, color: r.amberVal ? T.amber : T.dark }}>
                  {r.value}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ width: 1, background: T.border, margin: "0 0 0 0", alignSelf: "stretch", flexShrink: 0 }} />

          {/* Clients */}
          <div style={{ flex: "1 1 260px", paddingLeft: 32 }}>
            <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 14, letterSpacing: "0.06em" }}>
              FOR CLIENTS
            </div>
            {clientRows.map((r) => (
              <div key={r.label} style={rowStyle}>
                <div>
                  <div style={{ fontSize: 13, color: T.dark, fontWeight: 600 }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{r.note}</div>
                </div>
                <span style={{ ...mono, fontSize: 14, fontWeight: 700, color: r.amberVal ? T.amber : T.dark }}>
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section 6 — WAVE OS Tiers ─────────────────────────────────
function WaveOSTiers() {
  const tierCard = (price, name, unlock, features, highlighted, isAmber) => (
    <div
      style={{
        ...cardStyle,
        border: highlighted ? `1.5px solid ${T.amber}` : `0.5px solid ${T.border}`,
        padding: 20,
        flex: "1 1 180px",
        minWidth: 0,
      }}
    >
      <div style={{ ...mono, fontSize: 20, fontWeight: 700, color: isAmber ? T.amber : T.dark, marginBottom: 4 }}>
        {price}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 4 }}>{name}</div>
      {unlock && (
        <div style={{ ...mono, fontSize: 10, color: T.muted, marginBottom: 10 }}>unlock: {unlock}</div>
      )}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {features.map((f) => (
          <li key={f} style={{ fontSize: 12, color: T.sub, padding: "3px 0", borderBottom: `1px solid ${T.bg}` }}>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <section style={{ background: T.bg, padding: "60px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
          <span style={{ fontSize: 36, fontWeight: 800, color: T.amber }}>WAVE OS</span>
          <span
            style={{
              ...mono,
              fontSize: 11,
              border: `1px solid ${T.amber}`,
              color: T.amber,
              padding: "3px 8px",
              borderRadius: 4,
            }}
          >
            standalone software brand
          </span>
          <span style={{ ...mono, fontSize: 11, color: "#777" }}>// tiers unlock after 15 completed jobs</span>
        </div>

        {/* Row 1 */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          {tierCard("$19/mo", "WAVE STARTER", "15 completed jobs", ["Basic job management", "Essential scheduling", "Basic dashboard"], false, false)}
          {tierCard("$39/mo", "WAVE PRO", null, ["Automated invoicing", "Analytics dashboard", "All Starter features"], true, false)}
          {tierCard("$59/mo", "WAVE MAX", null, ["CRM tools", "Client management", "All Pro features"], false, false)}
        </div>

        {/* Row 2 */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {tierCard("$100/mo", "WAVE PREMIUM", null, ["Licensed Sole Prop required", "H.I.S. License required", "All Max features"], false, false)}
          {tierCard("$125/mo", "RESIDENTIAL BUNDLE", null, ["WAVE Premium included", "$50 Messaging add-on", "H.I.S. required"], false, false)}
          {tierCard("$35/mo", "WAVEshop OS", null, ["Live-sync inventory", "Low-stock alerts", "Market Hub"], true, true)}
        </div>
      </div>
    </section>
  );
}

// ── Section 7 — Multi-trade job posting ───────────────────────
function MultiTradeSection() {
  const slots = [
    { trade: "Plumber", status: "● filled", icon: "✓", filled: true },
    { trade: "Electrician", status: "◆ hiring", icon: "◷", filled: true },
    { trade: "Painter", status: "○ open", icon: "+", filled: false },
    { trade: "Carpenter", status: "○ open", icon: "+", filled: false },
  ];

  return (
    <section style={{ background: "#fff", padding: "60px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 10, letterSpacing: "0.06em" }}>
          // MULTI-TRADE JOB POSTING
        </div>
        <h2 style={{ fontSize: 34, fontWeight: 800, color: T.dark, marginBottom: 8 }}>
          One project. Multiple trade slots.
        </h2>
        <p style={{ fontSize: 15, color: T.sub, marginBottom: 28, lineHeight: 1.6 }}>
          Slots close as contractors are hired.
        </p>

        {/* Demo job card */}
        <div style={{ background: T.bg, borderRadius: 10, padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.dark, marginBottom: 4 }}>
              Kitchen Renovation — Full Project
            </div>
            <div style={{ ...mono, fontSize: 11, color: T.muted }}>
              Posted by: Client · Budget: $18,000 · Timeline: 6 weeks
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {slots.map((s) => (
              <div
                key={s.trade}
                style={{
                  flex: "1 1 120px",
                  background: s.filled ? T.amberTint : "#fff",
                  border: `0.5px solid ${s.filled ? "#D9B88A" : T.border}`,
                  borderRadius: 8,
                  padding: "14px 12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    color: s.filled ? T.amber : "#CCC",
                    marginBottom: 6,
                  }}
                >
                  {s.icon}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: s.filled ? T.dark : "#AAA", marginBottom: 4 }}>
                  {s.trade}
                </div>
                <div style={{ ...mono, fontSize: 10, color: s.filled ? T.amber : "#CCC" }}>
                  {s.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section 8 — Integrity & account holds ────────────────────
function IntegritySection() {
  const pillTag = (text) => (
    <span
      style={{
        ...mono,
        fontSize: 10,
        background: T.amberTint,
        border: `0.5px solid #D9B88A`,
        color: T.amber,
        borderRadius: 4,
        padding: "3px 8px",
        display: "inline-block",
        marginTop: 12,
      }}
    >
      {text}
    </span>
  );

  return (
    <section style={{ background: "#F5F5F6", padding: "60px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 10, letterSpacing: "0.06em" }}>
          // INTEGRITY &amp; ACCOUNT HOLD ENFORCEMENT
        </div>
        <h2 style={{ fontSize: 34, fontWeight: 800, color: T.dark, marginBottom: 8 }}>
          100% compliance. Automated.
        </h2>
        <p style={{ fontSize: 15, color: T.sub, marginBottom: 32, lineHeight: 1.6 }}>
          Non-compliance triggers immediate account holds with no manual review required.
        </p>

        {/* Two cards */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            {
              label: "TRIGGER_01 // 72HR_PHOTO_RULE",
              heading: "72-Hour Photo Rule",
              desc: "Contractors must upload after-photos within 72 hours of the agreed work date. Failure to comply triggers an immediate account hold that blocks all platform activity.",
              tag: "immediate account hold",
            },
            {
              label: "TRIGGER_02 // MUTUAL_RATINGS",
              heading: "Mandatory Mutual Ratings",
              desc: "Both contractor and client must submit satisfaction ratings at job closeout. Non-compliant parties are blocked until the rating is submitted.",
              tag: "hold: non-compliant party only",
            },
          ].map((c) => (
            <div key={c.label} style={{ ...cardStyle, flex: "1 1 260px", padding: 22 }}>
              <div style={{ ...mono, fontSize: 10, color: T.muted, marginBottom: 10, letterSpacing: "0.06em" }}>
                {c.label}
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: T.dark, marginBottom: 8 }}>{c.heading}</h3>
              <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>{c.desc}</p>
              {pillTag(c.tag)}
            </div>
          ))}
        </div>

        {/* Full-width card */}
        <div style={{ ...cardStyle, padding: 22 }}>
          <div style={{ ...mono, fontSize: 10, color: T.muted, marginBottom: 10, letterSpacing: "0.06em" }}>
            HOLD STATUS — FULL PLATFORM BLOCK
          </div>
          <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>
            An account hold blocks all platform activity — job applications, messaging, payments, and RFP access — until the required action is completed. Holds lift automatically once compliance is confirmed.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Section 9 — Launch Engine ─────────────────────────────────
function LaunchEngineSection() {
  const cards = [
    {
      topBorder: T.dark,
      number: "100",
      numberColor: T.dark,
      label: "FOUNDING_100",
      desc: "The first 100 contractors to register receive 1 full year of all-access free. No credit card. No catch.",
      tag: "1 year all-access free",
      tagAmber: true,
    },
    {
      topBorder: "transparent",
      number: "14",
      numberColor: "#AAA",
      label: "STANDARD_TRIAL",
      desc: "After the Founding 100 fills, all new contractors start with a 14-day free trial to explore the platform.",
      tag: "standard onboarding",
      tagAmber: false,
    },
    {
      topBorder: T.amber,
      number: "5:1",
      numberColor: T.amber,
      label: "THE_5_FOR_1_LOOP",
      desc: "During your trial, refer 5 new signups to earn 1 extra free day. Stackable. Trial window only.",
      tag: "trial window only",
      tagAmber: true,
    },
  ];

  return (
    <section style={{ background: T.bg, padding: "60px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.06em" }}>
          // LAUNCH ENGINE
        </div>
        <h2 style={{ fontSize: 34, fontWeight: 800, color: T.dark, marginBottom: 8 }}>
          Three mechanics. One flywheel.
        </h2>
        <p style={{ fontSize: 15, color: T.sub, marginBottom: 32, lineHeight: 1.6 }}>
          Each mechanic feeds the next. Early movers win.
        </p>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {cards.map((c) => (
            <div
              key={c.label}
              style={{
                ...cardStyle,
                borderTop: `3px solid ${c.topBorder}`,
                padding: 22,
                flex: "1 1 220px",
              }}
            >
              <div style={{ ...mono, fontSize: 40, fontWeight: 700, color: c.numberColor, marginBottom: 4 }}>
                {c.number}
              </div>
              <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.06em" }}>
                {c.label}
              </div>
              <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6, marginBottom: 14 }}>{c.desc}</p>
              <span
                style={{
                  ...mono,
                  fontSize: 10,
                  padding: "3px 8px",
                  borderRadius: 4,
                  border: `0.5px solid ${c.tagAmber ? "#D9B88A" : T.border}`,
                  background: c.tagAmber ? T.amberTint : T.bg,
                  color: c.tagAmber ? T.amber : T.muted,
                }}
              >
                {c.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section 10 — CTA bar ──────────────────────────────────────
function CTABar() {
  return (
    <section style={{ background: T.dark, padding: "48px 24px" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
            Ready to run your business on WAVE OS?
          </h2>
          <p style={{ fontSize: 14, color: "#666" }}>
            Free to start. No lead fees. California-born. Nationwide.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/BecomeContractor" style={{ textDecoration: "none" }}>
            <button style={{ background: "#fff", color: T.dark, border: "none", borderRadius: 6, padding: "11px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Join the Founding 100
            </button>
          </Link>
          <Link to="/PostJob" style={{ textDecoration: "none" }}>
            <button style={{ background: "transparent", color: "#888", border: `1px solid #444`, borderRadius: 6, padding: "11px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Post an RFP
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Section 11 — Footer ───────────────────────────────────────
function Footer() {
  const col = (header, links) => (
    <div style={{ flex: "1 1 160px" }}>
      <div style={{ ...mono, fontSize: 10, color: "#888", marginBottom: 14, letterSpacing: "0.1em" }}>
        {header}
      </div>
      {links.map(({ label, to }) => (
        <div key={label} style={{ marginBottom: 8 }}>
          <Link to={to} style={{ fontSize: 13, color: "#555", textDecoration: "none" }}>
            {label}
          </Link>
        </div>
      ))}
    </div>
  );

  return (
    <footer style={{ background: T.dark }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 24px" }}>
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap", marginBottom: 40 }}>
          {/* Left col */}
          <div style={{ flex: "1 1 200px" }}>
            <Logo />
            <div style={{ ...mono, fontSize: 9, color: "#555", letterSpacing: "0.14em", marginTop: 4, marginBottom: 12 }}>
              MARKETPLACE · WAVE OS
            </div>
            <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6, maxWidth: 220 }}>
              The complete operating system for California's independent workforce.
            </p>
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

        {/* Bottom strip */}
        <div
          style={{
            borderTop: `1px solid #2a2a2b`,
            paddingTop: 16,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span style={{ ...mono, fontSize: 11, color: "#555" }}>
            © {new Date().getFullYear()} SurfCoast. All rights reserved.
          </span>
          <span style={{ ...mono, fontSize: 11, color: "#555" }}>
            toll-road model · not a lead farm
          </span>
        </div>
      </div>
    </footer>
  );
}

// ── Main export ────────────────────────────────────────────────
export default function Home() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh" }}>
      <TickerBar />
      <Navbar />
      <HeroSection />
      <BentoGrid />
      <FinancialsSection />
      <WaveOSTiers />
      <MultiTradeSection />
      <IntegritySection />
      <LaunchEngineSection />
      <CTABar />
      <Footer />
    </div>
  );
}