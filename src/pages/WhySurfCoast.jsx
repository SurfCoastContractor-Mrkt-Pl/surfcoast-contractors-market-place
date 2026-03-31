import { useState } from "react";
import { CheckCircle, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Why SurfCoast", href: "/why-surfcoast" },
  { label: "Pricing", href: "/pricing" },
];

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
    label: "Market Vendors",
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

const WAVE_TIERS = [
  {
    name: "WAVE Starter",
    price: "$19",
    tag: "",
    subtitle: "Best for new contractors getting started",
    pitch: "The perfect entry point for independent professionals just getting started. WAVE Starter gives you everything you need to build your profile, land your first clients, and start operating professionally — without the overhead of a bloated platform.",
    features: [
      "Public contractor profile with photo & bio",
      "Up to 5 active job postings",
      "Basic client messaging",
      "Quote request management",
      "Job scheduling calendar",
      "Mobile app access",
      "Standard customer reviews",
      "Email notifications",
      "Basic analytics dashboard",
      "2-week free trial included"
    ]
  },
  {
    name: "WAVE Pro",
    price: "$39",
    tag: "",
    subtitle: "Best for growing contractors ready to scale",
    pitch: "For contractors who are ready to scale. WAVE Pro unlocks CRM tools, expanded job capacity, and enhanced visibility features that help you turn one-time clients into long-term relationships.",
    features: [
      "Everything in WAVE Starter",
      "Unlimited job postings",
      "Client Relationship Manager (CRM)",
      "Invoice generation & PDF export",
      "Scope of Work builder",
      "After-photo documentation",
      "Project milestone tracking",
      "Priority search placement",
      "Custom service packages",
      "Performance analytics",
      "Referral tracking",
      "Team collaboration tools"
    ]
  },
  {
    name: "WAVE Max",
    price: "$59",
    tag: "Most Popular",
    subtitle: "Best for established contractors who need everything",
    pitch: "WAVE Max is the sweet spot for serious operators. It includes every tool a professional contractor needs to run a tight, efficient business — from document management to real-time GPS tracking and multi-device sync.",
    features: [
      "Everything in WAVE Pro",
      "GPS-based job tracking",
      "Field operations mobile suite",
      "Document management hub",
      "Multi-option client proposals",
      "Escrow payment support",
      "Project file sharing with clients",
      "Progress payment phases",
      "Contractor compliance tools",
      "Real-time availability manager",
      "Advanced scheduling assistant",
      "QuickBooks CSV export",
      "Custom invoice branding"
    ]
  },
  {
    name: "WAVE FO Premium",
    price: "$100",
    tag: "",
    subtitle: "Best for licensed sole proprietors (HIS verified)",
    pitch: "Built for licensed professionals and growing businesses that demand the full suite. WAVE FO Premium includes everything in Max, plus AI-powered tools, advanced analytics, and integrations with external platforms like Notion and HubSpot.",
    features: [
      "Everything in WAVE Max",
      "AI scheduling assistant",
      "AI bio & proposal generator",
      "HubSpot CRM sync",
      "Notion project page integration",
      "Campaign management tools",
      "Case study builder",
      "Contractor leaderboard & trade games",
      "Full audit trail & activity log",
      "Advanced job pipeline views",
      "Residential Wave invoicing suite",
      "Priority support"
    ]
  },
  {
    name: "WAVE Residential Bundle",
    price: "$125",
    tag: "All-In",
    subtitle: "Best for licensed operators who want everything",
    pitch: "The ultimate contractor package. WAVE Residential Bundle combines the WAVE FO Premium plan ($100/month) and the $50/month Unlimited Communication subscription — giving you unlimited client messaging, lead capture, scope signing, and full Residential Wave invoicing, all under one bundled price.",
    features: [
      "Everything in WAVE FO Premium ($100/month value)",
      "Unlimited client communication — $50/month subscription included",
      "Unlimited messaging with clients — no per-session fees",
      "Residential Wave lead management",
      "Residential Wave job tracking",
      "Residential Wave invoice management",
      "Bundle-exclusive document templates",
      "Revenue tracking & bundle reports",
      "White-label invoice option",
      "Early access to new features",
      "Full platform access — no add-ons needed"
    ]
  }
];

const STAND_APART = [
  {
    title: "Discovery is built in",
    body: "Your profile is searchable from day one — no ad spend required. Customers in your area find you based on trade, location, availability, and ratings."
  },
  {
    title: "Free forever profile",
    body: "You never pay just to exist on the platform. Every professional gets a free public profile with reviews, portfolio images, and contact info."
  },
  {
    title: "Pricing built for solo operators",
    body: "No enterprise minimums, no per-seat fees. Starting at $19/month, every tier is priced for the independent worker — not a 10-person office."
  },
  {
    title: "Works for every worker type",
    body: "Trades, vendors, creatives — all in one place. SurfCoast is built for the full spectrum of independent workers, not a narrow niche."
  },
  {
    title: "WAVEShop has zero commissions",
    body: "You keep every dollar you earn. The $35/month subscription is the only cost — no percentages taken on sales, ever."
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
  ["Market vendor support", true, false],
  ["No commission on vendor sales", true, false],
  ["Compliance tools built in", true, false],
  ["Mobile-first design", true, false],
  ["Integrated job + market platform", true, false],
  ["Cancel anytime", true, false],
];

export default function WhySurfCoast() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", background: "#fff", color: "#111" }}>
      {/* NAV */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,22,40,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ display: "flex", flexDirection: "column", gap: "1px", textDecoration: "none" }}>
          <span style={{ fontSize: "14px", fontWeight: "800", color: "#fff", letterSpacing: "-0.5px", lineHeight: 1 }}>SurfCoast</span>
          <span style={{ fontSize: "8px", fontWeight: "700", letterSpacing: "1.5px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>MARKETPLACE</span>
        </a>
        <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: "13px", fontWeight: "600", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.8)"}
            >{l.label}</a>
          ))}
          <a href="/" onClick={e => { e.preventDefault(); window.base44?.auth?.redirectToLogin?.() || (window.location.href = "/"); }}
            style={{ background: "#1d6fa4", color: "#fff", padding: "7px 18px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", textDecoration: "none", border: "1px solid #2589c7" }}>
            Enter
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a3050 100%)", color: "#fff", textAlign: "center", padding: "100px 24px 80px" }}>
        <p style={{ fontSize: "13px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#d97706", marginBottom: "20px" }}>The Real Worker's Platform</p>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 68px)", fontWeight: "900", margin: "0 0 24px", lineHeight: 1.05, letterSpacing: "-2px", maxWidth: "900px", marginLeft: "auto", marginRight: "auto" }}>
          Built for the People Who<br />Actually Do the Work
        </h1>
        <p style={{ fontSize: "clamp(16px, 2.5vw, 22px)", color: "rgba(255,255,255,0.75)", maxWidth: "680px", margin: "0 auto 40px", lineHeight: 1.6 }}>
          SurfCoast Marketplace exists for independent workers, solo operators, and small trades businesses who need real tools — not corporate software built for someone else.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/BecomeContractor" style={{ background: "#d97706", color: "#fff", padding: "14px 32px", borderRadius: "8px", fontSize: "15px", fontWeight: "700", textDecoration: "none" }}>Create Free Profile</a>
          <a href="/pricing" style={{ background: "transparent", color: "#fff", padding: "14px 32px", borderRadius: "8px", fontSize: "15px", fontWeight: "700", textDecoration: "none", border: "2px solid rgba(255,255,255,0.3)" }}>View All Plans</a>
        </div>
      </section>

      {/* WHAT IS SURFCOAST */}
      <section style={{ maxWidth: "860px", margin: "0 auto", padding: "80px 24px" }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", marginBottom: "40px", letterSpacing: "-1px" }}>What Is SurfCoast Marketplace?</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {[
            "SurfCoast Marketplace is a two-sided platform connecting people who need work done with the people who do it. Whether you're a homeowner looking for a licensed plumber or a vendor setting up a booth at the local farmers market — SurfCoast is where that connection happens.",
            "There are two tracks: the Contractor Marketplace for trades and residential services, and WAVEShop for market vendors. Both run on the same platform, built around the same belief — that independent workers deserve better tools.",
            "Every profile on SurfCoast is free. You never pay to be found. You only upgrade when you need more."
          ].map((p, i) => (
            <p key={i} style={{ fontSize: "17px", lineHeight: 1.8, color: i === 2 ? "#0a1628" : "#374151", fontWeight: i === 2 ? "700" : "400", margin: 0, borderLeft: i === 2 ? "4px solid #d97706" : "none", paddingLeft: i === 2 ? "20px" : "0" }}>{p}</p>
          ))}
        </div>
      </section>

      {/* WHO IS THIS FOR */}
      <section style={{ background: "#f8f9fa", padding: "80px 24px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", marginBottom: "12px", letterSpacing: "-1px", textAlign: "center" }}>Who Is This For?</h2>
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "17px", marginBottom: "40px" }}>SurfCoast supports over 60 categories of independent workers across three main groups.</p>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "36px", flexWrap: "wrap", gap: "8px" }}>
            {WHO_TABS.map((t, i) => (
              <button key={i} onClick={() => setActiveTab(i)}
                style={{ padding: "10px 22px", borderRadius: "24px", border: "2px solid", fontSize: "14px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s",
                  background: activeTab === i ? "#0a1628" : "transparent",
                  color: activeTab === i ? "#fff" : "#374151",
                  borderColor: activeTab === i ? "#0a1628" : "#d1d5db"
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
            "You start with a free Basic Profile. When your business is ready for more, you upgrade. Month to month, no commitment, cancel anytime."
          ].map((p, i) => (
            <p key={i} style={{ fontSize: "17px", lineHeight: 1.8, color: "#374151", margin: 0 }}>{p}</p>
          ))}
        </div>
      </section>

      {/* WAVE FO TIER CARDS */}
      <section style={{ background: "#f8f9fa", padding: "80px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", marginBottom: "12px", letterSpacing: "-1px", textAlign: "center" }}>WAVE FO (Field Operations) Plans</h2>
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "17px", marginBottom: "48px" }}>For contractors and independent professionals. All plans include a 2-week free trial.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
            {WAVE_TIERS.map((tier, i) => (
              <div key={i} style={{ background: "#fff", border: tier.tag === "Most Popular" ? "2px solid #d97706" : tier.tag === "All-In" ? "2px solid #0a1628" : "1px solid #e5e7eb", borderRadius: "16px", padding: "28px 22px", display: "flex", flexDirection: "column", gap: "14px", position: "relative" }}>
                {tier.tag && (
                  <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", background: tier.tag === "Most Popular" ? "#d97706" : "#0a1628", color: "#fff", fontSize: "10px", fontWeight: "800", padding: "4px 12px", borderRadius: "20px", letterSpacing: "1px", whiteSpace: "nowrap" }}>{tier.tag}</div>
                )}
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 2px" }}>{tier.name}</h3>
                  <p style={{ fontSize: "11px", color: "#6b7280", margin: "0 0 8px", fontWeight: "500" }}>{tier.subtitle}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{ fontSize: "36px", fontWeight: "900", color: "#d97706" }}>{tier.price}</span>
                    <span style={{ fontSize: "13px", color: "#6b7280" }}>/month</span>
                  </div>
                </div>
                <p style={{ fontSize: "13px", lineHeight: 1.65, color: "#374151", margin: 0 }}>{tier.pitch}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "7px", flex: 1 }}>
                  {tier.features.map((f, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", color: "#374151" }}>
                      <CheckCircle size={13} style={{ color: "#d97706", marginTop: "2px", flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/BecomeContractor" style={{ display: "block", textAlign: "center", background: tier.tag === "Most Popular" ? "#d97706" : tier.tag === "All-In" ? "#0a1628" : "#0a1628", color: "#fff", padding: "11px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", textDecoration: "none", marginTop: "8px" }}>
                  Get Started
                </a>
              </div>
            ))}
          </div>

          {/* WAVEShop Card */}
          <div style={{ marginTop: "48px", background: "#fff", border: "2px solid #9d7a54", borderRadius: "16px", padding: "40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start" }}>
            <div>
              <p style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "#9d7a54", marginBottom: "8px" }}>Market Vendors</p>
              <h3 style={{ fontSize: "28px", fontWeight: "900", margin: "0 0 8px" }}>WAVEShop Vendor</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "16px" }}>
                <span style={{ fontSize: "48px", fontWeight: "900", color: "#9d7a54" }}>$35</span>
                <span style={{ fontSize: "14px", color: "#6b7280" }}>/month</span>
              </div>
              <p style={{ fontSize: "15px", lineHeight: 1.8, color: "#374151", marginBottom: "20px" }}>
                For farmers market and swap meet vendors who want a professional booth presence without giving away a cut of every sale. WAVEShop is a flat-rate subscription that covers everything you need — listings, reviews, inventory, and discovery — with zero commission taken on your sales ever.
              </p>
              <a href="/MarketShopSignup" style={{ display: "inline-block", background: "#9d7a54", color: "#fff", padding: "13px 28px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", textDecoration: "none" }}>
                Set Up Your Booth
              </a>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "Public booth/shop profile page",
                "Product listings with photos & prices",
                "Inventory tracking",
                "Customer reviews & ratings",
                "Farmers market & swap meet directory listing",
                "Booth schedule management",
                "Analytics dashboard",
                "Vendor inquiry inbox",
                "Marketing toolkit",
                "Social media link integration",
                "Photo gallery (up to 20 images)",
                "Zero commission on all sales",
                "Mobile-optimized dashboard",
                "Early adopter pricing locked in"
              ].map((f, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "14px", color: "#374151" }}>
                  <CheckCircle size={14} style={{ color: "#9d7a54", marginTop: "2px", flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* HOW WE STAND APART */}
      <section style={{ maxWidth: "960px", margin: "0 auto", padding: "80px 24px" }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", marginBottom: "12px", letterSpacing: "-1px", textAlign: "center" }}>How SurfCoast Stands Apart</h2>
        <p style={{ textAlign: "center", color: "#6b7280", fontSize: "17px", marginBottom: "56px" }}>Six real differences — not marketing bullet points.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
          {STAND_APART.map((s, i) => (
            <div key={i} style={{ borderLeft: "3px solid #d97706", paddingLeft: "20px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "800", margin: "0 0 10px" }}>{s.title}</h3>
              <p style={{ fontSize: "15px", lineHeight: 1.75, color: "#374151", margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section style={{ background: "#f8f9fa", padding: "80px 24px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", marginBottom: "48px", letterSpacing: "-1px", textAlign: "center" }}>SurfCoast vs. Typical Field Service Platform</h2>
          <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", border: "1px solid #e5e7eb" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px", background: "#0a1628", color: "#fff", padding: "16px 24px", fontSize: "13px", fontWeight: "700" }}>
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
      <section style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a3050 100%)", color: "#fff", textAlign: "center", padding: "100px 24px" }}>
        <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: "900", margin: "0 0 20px", letterSpacing: "-1.5px" }}>Ready to Get Started?</h2>
        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.75)", maxWidth: "540px", margin: "0 auto 40px", lineHeight: 1.65 }}>
          Create your free profile today — no credit card, no commitment. Join the marketplace built for people who actually work.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/BecomeContractor" style={{ background: "#d97706", color: "#fff", padding: "16px 36px", borderRadius: "8px", fontSize: "16px", fontWeight: "700", textDecoration: "none" }}>Create Free Profile</a>
          <a href="/pricing" style={{ background: "transparent", color: "#fff", padding: "16px 36px", borderRadius: "8px", fontSize: "16px", fontWeight: "700", textDecoration: "none", border: "2px solid rgba(255,255,255,0.35)" }}>View All Plans</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0a1628", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 24px", textAlign: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: 0 }}>© 2026 SurfCoast Marketplace. All rights reserved. · <a href="/Terms" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Terms</a> · <a href="/PrivacyPolicy" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Privacy</a></p>
      </footer>
    </div>
  );
}