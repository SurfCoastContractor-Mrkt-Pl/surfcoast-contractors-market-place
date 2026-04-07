import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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
const cardStyle = {
  background: T.card,
  border: `0.5px solid ${T.border}`,
  borderRadius: 10,
  boxShadow: T.shadow,
};
const goldGlowSm = "0 0 14px 3px rgba(255,180,0,0.3)";

const hoverGlow = {
  onMouseEnter: (e) => { e.currentTarget.style.boxShadow = `3px 3px 0px #5C3500, 0 0 18px 4px rgba(255, 180, 0, 0.35)`; },
  onMouseLeave: (e) => { e.currentTarget.style.boxShadow = T.shadow; },
};

const PROBLEMS = [
  "Juggling a dozen different apps just to run one business",
  "Manual data entry between scheduling, payments, invoicing, and accounting",
  "Compliance headaches — licenses, insurance, labor laws — barely tracked",
  "No visibility into profitability per job or per customer",
];

const FEATURE_BLOCKS = [
  {
    label: "OPERATIONS",
    heading: "Streamlined Field Operations",
    items: [
      { title: "My Day View", desc: "One dashboard shows all your jobs, leads, and appointments" },
      { title: "Intelligent Routing", desc: "Optimize your day with automated route planning" },
      { title: "Real-Time Documentation", desc: "Capture before/after photos and job notes on-site" },
      { title: "Offline-First Design", desc: "Work anywhere, even in basements with no signal" },
    ],
  },
  {
    label: "COMPLIANCE & MONEY",
    heading: "Financials & Compliance",
    items: [
      { title: "Identity Verification", desc: "Built-in, not bolted-on — your entire team verified" },
      { title: "Stripe Payouts", desc: "Get paid securely, directly to your bank account" },
      { title: "QuickBooks Integration", desc: "Your financials sync automatically" },
      { title: "Smart Invoicing", desc: "Professional invoices generated in seconds" },
    ],
  },
  {
    label: "CLIENT CONNECTION",
    heading: "Client & Communication",
    items: [
      { title: "Unified Messaging", desc: "In-app chat and SMS in one inbox" },
      { title: "Automated Updates", desc: "Keep clients informed without lifting a finger" },
      { title: "Review Management", desc: "Collect and respond to feedback seamlessly" },
      { title: "Trusted Badge System", desc: "Build credibility with verified reviews" },
    ],
  },
  {
    label: "GROWTH & INSIGHTS",
    heading: "Analytics & Growth",
    items: [
      { title: "Earnings Analytics", desc: "Know which jobs, clients, and times are most profitable" },
      { title: "Performance Dashboard", desc: "Track your business metrics in real-time" },
      { title: "Portfolio Showcase", desc: "Display before/after work to attract clients" },
      { title: "Trade Games", desc: "Level up skills while competing with other entrepreneurs" },
    ],
  },
];

const WHY_ITEMS = [
  { label: "COMPLIANCE", heading: "Built for Compliance", desc: "Minor labor laws, licensing verification, insurance tracking — all baked in. Your shield, not your burden." },
  { label: "ORIGIN", heading: "Built by Entrepreneurs", desc: "We understand field work. Every feature solves a real problem you actually face." },
  { label: "INTEGRATION", heading: "Everything Integrated", desc: "No switching between apps. One platform. One source of truth. Your entire business in one place." },
];

const TRUST_ITEMS = [
  { heading: "Identity Verified", desc: "Every entrepreneur checked" },
  { heading: "Minor Protection", desc: "Labor law compliance built in" },
  { heading: "Secure Payouts", desc: "Stripe Connect verified" },
  { heading: "Rated & Reviewed", desc: "Verified feedback system" },
];

export default function WaveFOAbout() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh", background: T.bg }}>

      {/* Ticker */}
      <div style={{ background: T.dark, padding: "6px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
        <span style={{ ...mono, fontSize: 11, color: "#e0e0e0" }}>// WAVE OS ECOSYSTEM · FIELD OPERATIONS SOFTWARE</span>
        <span style={{ ...mono, fontSize: 11, color: "#ffffff" }}>For Independent Entrepreneurs</span>
      </div>

      {/* Hero */}
      <section style={{ background: T.bg, padding: "52px 24px 40px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Link to="/" style={{ ...mono, fontSize: 11, color: T.muted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
            <ArrowLeft size={13} /> Back to Home
          </Link>

          <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 14, letterSpacing: "0.1em" }}>// THE WAVE OS ECOSYSTEM</div>

          <h1 style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", fontWeight: 900, color: T.dark, marginBottom: 20, lineHeight: 1.08 }}>
            WAVE OS<br />
            <span style={{ color: T.amber }}>The Operating System for Independent Entrepreneurs</span>
          </h1>

          <p style={{ fontSize: 17, color: T.muted, lineHeight: 1.7, marginBottom: 32, maxWidth: 660, fontStyle: "italic" }}>
            Every job, every dollar, every client interaction — unified in one platform built from the ground up for how entrepreneurs actually work.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link to="/BecomeContractor" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 26px", borderRadius: 6, background: T.dark, color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: 14, boxShadow: T.shadow }}>
              Start Free Trial <ArrowRight size={15} />
            </Link>
            <Link to="/pricing" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 26px", borderRadius: 6, border: `1px solid ${T.border}`, color: T.dark, fontWeight: 700, textDecoration: "none", fontSize: 14, background: T.card }}>
              View All Plans
            </Link>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section style={{ background: "#F5F5F6", padding: "52px 24px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
          <div>
            <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.1em" }}>// THE PROBLEM</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: T.dark, marginBottom: 20 }}>What Most Entrepreneurs Face</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PROBLEMS.map((p, i) => (
                <div key={i} style={{ ...cardStyle, padding: "12px 16px", display: "flex", gap: 12, alignItems: "flex-start" }} {...hoverGlow}>
                  <span style={{ ...mono, color: T.amber, flexShrink: 0 }}>✗</span>
                  <span style={{ fontSize: 13, color: T.muted, fontStyle: "italic" }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ ...cardStyle, padding: 28, borderTop: `3px solid ${T.amber}` }}>
            <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 10, letterSpacing: "0.1em" }}>// WHY COMPETITORS FALL SHORT</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: T.dark, marginBottom: 14 }}>Puzzle pieces. Not a platform.</h3>
            <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.75, fontStyle: "italic", marginBottom: 14 }}>
              Most platforms address single problems in isolation: CRM for leads, accounting software for invoices, scheduling tools for calendars. None of them speak to each other. None of them understand the unique needs of field work.
            </p>
            <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.75, fontStyle: "italic" }}>
              And compliance? It's an afterthought bolted on, not baked into the core.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Blocks */}
      <section style={{ background: T.bg, padding: "52px 24px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.1em" }}>// WHAT IS WAVE OS</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: T.dark, marginBottom: 8 }}>Enter WAVE OS</h2>
          <p style={{ fontSize: 15, color: T.muted, maxWidth: 620, marginBottom: 40, fontStyle: "italic", lineHeight: 1.7 }}>
            Built specifically for entrepreneurs, WAVE OS unifies every aspect of your business — from the moment you accept a job to the day you get paid and everything in between.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {FEATURE_BLOCKS.map((block, bi) => (
              <div key={bi} style={{ ...cardStyle, padding: 24, borderTop: `3px solid ${T.amber}` }} {...hoverGlow}>
                <div style={{ ...mono, fontSize: 10, color: T.amber, marginBottom: 10, letterSpacing: "0.08em" }}>// {block.label}</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: T.dark, marginBottom: 14 }}>{block.heading}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {block.items.map((item, ii) => (
                    <div key={ii}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.dark }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: T.muted, fontStyle: "italic" }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Entrepreneurs Choose */}
      <section style={{ background: T.dark, padding: "52px 24px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ ...mono, fontSize: 11, color: T.amberBg, marginBottom: 10, letterSpacing: "0.1em" }}>// WHY ENTREPRENEURS CHOOSE WAVE OS</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 32 }}>Why Entrepreneurs Choose WAVE OS</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {WHY_ITEMS.map((item, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: 24, borderTop: `3px solid ${T.amber}` }}>
                <div style={{ ...mono, fontSize: 10, color: T.amberBg, marginBottom: 10, letterSpacing: "0.08em" }}>// {item.label}</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 10 }}>{item.heading}</h3>
                <p style={{ fontSize: 13, color: "#bbb", lineHeight: 1.7, fontStyle: "italic" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Workflow Difference */}
      <section style={{ background: "#F5F5F6", padding: "52px 24px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.1em" }}>// THE DIFFERENCE</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: T.dark, marginBottom: 28 }}>The WAVE OS Difference</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...cardStyle, padding: 28, borderLeft: `3px solid ${T.border}` }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: T.dark, marginBottom: 10 }}>Competitors think in silos</h3>
              <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.75, fontStyle: "italic", margin: 0 }}>
                "We have a scheduling tool." "We have invoicing." "We have customer management." They're building puzzle pieces, never asking if the puzzle should exist at all.
              </p>
            </div>
            <div style={{ ...cardStyle, padding: 28, borderLeft: `3px solid ${T.amber}` }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: T.dark, marginBottom: 10 }}>We think in workflows</h3>
              <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.75, fontStyle: "italic", margin: 0 }}>
                An entrepreneur's day isn't about managing separate tools — it's about managing jobs. Accept a lead → Schedule it → Complete the work → Document it → Get paid → Keep the client happy. Every piece of WAVE OS serves that flow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section style={{ background: T.bg, padding: "52px 24px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.1em", textAlign: "center" }}>// TRUST & COMPLIANCE</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: T.dark, marginBottom: 28, textAlign: "center" }}>Built on Trust & Compliance</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
            {TRUST_ITEMS.map((item, i) => (
              <div key={i} style={{ ...cardStyle, padding: "20px 16px", textAlign: "center" }} {...hoverGlow}>
                <div style={{ ...mono, fontSize: 10, color: T.amber, marginBottom: 8, letterSpacing: "0.06em" }}>✓</div>
                <p style={{ fontWeight: 800, color: T.dark, fontSize: 13, marginBottom: 4 }}>{item.heading}</p>
                <p style={{ fontSize: 12, color: T.muted, fontStyle: "italic" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: T.dark, padding: "64px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{ ...mono, fontSize: 11, color: T.amberBg, marginBottom: 10, letterSpacing: "0.1em" }}>// GET STARTED</div>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: "#fff", marginBottom: 16 }}>Ready to Run Your Business Like a Pro?</h2>
          <p style={{ color: "#ccc", fontSize: 15, marginBottom: 32, fontStyle: "italic", maxWidth: 480, margin: "0 auto 32px" }}>
            Join entrepreneurs building their own empires on WAVE OS. 14 days free. No credit card required.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/BecomeContractor" style={{ padding: "12px 28px", borderRadius: 6, background: T.amberBg, color: T.amber, fontWeight: 700, textDecoration: "none", fontSize: 14, boxShadow: T.shadow }}>
              Start Your Free Trial
            </Link>
            <Link to="/pricing" style={{ padding: "12px 28px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
              View All Plans →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}