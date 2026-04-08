import { CheckCircle2, ArrowLeft, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";

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

export default function WAVEOSDetails() {
  const tiers = [
    { name: "Starter", price: "$19", jobs: "5+", features: ["5 active jobs", "Job scheduling & mobile access", "Messaging: $1.50/session or $50/mo"] },
    { name: "Pro", price: "$39", jobs: "6+", features: ["Everything in Starter", "CRM, invoicing & analytics", "Price book options"] },
    { name: "Max", price: "$59", jobs: "50+", features: ["Everything in Pro", "GPS tracking & field ops suite", "Free messaging — past clients only"] },
    { name: "Premium", price: "$100", jobs: "100+ & verified license", features: ["Everything in Max", "Free messaging with ALL clients", "AI scheduling, HubSpot, Notion", "Residential invoicing & document templates"] },
  ];

  const features = [
    { title: "Job Management", desc: "Post jobs, receive bids, manage scopes of work, and track progress in real time." },
    { title: "Field Operations", desc: "GPS tracking, photo documentation, digital signatures, and mobile-first interface." },
    { title: "Financial Tools", desc: "Invoice generation, payment tracking, QuickBooks export, and payout management." },
    { title: "Client Communication", desc: "Secure messaging, progress updates, and project collaboration tools." },
    { title: "Scheduling", desc: "Calendar management, availability tracking, and AI-powered scheduling assistant." },
    { title: "Growth Tools", desc: "Performance analytics, referral tracking, and professional reputation building." },
  ];

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh", background: T.bg }}>

      {/* Ticker */}
      <div style={{ background: T.dark, padding: "6px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
        <span style={{ ...mono, fontSize: 11, color: "#e0e0e0" }}>// WAVE OS · FIELD OPERATIONS SOFTWARE</span>
        <span style={{ ...mono, fontSize: 11, color: "#ffffff" }}>For Independent Contractors</span>
      </div>

      {/* Hero */}
      <section style={{ background: T.bg, padding: "52px 24px 40px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Link to="/" style={{ ...mono, fontSize: 11, color: T.muted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
            <ArrowLeft size={13} /> Back to Home
          </Link>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 18, padding: "4px 14px", background: T.amberTint, border: `0.5px solid #D9B88A`, borderRadius: 6 }}>
            <Zap size={12} style={{ color: T.amber }} />
            <span style={{ ...mono, fontSize: 10, color: T.amber, letterSpacing: "0.08em" }}>FIELD OPERATIONS SOFTWARE</span>
          </div>

          <h1 style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", fontWeight: 900, color: T.dark, marginBottom: 20, lineHeight: 1.08 }}>
            WAVE OS<br />
            <span style={{ color: T.amber }}>For Independent Contractors</span>
          </h1>

          <p style={{ fontSize: 17, color: T.muted, lineHeight: 1.7, marginBottom: 32, maxWidth: 620, fontStyle: "italic" }}>
            Professional field operations software designed for solo entrepreneurs. Manage jobs, track finances, schedule efficiently, and grow your business.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link to="/BecomeContractor" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 26px", borderRadius: 6, background: T.dark, color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: 14, boxShadow: T.shadow }}>
              Get Started Free <ArrowRight size={15} />
            </Link>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 26px", borderRadius: 6, border: `1px solid ${T.border}`, color: T.dark, fontWeight: 700, textDecoration: "none", fontSize: 14, background: T.card }}>
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section style={{ background: "#F5F5F6", padding: "52px 24px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 10, letterSpacing: "0.1em" }}>// WAVE OS TIERS</div>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: T.dark, marginBottom: 12 }}>WAVE OS Tiers</h2>
            <p style={{ fontSize: 15, color: T.muted, maxWidth: 560, margin: "0 auto", fontStyle: "italic" }}>
              Start free. Unlock tiers as you complete jobs. Licensed professionals get instant access to all tiers.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 28 }}>
            {tiers.map((tier, i) => (
              <div key={i} style={{ ...cardStyle, padding: 20, textAlign: "center", display: "flex", flexDirection: "column" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = goldGlowSm}
                onMouseLeave={e => e.currentTarget.style.boxShadow = T.shadow}
              >
                <h3 style={{ ...mono, fontSize: 12, color: T.muted, marginBottom: 8 }}>{tier.name}</h3>
                <div style={{ ...mono, fontSize: 30, fontWeight: 700, color: T.amber, marginBottom: 2 }}>{tier.price}</div>
                <p style={{ fontSize: 11, color: T.muted, marginBottom: 14 }}>/month</p>
                <div style={{ background: T.amberTint, border: `0.5px solid #D9B88A`, borderRadius: 5, padding: "5px 10px", marginBottom: 14, fontSize: 11, color: T.amber, ...mono }}>
                  {tier.jobs} jobs to unlock
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1, textAlign: "left" }}>
                  {tier.features.map((f, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: T.muted, marginBottom: 6 }}>
                      <CheckCircle2 size={11} style={{ color: T.amber, flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ ...cardStyle, padding: 28, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: T.muted, marginBottom: 20, lineHeight: 1.65, fontStyle: "italic" }}>
              <strong style={{ color: T.dark }}>Licensed Professionals:</strong> Have a verified contractor license? Get access to Premium immediately once you hit 100 jobs — or combine your license verification to qualify. <strong style={{ color: T.dark }}>WAVE OS Max</strong> includes free messaging with past clients. <strong style={{ color: T.dark }}>WAVE OS Premium</strong> includes free messaging with <em>all</em> clients and full residential tools.
            </p>
            <Link to="/Pricing" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", borderRadius: 6, background: T.dark, color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: 14, boxShadow: T.shadow }}>
              View Full Pricing Details <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: T.bg, padding: "52px 24px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.1em", textAlign: "center" }}>// WHAT'S INCLUDED</div>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: T.dark, textAlign: "center", marginBottom: 40 }}>What's Included</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, maxWidth: 860, margin: "0 auto" }}>
            {features.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 14, borderLeft: `3px solid ${T.amber}`, paddingLeft: 18 }}>
                <div>
                  <h3 style={{ fontWeight: 800, color: T.dark, marginBottom: 6, fontSize: 15 }}>{item.title}</h3>
                  <p style={{ color: T.muted, margin: 0, fontSize: 13, lineHeight: 1.65, fontStyle: "italic" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: T.dark, padding: "64px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{ ...mono, fontSize: 11, color: T.amberBg, marginBottom: 10, letterSpacing: "0.1em" }}>// GET STARTED</div>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: "#fff", marginBottom: 16 }}>Ready to scale your business?</h2>
          <p style={{ color: "#ccc", fontSize: 15, marginBottom: 32, fontStyle: "italic" }}>Start with a free profile. Unlock tiers as you grow. No credit card required.</p>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/BecomeContractor" style={{ padding: "12px 28px", borderRadius: 6, background: T.amberBg, color: T.amber, fontWeight: 700, textDecoration: "none", fontSize: 14, boxShadow: T.shadow }}>
              Get Started Free
            </Link>
            <Link to="/" style={{ padding: "12px 28px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
              Back to Home
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}