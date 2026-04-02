import { useState } from "react";
import { CheckCircle, X } from "lucide-react";

const WHO_TABS = [
  {
    label: "Contractors & Trades",
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
  {
    title: "Discovery is built in",
    body: "Your profile is searchable from day one — no ad spend required. Clients in your area find you based on trade, location, availability, and ratings."
  },
  {
    title: "Free forever profile",
    body: "You never pay just to exist on the platform. Every professional gets a free public profile with reviews, portfolio images, and contact info."
  },
  {
    title: "Pricing built for solo operators",
    body: "No enterprise minimums, no per-seat fees. WAVE FO Starter is just $19/month — every tier is priced for the independent worker, not a 10-person office."
  },
  {
    title: "Works for every worker type",
    body: "Trades, booth operators, creatives — all in one place. SurfCoast is built for the full spectrum of independent workers, not a narrow niche."
  },
  {
    title: "WAVEShop FO has no commissions when subscribed",
    body: "Choose your model: pay 5% per sale OR subscribe to $20/month to keep 100% of earnings. No commissions with subscription."
  },
  {
    title: "California compliance built in",
    body: "Licensing, waivers, and acknowledgments are handled inside the platform — not bolted on as an afterthought."
  }
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

export default function WhySurfCoast() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: "#111" }}>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #ea580c 100%)", color: "#fff", textAlign: "center", padding: "100px 24px 80px" }}>
        <p style={{ fontSize: "13px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#d97706", marginBottom: "20px" }}>The Real Worker's Platform</p>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 68px)", fontWeight: "900", margin: "0 0 24px", lineHeight: 1.05, letterSpacing: "-2px", maxWidth: "900px", marginLeft: "auto", marginRight: "auto" }}>
          Built for the People Who<br />Actually Do the Work
        </h1>
        <p style={{ fontSize: "clamp(16px, 2.5vw, 22px)", color: "rgba(255,255,255,0.75)", maxWidth: "680px", margin: "0 auto 40px", lineHeight: 1.6 }}>
          SurfCoast Marketplace exists for independent workers, solo operators, and small trades businesses who need real tools — not corporate software built for someone else.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/BecomeContractor" style={{ background: "#d97706", color: "#fff", padding: "14px 32px", borderRadius: "8px", fontSize: "15px", fontWeight: "700", textDecoration: "none" }}>Get Started Free</a>
          <a href="/pricing" style={{ background: "transparent", color: "#fff", padding: "14px 32px", borderRadius: "8px", fontSize: "15px", fontWeight: "700", textDecoration: "none", border: "2px solid rgba(255,255,255,0.3)" }}>View All Plans</a>
        </div>
      </section>

      {/* WHAT IS SURFCOAST */}
      <section style={{ maxWidth: "860px", margin: "0 auto", padding: "80px 24px" }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", marginBottom: "40px", letterSpacing: "-1px", color: "hsl(215, 35%, 10%)" }}>What Is SurfCoast Marketplace?</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {[
            "SurfCoast Marketplace is a two-sided platform connecting people who need work done with the people who do it. Whether you're a homeowner looking for a licensed plumber or a booth operator setting up at the local farmers market — SurfCoast is where that connection happens.",
            "There are two tracks: the Contractor Marketplace for trades and residential services, and WAVEShop FO for market booth operators. Both run on the same platform, built around the same belief — that independent workers deserve better tools.",
            "Every profile on SurfCoast is free. You never pay to be found. You only upgrade when you need more."
          ].map((p, i) => (
            <p key={i} style={{ fontSize: "17px", lineHeight: 1.8, color: i === 2 ? "hsl(210, 75%, 38%)" : "hsl(215, 20%, 20%)", fontWeight: i === 2 ? "700" : "400", margin: 0, borderLeft: i === 2 ? "4px solid hsl(25, 95%, 53%)" : "none", paddingLeft: i === 2 ? "20px" : "0" }}>{p}</p>
          ))}
        </div>
      </section>

      {/* WHO IS THIS FOR */}
      <section style={{ background: "hsl(210, 15%, 94%)", padding: "80px 24px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", marginBottom: "12px", letterSpacing: "-1px", textAlign: "center" }}>Who Is This For?</h2>
          <p style={{ textAlign: "center", color: "hsl(215, 20%, 25%)", fontSize: "17px", marginBottom: "40px" }}>SurfCoast supports over 60 categories of independent workers across three main groups.</p>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "36px", flexWrap: "wrap", gap: "8px" }}>
            {WHO_TABS.map((t, i) => (
              <button key={i} onClick={() => setActiveTab(i)}
                style={{ padding: "10px 22px", borderRadius: "24px", border: "2px solid", fontSize: "14px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s",
                  background: activeTab === i ? "#1246a0" : "transparent",
                  color: activeTab === i ? "#fff" : "#374151",
                  borderColor: activeTab === i ? "#1246a0" : "#d1d5db"
                }}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
            {WHO_TABS[activeTab].types.map((type, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px 16px", fontSize: "14px", fontWeight: "500", color: "#111", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle size={14} style={{ color: "#d97706", flexShrink: 0 }} />
                {type}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WAVE FO EXPLANATION */}
      <section style={{ maxWidth: "860px", margin: "0 auto", padding: "80px 24px" }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", marginBottom: "24px", letterSpacing: "-1px" }}>What Is WAVE FO (Field Operations)?</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {[
            "WAVE FO (Field Operations) is SurfCoast's field operations ecosystem — a tiered set of tools built specifically for contractors and independent workers. It starts free and grows with you. Every tier unlocks more — better scheduling, smarter invoicing, deeper analytics, compliance tools — without locking you into a contract.",
            "WAVEShop FO is the same ecosystem applied to market booth operators — farmers market sellers, flea market booth holders, and swap meet space operators. It gives in-person sellers the same professional tools: inventory, scheduling, client management, and analytics, all under one flat monthly rate.",
            "You start with a free Basic Profile. When your business is ready for more, you upgrade. Month to month, no commitment, cancel anytime."
          ].map((p, i) => (
            <p key={i} style={{ fontSize: "17px", lineHeight: 1.8, color: "#374151", margin: 0 }}>{p}</p>
          ))}
        </div>
        <div style={{ marginTop: "40px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a href="/pricing" style={{ background: "linear-gradient(90deg, #0d2a52, #1246a0)", color: "#fff", padding: "13px 28px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", textDecoration: "none" }}>See All Plans & Pricing →</a>
        </div>
      </section>

      {/* HOW WE STAND APART */}
      <section style={{ maxWidth: "960px", margin: "0 auto", padding: "80px 24px" }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", marginBottom: "12px", letterSpacing: "-1px", textAlign: "center", color: "hsl(215, 35%, 10%)" }}>How SurfCoast Stands Apart</h2>
        <p style={{ textAlign: "center", color: "hsl(215, 20%, 25%)", fontSize: "17px", marginBottom: "56px" }}>Six real differences — not marketing bullet points.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
          {STAND_APART.map((s, i) => (
            <div key={i} style={{ borderLeft: "3px solid hsl(25, 95%, 53%)", paddingLeft: "20px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "800", margin: "0 0 10px", color: "hsl(215, 35%, 10%)" }}>{s.title}</h3>
              <p style={{ fontSize: "15px", lineHeight: 1.75, color: "hsl(215, 20%, 20%)", margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section style={{ background: "hsl(210, 15%, 94%)", padding: "80px 24px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", marginBottom: "48px", letterSpacing: "-1px", textAlign: "center" }}>SurfCoast vs. Typical Field Service Platform</h2>
          <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", border: "1px solid #e5e7eb" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px", background: "var(--gradient-brand)", color: "#fff", padding: "16px 24px", fontSize: "13px", fontWeight: "700" }}>
              <span>Feature</span>
              <span style={{ textAlign: "center" }}>SurfCoast</span>
              <span style={{ textAlign: "center" }}>Typical Platform</span>
            </div>
            {COMPARISON_ROWS.map(([label, sc, tp], i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px", padding: "14px 24px", borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa", fontSize: "14px", alignItems: "center" }}>
                <span style={{ color: "#374151" }}>{label}</span>
                <span style={{ textAlign: "center" }}>
                  {sc ? <CheckCircle size={18} style={{ color: "#16a34a", display: "inline" }} /> : <X size={18} style={{ color: "#ef4444", display: "inline" }} />}
                </span>
                <span style={{ textAlign: "center" }}>
                  {tp ? <CheckCircle size={18} style={{ color: "#16a34a", display: "inline" }} /> : <X size={18} style={{ color: "#ef4444", display: "inline" }} />}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #ea580c 100%)", color: "#fff", textAlign: "center", padding: "100px 24px" }}>
        <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: "900", margin: "0 0 20px", letterSpacing: "-1.5px" }}>Ready to Get Started?</h2>
        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.75)", maxWidth: "540px", margin: "0 auto 40px", lineHeight: 1.65 }}>
          Create your free profile today — no credit card, no commitment. Join the marketplace built for people who actually work.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/BecomeContractor" style={{ background: "#d97706", color: "#fff", padding: "16px 36px", borderRadius: "8px", fontSize: "16px", fontWeight: "700", textDecoration: "none" }}>Get Started Free</a>
          <a href="/pricing" style={{ background: "transparent", color: "#fff", padding: "16px 36px", borderRadius: "8px", fontSize: "16px", fontWeight: "700", textDecoration: "none", border: "2px solid rgba(255,255,255,0.35)" }}>View All Plans</a>
        </div>
      </section>

    </div>
  );
}