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
      "Electricians", "Plumbers", "HVAC Technicians", "Carpenters", "Roofers",
      "Painters", "Masons", "Landscapers", "Welders", "Tilers",
      "General Contractors", "Handymen", "Appliance Repair", "Locksmiths", "Flooring Specialists",
      "Pool & Spa Technicians", "Solar Installers", "Fence Contractors", "Drywall Specialists", "Insulation Contractors"
    ]
  },
  {
    label: "Market Vendors",
    types: [
      "Farmers Market Sellers", "Swap Meet Vendors", "Artisan Bakers", "Produce Growers",
      "Craft Makers", "Candle & Soap Makers", "Jewelry Designers", "Vintage Collectors",
      "Hot Food Vendors", "Plant Nurseries", "Honey & Jam Sellers", "Textile Makers",
      "Woodworkers", "Pottery Artists", "Mushroom Foragers", "Spice Blenders",
      "Pet Treat Bakers", "Handmade Clothing", "Fermented Food Makers", "Flower Growers"
    ]
  },
  {
    label: "Solo & Creative",
    types: [
      "Freelance Designers", "Photographers", "Videographers", "Copywriters",
      "Social Media Managers", "Virtual Assistants", "Bookkeepers", "Tutors & Educators",
      "Life Coaches", "Fitness Trainers", "Yoga Instructors", "Translators",
      "Pet Sitters", "Dog Walkers", "House Cleaners", "Personal Organizers",
      "Musicians", "Illustrators", "UX Designers", "Content Creators"
    ]
  }
];

const WAVE_TIERS = [
  {
    name: "Wave Starter",
    price: "$19",
    tag: "",
    pitch: "The perfect entry point for independent professionals just getting started. Wave Starter gives you everything you need to build your profile, land your first clients, and start operating professionally — without the overhead of a bloated platform.",
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
    name: "Wave Pro",
    price: "$39",
    tag: "",
    pitch: "For contractors who are ready to scale. Wave Pro unlocks CRM tools, expanded job capacity, and enhanced visibility features that help you turn one-time clients into long-term relationships.",
    features: [
      "Everything in Wave Starter",
      "Unlimited job postings",
      "Client relationship manager (CRM)",
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
    name: "Wave Max",
    price: "$59",
    tag: "Most Popular",
    pitch: "Wave Max is the sweet spot for serious operators. It includes every tool a professional contractor needs to run a tight, efficient business — from document management to real-time GPS tracking and multi-device sync.",
    features: [
      "Everything in Wave Pro",
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
    name: "Wave Premium",
    price: "$100",
    tag: "",
    pitch: "Built for licensed professionals and growing businesses that demand the full suite. Wave Premium includes everything in Max, plus AI-powered tools, advanced analytics, and integrations with external platforms like Notion and HubSpot.",
    features: [
      "Everything in Wave Max",
      "AI scheduling assistant",
      "AI bio & proposal generator",
      "HubSpot CRM sync",
      "Notion project page integration",
      "Campaign management tools",
      "Case study builder",
      "Contractor leaderboard",
      "Trade game discount system",
      "Full audit trail & activity log",
      "Advanced job pipeline views",
      "Residential wave invoicing suite",
      "Dedicated support priority"
    ]
  },
  {
    name: "Wave Bundle",
    price: "$125",
    tag: "All Included",
    pitch: "The ultimate contractor package. Wave Bundle combines Wave Premium with the full Residential Wave invoicing suite — everything from lead capture to scope signing to final invoice delivery, all under one subscription.",
    features: [
      "Everything in Wave Premium",
      "Residential Wave lead management",
      "Residential Wave job tracking",
      "Residential Wave invoice management",
      "Bundle-exclusive document templates",
      "Bundle reporting & revenue tracking",
      "Early access to new features",
      "White-label invoice option",
      "Full platform access — no add-ons needed"
    ]
  }
];

const STAND_APART = [
  {
    title: "Discovery Is Built In",
    body: "Most platforms make you pay extra to be found. On SurfCoast, your public profile is searchable the moment it goes live. Customers in your area can find you based on trade type, location, availability, and ratings — all without you running ads or boosting posts. Your work speaks for itself."
  },
  {
    title: "Free Forever Profile",
    body: "We believe every professional deserves a digital presence. That's why every contractor gets a free public profile — verified reviews, portfolio images, contact info, and credentials — regardless of what plan they're on. No subscription required just to exist on the platform."
  },
  {
    title: "Pricing Built for Solo Operators",
    body: "We didn't design our pricing around enterprise software budgets. Starting at $19/month with a free trial, SurfCoast was built so that a sole proprietor running a truck and a toolbox can afford the same professional tools as a ten-person operation. Every tier earns its price."
  },
  {
    title: "Works for Every Worker Type",
    body: "Trades, creatives, freelancers, market vendors — SurfCoast is intentionally built for the full spectrum of independent workers. Whether you're wiring houses or selling handmade jam, the platform adapts to your workflow rather than forcing you into a rigid mold designed for someone else."
  },
  {
    title: "WAVEShop: No Commission, Ever",
    body: "Most marketplace platforms take 10–30% of every transaction your vendor makes. WAVEShop charges a flat $35/month — period. Sell $500 worth of produce or $5,000 worth of furniture: you keep everything. No hidden percentages, no surprise deductions at payout."
  },
  {
    title: "Compliance Built Into the Platform",
    body: "SurfCoast includes compliance safeguards you won't find anywhere else — minor labor law enforcement, identity verification with document review, scope-of-work signature workflows, off-platform payment detection, and a full audit trail. Protecting workers and clients is a feature, not a legal footnote."
  }
];

const COMPARISON_ROWS = [
  ["Free public contractor profile", true, false],
  ["No commission on vendor sales", true, false],
  ["Mobile app with full field ops", true, false],
  ["Starts at $19/month", true, false],
  ["Free 2-week trial, no credit card", true, false],
  ["Built-in compliance tools", true, false],
  ["Identity verification included", true, false],
  ["Scope of work with digital signature", true, false],
  ["Supports market vendors (farmers/swap)", true, false],
  ["Supports solo creatives & freelancers", true, false],
  ["GPS job tracking", true, false],
  ["Escrow payment system", true, true],
  ["Client messaging included", true, false],
  ["Invoice generation & PDF export", true, false],
  ["No setup fees", true, false],
  ["No long-term contracts", true, false],
  ["Minor labor law compliance tools", true, false],
  ["Dispute resolution center", true, false],
  ["HubSpot & Notion integration", true, false],
  ["Trade-specific game discount system", true, false],
];

export default function WhySurfCoast() {
  const [activeTab, setActiveTab] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <p style={{ fontSize: "clamp(16px, 2.5vw, 22px)", color: "rgba(255,255,255,0.75)", maxWidth: "640px", margin: "0 auto 40px", lineHeight: 1.6 }}>
          SurfCoast Marketplace is a professional platform for contractors, tradespeople, market vendors, and solo workers — built on the belief that hard work deserves real tools.
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
            "SurfCoast Marketplace is a two-track professional platform: one built for contractors and independent service providers, the other for market vendors — farmers market sellers, swap meet operators, and everyone who makes their living selling at local events. Both tracks operate under a single platform with shared infrastructure and a shared commitment to fairness.",
            "The contractor track, powered by the WAVE FO subscription system, gives tradespeople and solo professionals a full suite of business management tools — from job posting and client messaging to scope-of-work signing, invoice generation, GPS tracking, and compliance documentation. It's designed to replace the patchwork of apps most contractors currently cobble together.",
            "The vendor track, called WAVEShop, gives farmers market and swap meet sellers a simple, affordable way to manage their booth presence, sell products, collect reviews, and be discovered by local shoppers — all for a flat monthly fee with zero commission taken on sales.",
            "Both tracks are built with the same philosophy: tools should be affordable, transparent, and actually useful in the field. No bloated feature sets you'll never use. No commission cuts on work you earned. No contracts locking you in. Just a platform that earns your subscription every single month."
          ].map((p, i) => (
            <p key={i} style={{ fontSize: "17px", lineHeight: 1.8, color: "#374151", margin: 0 }}>{p}</p>
          ))}
        </div>
      </section>

      {/* WHO IS THIS FOR */}
      <section style={{ background: "#f8f9fa", padding: "80px 24px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", marginBottom: "12px", letterSpacing: "-1px", textAlign: "center" }}>Who Is This For?</h2>
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "17px", marginBottom: "40px" }}>SurfCoast supports over 60 categories of independent workers across three main groups.</p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "36px", flexWrap: "wrap" }}>
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
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", marginBottom: "24px", letterSpacing: "-1px" }}>What Is WAVE FO?</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "16px" }}>
          {[
            "WAVE FO (Field Operations) is SurfCoast's tiered subscription system for contractors and independent professionals. It's the engine behind every tool on the contractor side of the platform — from job scheduling and client messaging to invoice generation, compliance tracking, GPS monitoring, and third-party integrations.",
            "The system is designed as a progressive upgrade path. You start where you are, pay only for what you use, and unlock more capability as your business grows — without ever being locked into a contract or pressured into a tier that doesn't fit your current stage.",
            "WAVE FO is fully mobile-optimized. Field technicians can manage their day entirely from a phone — clock into jobs, capture before and after photos, send invoices, communicate with clients, and track their location. The desktop version extends the same tools into a full administrative suite for billing, analytics, and project management.",
            "Every plan includes a 2-week free trial. No credit card required to start. Cancel or upgrade at any time. The philosophy is simple: if the platform stops being worth it, you should be able to leave. We'd rather earn your subscription every month than trap you with a contract."
          ].map((p, i) => (
            <p key={i} style={{ fontSize: "17px", lineHeight: 1.8, color: "#374151", margin: 0 }}>{p}</p>
          ))}
        </div>
      </section>

      {/* WAVE FO TIER CARDS */}
      <section style={{ background: "#f8f9fa", padding: "80px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", marginBottom: "12px", letterSpacing: "-1px", textAlign: "center" }}>WAVE FO Plans</h2>
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "17px", marginBottom: "48px" }}>For contractors and independent professionals. All plans include a 2-week free trial.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {WAVE_TIERS.map((tier, i) => (
              <div key={i} style={{ background: "#fff", border: tier.tag === "Most Popular" ? "2px solid #d97706" : "1px solid #e5e7eb", borderRadius: "16px", padding: "32px 28px", display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
                {tier.tag && (
                  <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", background: "#d97706", color: "#fff", fontSize: "11px", fontWeight: "800", padding: "4px 14px", borderRadius: "20px", letterSpacing: "1px", whiteSpace: "nowrap" }}>{tier.tag}</div>
                )}
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 4px" }}>{tier.name}</h3>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{ fontSize: "40px", fontWeight: "900", color: "#d97706" }}>{tier.price}</span>
                    <span style={{ fontSize: "14px", color: "#6b7280" }}>/month</span>
                  </div>
                </div>
                <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#374151", margin: 0 }}>{tier.pitch}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                  {tier.features.map((f, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: "#374151" }}>
                      <CheckCircle size={14} style={{ color: "#d97706", marginTop: "2px", flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/BecomeContractor" style={{ display: "block", textAlign: "center", background: tier.tag === "Most Popular" ? "#d97706" : "#0a1628", color: "#fff", padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", textDecoration: "none", marginTop: "8px" }}>
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
          Your profile is free. Your trial is free. Your work is yours. Join the marketplace built for the people who actually do the work.
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