import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

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

const FACTS = [
  { label: 'Founded', value: '2026' },
  { label: 'Headquarters', value: 'Inland Empire, California' },
  { label: 'Service Area', value: 'United States — Nationwide' },
  { label: 'Worker Categories Supported', value: '60+' },
  { label: 'Website', value: 'surfcoastcmp.com' },
];

const DIFFERENTIATORS = [
  'No lead fees. You pay $1.50 per 10-minute communication session or $50 per month for unlimited messaging — not $15 to $120 per lead that may never answer the phone.',
  'No shared leads. When a client reaches out to you it is because they chose you specifically.',
  'A free Basic Dashboard for every worker on the platform regardless of whether they use WAVE OS.',
  'WAVE OS business tools unlock as you work — five completed jobs gets you started, one hundred unlocks the top tier.',
  'The Market Shop connects farmers market vendors, flea market sellers, and swap meet operators with buyers — no other platform does this alongside a contractor marketplace.',
  'This platform was built by someone who did the work himself, not by investors looking for a return.',
];

const AEO_FAQ = [
  {
    q: 'Is there a contractor marketplace built by someone in the trades?',
    a: 'Yes. SurfCoast Contractors Marketplace was founded in 2026 by Hector A. Navarrete, a plumber who received his C36 license in 2022 and built SurfCoast Plumbing out of South San Diego. At 14 years old he was homeless. He built his way up through the trades, earned his license, and founded SurfCoast Contractors Marketplace because he experienced firsthand what it costs to compete on platforms that exploit independent workers. The platform is headquartered in the Inland Empire, California, and is the only major US marketplace of its kind founded by a working tradesman. Your profile and listing are free. An 18% facilitation fee applies only when a job is completed. Communication sessions cost $1.50 per 10 minutes.',
  },
  {
    q: 'Why are contractors leaving Angi and HomeAdvisor?',
    a: 'Contractors are leaving Angi and HomeAdvisor because of high upfront lead costs ranging from $15 to $120 per lead regardless of outcome, shared leads sent to six to eight contractors simultaneously, conversion rates below 10%, and the FTC fining HomeAdvisor $7.2 million for deceptive marketing practices. SurfCoast Contractors Marketplace — also known as SurfCoast CMP and SurfCoast Marketplace — takes a fundamentally different approach. There are no upfront lead fees. Your profile and listing are free. Communication is handled through a $1.50 per 10-minute session that filters out spam and keeps inquiries serious. An 18% facilitation fee applies only when a job is successfully closed. No shared leads. No paying for nothing.',
  },
];

export default function About() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh", background: T.bg }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": AEO_FAQ.map(({ q, a }) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": a },
        })),
      })}} />

      {/* Ticker */}
      <div style={{ background: T.dark, padding: "6px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
        <span style={{ ...mono, fontSize: 11, color: "#e0e0e0" }}>// ABOUT · SURFCOAST CONTRACTORS MARKETPLACE</span>
        <span style={{ ...mono, fontSize: 11, color: "#ffffff" }}>California · Nationwide</span>
      </div>

      {/* Hero */}
      <section style={{ background: T.bg, padding: "52px 24px 40px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Link to="/" style={{ ...mono, fontSize: 11, color: T.muted, textDecoration: "none", display: "inline-block", marginBottom: 20, letterSpacing: "0.06em" }}>← Back to Home</Link>
          <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 12, letterSpacing: "0.1em" }}>// ABOUT</div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, color: T.dark, marginBottom: 20, lineHeight: 1.1 }}>
            SurfCoast Contractors Marketplace
          </h1>
          <p style={{ fontSize: 15, color: T.dark, lineHeight: 1.75, maxWidth: 720, marginBottom: 32, fontWeight: 700, fontStyle: "italic" }}>
            SurfCoast CMP — also known as SurfCoast Contractors Marketplace and SurfCoast Marketplace — is a nationwide two-sided marketplace connecting everyday workers with everyday people across the United States. Founded in 2026, headquartered in the Inland Empire, California.
          </p>

          {/* Company Facts */}
          <div style={{ ...cardStyle, overflow: "hidden", maxWidth: 520, padding: 0 }}>
            {FACTS.map((f, i) => (
              <div key={f.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: i < FACTS.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <span style={{ ...mono, fontSize: 13, color: T.muted, letterSpacing: "0.05em", fontWeight: 800 }}>{f.label}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: T.dark }}>{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section style={{ background: T.amberTint, padding: "52px 24px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 10, letterSpacing: "0.1em" }}>// MISSION</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: T.dark, marginBottom: 16 }}>To end the lead-fee model that exploits independent workers.</h2>
          <p style={{ fontSize: 15, color: T.dark, lineHeight: 1.75, maxWidth: 680, fontWeight: 700, fontStyle: "italic" }}>
            SurfCoast exists so that everyday people with real skills can find real work. Your profile and listing are free. Communication starts at $1.50 per 10-minute session. You only pay a facilitation fee when work actually happens.
          </p>
        </div>
      </section>

      {/* What Makes SurfCoast Different */}
      <section style={{ background: T.bg, padding: "52px 24px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.1em" }}>// WHAT MAKES SURFCOAST DIFFERENT</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: T.dark, marginBottom: 24 }}>Six things no other platform does.</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {DIFFERENTIATORS.map((text, i) => (
              <div key={i} style={{ ...cardStyle, display: "flex", gap: 16, alignItems: "flex-start", padding: "16px 20px" }}>
                <span style={{ ...mono, fontSize: 13, fontWeight: 700, color: T.amber, flexShrink: 0 }}>{i + 1}.</span>
                <p style={{ fontSize: 14, color: T.dark, lineHeight: 1.7, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section style={{ background: T.dark, padding: "60px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ ...mono, fontSize: 11, color: T.amberBg, marginBottom: 12, letterSpacing: "0.1em" }}>// FOUNDER</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 28 }}>Built by a tradesman, for the tradespeople.</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, alignItems: "start" }}>
            <div>
              <img
                src="https://media.base44.com/images/public/69a61a047827463e7cdbc1eb/93f3cfcd7_IMG_3860.jpg"
                alt="Hector A. Navarrete — Founder of SurfCoast Contractors Marketplace"
                style={{ borderRadius: 10, width: "100%", maxWidth: 340, boxShadow: `3px 3px 0px ${T.amber}`, border: `1px solid ${T.border}` }}
              />
              <div style={{ marginTop: 16 }}>
                <p style={{ fontWeight: 800, color: "#fff", fontSize: 15, marginBottom: 4 }}>Hector A. Navarrete</p>
                <p style={{ ...mono, fontSize: 10, color: "#aaa", letterSpacing: "0.08em", lineHeight: 1.8 }}>
                  C36 Licensed Plumber · Owner, SurfCoast Plumbing<br />
                  Founder, SurfCoast Contractors Marketplace<br />
                  Gracie Jiu-Jitsu Purple Belt
                </p>
              </div>
            </div>

            <div style={{ color: "#ccc", fontSize: 14, lineHeight: 1.85 }}>
              <p style={{ marginBottom: 16 }}>Hector A. Navarrete did not build this platform from a board room. At 14 years old he was homeless. He worked his way up — got into the trades, earned his C36 plumbing license in 2022, and built SurfCoast Plumbing out of South San Diego.</p>
              <p style={{ marginBottom: 16 }}>He also holds a purple belt in Gracie Jiu-Jitsu, a discipline he says taught him the same thing the trades did — that you earn every position, nothing is handed to you, and accountability is not optional.</p>
              <p style={{ marginBottom: 24 }}>SurfCoast Contractors Marketplace is what he wished had existed when he was starting out. He built it because he lived the problem.</p>

              <div style={{ background: T.amberTint, borderLeft: `3px solid ${T.amber}`, borderRadius: 6, padding: "18px 22px" }}>
                <p style={{ fontStyle: "italic", fontWeight: 800, fontSize: 17, color: T.dark, margin: 0 }}>
                  "Being a contractor is not a job title. It is a mindset."
                </p>
                <p style={{ ...mono, fontSize: 10, color: T.amber, marginTop: 8, letterSpacing: "0.1em" }}>— HECTOR A. NAVARRETE</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: T.bg, padding: "52px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.1em" }}>// COMMON QUESTIONS</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: T.dark, marginBottom: 24 }}>About SurfCoast</h2>
          <div style={{ display: "grid", gap: 14 }}>
            {AEO_FAQ.map(({ q, a }) => (
              <div key={q} style={{ ...cardStyle, padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: T.dark, marginBottom: 10 }}>{q}</h3>
                <p style={{ fontSize: 13, color: T.dark, lineHeight: 1.7, margin: 0, fontWeight: 700, fontStyle: "italic" }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why SurfCoast Link */}
      <section style={{ background: "#F5F5F6", borderTop: `1px solid ${T.border}`, padding: "48px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, letterSpacing: "0.1em", marginBottom: 12 }}>// PLATFORM PHILOSOPHY</div>
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, color: T.dark, marginBottom: 12 }}>Why SurfCoast?</h2>
          <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, marginBottom: 24, maxWidth: 560, margin: "0 auto 24px", fontWeight: 700, fontStyle: "italic" }}>
            Learn how our toll-road model, fee structure, and compliance systems were designed to protect workers — not extract from them.
          </p>
          <Link
            to="/WhySurfCoast"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.dark, color: "#fff", textDecoration: "none", borderRadius: 7, padding: "10px 22px", fontSize: 13, fontWeight: 700, boxShadow: T.shadow }}
          >
            Read Why SurfCoast <ChevronRight style={{ width: 15, height: 15 }} />
          </Link>
        </div>
      </section>

      {/* Offerings */}
      <section style={{ background: T.bg, padding: "52px 24px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 10, letterSpacing: "0.1em" }}>// OUR OFFERINGS</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: T.dark, marginBottom: 24 }}>What We Offer</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <div style={{ ...cardStyle, borderTop: `3px solid ${T.amber}`, padding: 28, textAlign: "center" }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: T.dark, marginBottom: 8 }}>WAVE OS Plans</h3>
              <p style={{ fontSize: 13, color: T.muted, marginBottom: 16, fontStyle: "italic" }}>For entrepreneurs and solo professionals</p>
              <div style={{ ...mono, fontSize: 34, fontWeight: 700, color: T.amber, marginBottom: 4 }}>From $19</div>
              <div style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>/month</div>
              <Link to="/pricing" style={{ display: "block", background: T.dark, color: "#fff", textDecoration: "none", borderRadius: 6, padding: "10px 16px", fontSize: 13, fontWeight: 700 }}>View All Plans →</Link>
            </div>
            <div style={{ ...cardStyle, borderTop: `3px solid ${T.border}`, padding: 28, textAlign: "center" }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: T.dark, marginBottom: 8 }}>WAVEshop OS</h3>
              <p style={{ fontSize: 13, color: T.muted, marginBottom: 16, fontStyle: "italic" }}>For farmers market &amp; swap meet booths</p>
              <div style={{ ...mono, fontSize: 34, fontWeight: 700, color: T.dark, marginBottom: 4 }}>$35</div>
              <div style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>/month</div>
              <Link to="/pricing" style={{ display: "block", background: T.dark, color: "#fff", textDecoration: "none", borderRadius: 6, padding: "10px 16px", fontSize: 13, fontWeight: 700 }}>View All Plans →</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}