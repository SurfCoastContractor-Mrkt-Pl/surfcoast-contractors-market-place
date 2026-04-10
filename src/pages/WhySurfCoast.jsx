import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, X } from "lucide-react";

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

const WHO_TABS = [
  {
    label: "Entrepreneurs & Trades",
    types: [
      "Plumbers", "Electricians", "HVAC Technicians", "Roofers", "Painters",
      "Carpenters", "Landscapers", "Pool Service", "Pest Control", "Concrete",
      "Tile & Flooring", "Fencing", "Drywall", "Solar Installers", "Handymen",
      "Pressure Washing", "Tree Service", "Appliance Repair", "General Contractors", "Home Inspectors"
    ]
  },
  {
    label: "Market Booth Operators",
    types: [
      "Food Vendors", "Bakers", "Jewelry Makers", "Clothing Boutiques", "Plant Nurseries",
      "Candle Makers", "Vintage Collectors", "Farmers & Produce", "Artisan Crafts", "Pet Supplies",
      "Health & Wellness", "Soap & Skincare", "Toys & Kids", "Home Décor", "Antiques",
      "Food Trucks", "Photography", "Art & Prints", "Specialty Foods", "Handmade Goods"
    ]
  },
  {
    label: "Solo & Creative",
    types: [
      "Freelancers", "Independent Cleaners", "Mobile Detailers", "Personal Trainers", "Tutors",
      "Pet Groomers", "Event Setup", "Photographers", "Notaries", "Delivery Drivers",
      "Virtual Assistants", "Social Media Managers", "Bookkeepers", "Copywriters", "Videographers",
      "Life Coaches", "Yoga Instructors", "Musicians", "Illustrators", "Content Creators"
    ]
  }
];

const STAND_APART = [
  { title: "Discovery is built in", body: "Your profile is searchable from day one — no ad spend required. Clients in your area find you based on trade, location, availability, and ratings." },
  { title: "Free forever profile", body: "You never pay just to exist on the platform. Every professional gets a free public profile with reviews, portfolio images, and contact info." },
  { title: "Pricing built for solo operators", body: "No enterprise minimums, no per-seat fees. WAVE OS Starter is just $19/month — every tier is priced for the independent worker, not a 10-person office." },
  { title: "Works for every worker type", body: "Trades, booth operators, creatives — all in one place. SurfCoast is built for the full spectrum of independent workers, not a narrow niche." },
  { title: "WAVEshop OS has no commissions when subscribed", body: "Choose your model: pay 5% per sale OR subscribe to $20/month to keep 100% of earnings. No commissions with subscription." },
  { title: "Platform independence — legally clear", body: "SurfCoast Marketplace is a neutral technology platform that facilitates connections between independent entrepreneurs and clients. SurfCoast does not employ, supervise, direct, or control the work of any entrepreneur, nor does it guarantee the quality, safety, legality, or timeliness of any services arranged through the platform. Each entrepreneur operates as an independent service provider solely responsible for their own licensing, agreements, insurance, and any required verifications. SurfCoast's role is limited to providing connection tools — the service relationship exists exclusively between the entrepreneur and the client." },
];

const COMPARISON_ROWS = [
  ["Free profile & discovery", true, false],
  ["No setup fees", true, false],
  ["Month-to-month plans", true, false],
  ["Built for solo operators", true, false],
  ["Market booth operator support", true, false],
  ["No commission on booth sales", true, false],
  ["Compliance tools built in", true, false],
  ["Mobile-first design", true, false],
  ["Integrated job + market platform", true, false],
  ["Cancel anytime", true, false],
];

const goldGlowSm = "0 0 14px 3px rgba(255,180,0,0.3)";

export default function WhySurfCoast() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh", background: T.bg }}>

      {/* Ticker */}
      <div style={{ background: T.dark, padding: "6px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
        <span style={{ ...mono, fontSize: 11, color: "#e0e0e0" }}>// WHY SURFCOAST · THE REAL WORKER'S PLATFORM</span>
        <span style={{ ...mono, fontSize: 11, color: "#ffffff" }}>California · Nationwide</span>
      </div>

      {/* HERO */}
      <section style={{ background: T.dark, color: "#fff", textAlign: "center", padding: "72px 24px 56px" }}>
        <div style={{ ...mono, fontSize: 13, color: T.amberBg, marginBottom: 20, letterSpacing: "0.1em" }}>// THE REAL WORKER'S PLATFORM</div>
        <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", fontWeight: 900, margin: "0 0 24px", lineHeight: 1.08, letterSpacing: "-1px", maxWidth: 900, marginLeft: "auto", marginRight: "auto" }}>
          Built for the People Who<br />Actually Do the Work
        </h1>
        <p style={{ fontSize: "clamp(15px, 2.5vw, 19px)", color: "#ccc", maxWidth: 680, margin: "0 auto 36px", lineHeight: 1.6 }}>
          SurfCoast Marketplace exists for independent workers, solo operators, and small trades businesses who need real tools — not corporate software built for someone else.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/BecomeContractor" style={{ background: T.amberBg, color: T.amber, border: `1px solid #D9B88A`, borderRadius: 6, padding: "11px 26px", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: T.shadow }}>Get Started Free</Link>
          <Link to="/pricing" style={{ background: "transparent", color: "#fff", padding: "11px 26px", borderRadius: 6, fontSize: 14, fontWeight: 700, textDecoration: "none", border: `1px solid rgba(255,255,255,0.25)` }}>View All Plans</Link>
        </div>
      </section>

      {/* WHAT IS SURFCOAST */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.1em" }}>// WHAT IS SURFCOAST MARKETPLACE</div>
        <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: 36, color: T.dark }}>What Is SurfCoast Marketplace?</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            "SurfCoast Marketplace is where people who need work done find the people who actually do it. Whether you are a homeowner looking for a skilled plumber or a booth operator at the local farmers market — SurfCoast is where you connect.",
            "There are two tracks: SurfCoast Marketplace for entrepreneurs and independent service workers, and WAVEshop OS for market booth operators. Both run on the same platform, built around the same belief — that independent workers deserve better tools.",
            "Every profile on SurfCoast is free. You never pay just to be found. The WAVE OS system has tools to help you grow when you need it — but it is never required to complete your journey."
          ].map((p, i) => (
            <p key={i} style={{ fontSize: 16, lineHeight: 1.8, color: T.dark, fontWeight: i === 2 ? 700 : 400, fontStyle: i === 2 ? "italic" : "normal", margin: 0, borderLeft: i === 2 ? `3px solid ${T.amber}` : "none", paddingLeft: i === 2 ? 20 : 0 }}>{p}</p>
          ))}
        </div>
      </section>

      {/* WHO IS THIS FOR */}
      <section style={{ background: "#F5F5F6", padding: "64px 24px", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.1em", textAlign: "center" }}>// WHO IS THIS FOR</div>
          <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: 10, textAlign: "center", color: T.dark }}>Who Is This For?</h2>
          <p style={{ textAlign: "center", color: T.muted, fontSize: 15, marginBottom: 36, fontStyle: "italic" }}>SurfCoast supports over 60 categories of independent workers across three main groups.</p>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32, flexWrap: "wrap", gap: 8 }}>
            {WHO_TABS.map((t, i) => (
              <button key={i} onClick={() => setActiveTab(i)}
                style={{ ...mono, padding: "8px 18px", borderRadius: 6, border: `1px solid ${i === activeTab ? T.amber : T.border}`, fontSize: 12, cursor: "pointer", transition: "all 0.15s",
                  background: i === activeTab ? T.amberTint : T.card,
                  color: i === activeTab ? T.amber : T.muted,
                }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            {WHO_TABS[activeTab].types.map((type, i) => (
              <div key={i} style={{ ...cardStyle, padding: "10px 14px", fontSize: 13, color: T.dark, display: "flex", alignItems: "center", gap: 8, boxShadow: "none", border: `0.5px solid ${T.border}` }}>
                <CheckCircle size={13} style={{ color: T.amber, flexShrink: 0 }} />
                {type}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WAVE OS EXPLANATION */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 10, letterSpacing: "0.1em" }}>// WHAT IS WAVE OS</div>
        <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: 24, color: T.dark }}>What Is WAVE OS?</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            "WAVE OS is a set of tools built specifically for workers and entrepreneurs. It starts free and grows with you. Each level provides more — better ways to schedule, simpler invoicing, clear project insights, and helpful features — without tying you into contracts. WAVE OS tools become available as you complete projects on the platform.",
            "WAVEshop OS is the same ecosystem applied to market booth operators — farmers market sellers, flea market booth holders, and swap meet space operators. It gives in-person sellers professional tools: inventory, scheduling, client management, and analytics, all under a flat $35 per month.",
            "You start with a free Basic Profile. The free Basic Dashboard handles the essentials for everyone. When your business is ready for more, you upgrade. Month to month, no commitment, cancel anytime."
          ].map((p, i) => (
            <p key={i} style={{ fontSize: 16, lineHeight: 1.8, color: T.dark, margin: 0, fontStyle: "italic" }}>{p}</p>
          ))}
        </div>
        <div style={{ marginTop: 36 }}>
          <Link to="/pricing" style={{ ...mono, fontSize: 13, background: T.dark, color: "#fff", padding: "11px 24px", borderRadius: 6, textDecoration: "none", boxShadow: T.shadow }}>See All Plans & Pricing →</Link>
        </div>
      </section>

      {/* HOW WE STAND APART */}
      <section style={{ background: "#F5F5F6", padding: "64px 24px", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.1em", textAlign: "center" }}>// HOW WE STAND APART</div>
          <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: 10, textAlign: "center", color: T.dark }}>How SurfCoast Stands Apart</h2>
          <p style={{ textAlign: "center", color: T.muted, fontSize: 15, marginBottom: 48, fontStyle: "italic" }}>Six real differences — not marketing bullet points.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {STAND_APART.map((s, i) => (
              <div key={i} style={{ borderLeft: `3px solid ${T.amber}`, paddingLeft: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 10px", color: T.dark }}>{s.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.75, color: T.muted, margin: 0, fontStyle: "italic" }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section style={{ background: T.bg, padding: "64px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.1em", textAlign: "center" }}>// COMPARISON</div>
          <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: 40, textAlign: "center", color: T.dark }}>SurfCoast vs. Typical Field Service Platform</h2>
          <div style={{ ...cardStyle, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px", background: T.dark, color: "#fff", padding: "14px 24px", fontSize: 12, fontWeight: 700 }}>
              <span>Feature</span>
              <span style={{ textAlign: "center" }}>SurfCoast</span>
              <span style={{ textAlign: "center" }}>Typical Platform</span>
            </div>
            {COMPARISON_ROWS.map(([label, sc, tp], i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px", padding: "13px 24px", borderBottom: `1px solid ${T.border}`, background: i % 2 === 0 ? T.card : T.bg, fontSize: 13, alignItems: "center" }}>
                <span style={{ color: T.dark }}>{label}</span>
                <span style={{ textAlign: "center" }}>
                  {sc ? <CheckCircle size={17} style={{ color: "#16a34a", display: "inline" }} /> : <X size={17} style={{ color: "#ef4444", display: "inline" }} />}
                </span>
                <span style={{ textAlign: "center" }}>
                  {tp ? <CheckCircle size={17} style={{ color: "#16a34a", display: "inline" }} /> : <X size={17} style={{ color: "#ef4444", display: "inline" }} />}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: T.dark, color: "#fff", textAlign: "center", padding: "72px 24px" }}>
        <div style={{ ...mono, fontSize: 11, color: T.amberBg, marginBottom: 12, letterSpacing: "0.1em" }}>// GET STARTED</div>
        <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, margin: "0 0 20px", letterSpacing: "-1px" }}>Ready to Get Started?</h2>
        <p style={{ fontSize: 17, color: "#ccc", maxWidth: 540, margin: "0 auto 36px", lineHeight: 1.65, fontStyle: "italic" }}>
          Create your free profile today — no credit card, no commitment. Join the marketplace built for people who actually work, by someone who understands the hustle.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/BecomeContractor" style={{ background: T.amberBg, color: T.amber, padding: "13px 30px", borderRadius: 6, fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: T.shadow }}>Get Started Free</Link>
          <Link to="/pricing" style={{ background: "transparent", color: "#fff", padding: "13px 30px", borderRadius: 6, fontSize: 15, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.25)" }}>View All Plans</Link>
        </div>
      </section>

    </div>
  );
}