import { useState } from "react";
import { CheckCircle } from "lucide-react";

const NAV_LINKS = [
  { label: "Why SurfCoast", href: "/why-surfcoast" },
  { label: "Pricing", href: "/pricing" },
];

const WAVE_TIERS = [
  {
    name: "Wave Starter",
    price: "$19",
    tag: "",
    color: "#1d6fa4",
    pitch: "Everything you need to launch your professional presence and start landing clients. Wave Starter is designed for the independent operator who's just entering the platform or testing the waters. Affordable, capable, and built to grow with you.",
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
    color: "#7c3aed",
    pitch: "The professional's workhorse. Wave Pro unlocks the CRM, unlimited job capacity, scope-of-work tooling, and invoice generation — the core tools that separate a professional operation from a side hustle.",
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
    color: "#d97706",
    pitch: "Wave Max is the complete field operations suite. It adds GPS tracking, real-time scheduling, document management, and multi-phase payment tools on top of everything in Pro. Most contractors find this tier hits the sweet spot of power and price.",
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
    color: "#0f766e",
    pitch: "For licensed professionals and growing businesses who need the full technology stack. Wave Premium adds AI tools, HubSpot and Notion integrations, campaign management, and the advanced analytics suite that serious operators rely on.",
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
    color: "#be185d",
    pitch: "The everything plan. Wave Bundle includes Wave Premium plus the complete Residential Wave suite — lead management, job tracking, and full invoice management for residential projects. One subscription, zero gaps.",
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

const FAQS = [
  {
    q: "Is there really no contract or setup fee?",
    a: "Correct. Every SurfCoast plan is month-to-month. You can cancel at any time from your account settings. There are no setup fees, no activation fees, and no cancellation penalties. We believe the platform should earn your subscription every month."
  },
  {
    q: "What does the free profile include?",
    a: "Your free profile includes your name, photo, bio, trade specialty, location, contact information, and the ability to collect and display customer reviews. You can also list your certifications and credentials. The free profile does not include job postings, messaging, or billing tools — those require a WAVE FO subscription."
  },
  {
    q: "How does the free trial work?",
    a: "Every WAVE FO plan comes with a 2-week free trial. You get full access to your chosen tier for 14 days at no cost. No credit card is required to start your trial. At the end of the trial period, you'll be asked to add a payment method to continue. If you don't, your account reverts to the free profile tier."
  },
  {
    q: "Can I upgrade or downgrade my plan at any time?",
    a: "Yes. You can change your subscription tier at any time from your account settings. When you upgrade, you'll be charged the prorated difference immediately. When you downgrade, your current tier remains active until the end of the billing period, then switches to the lower tier."
  },
  {
    q: "Does WAVEShop take a commission on my sales?",
    a: "No. WAVEShop is a flat-rate subscription. You pay $35/month and keep 100% of every sale you make. There are no transaction fees, revenue shares, or percentage cuts. Sell $200 or $20,000 in a month — your subscription cost stays the same."
  },
  {
    q: "What's the difference between the contractor track and the vendor track?",
    a: "The contractor track (WAVE FO) is built for service providers — plumbers, electricians, handymen, freelancers, and similar professionals. It includes job management, scheduling, invoicing, and client communication tools. The vendor track (WAVEShop) is built for market sellers — farmers market booths, swap meet vendors, and similar physical product sellers. Both tracks share the same platform but are optimized for different workflows."
  },
  {
    q: "Is the mobile app included in all plans?",
    a: "Yes. Every WAVE FO plan includes full mobile app access. The mobile experience is optimized for field work — you can manage jobs, communicate with clients, capture photos, send invoices, and track your location entirely from your phone. The desktop version adds an administrative layer with advanced analytics, billing management, and integration controls."
  },
  {
    q: "What happens to my profile and reviews if I cancel?",
    a: "Your public profile and all your verified customer reviews remain active and searchable after cancellation. You won't lose the reputation you've built on the platform. However, active job postings, messaging access, and billing tools are deactivated when your subscription ends. You can reactivate at any time by restarting a plan."
  }
];

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState(null);

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
          <a href="/"
            style={{ background: "#1d6fa4", color: "#fff", padding: "7px 18px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", textDecoration: "none", border: "1px solid #2589c7" }}>
            Enter
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a3050 100%)", color: "#fff", textAlign: "center", padding: "100px 24px 80px" }}>
        <p style={{ fontSize: "13px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#d97706", marginBottom: "20px" }}>Transparent Pricing</p>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: "900", margin: "0 0 24px", lineHeight: 1.05, letterSpacing: "-2px", maxWidth: "860px", marginLeft: "auto", marginRight: "auto" }}>
          Simple, Honest Pricing.<br />No Surprises.
        </h1>
        <p style={{ fontSize: "clamp(16px, 2.5vw, 20px)", color: "rgba(255,255,255,0.75)", maxWidth: "600px", margin: "0 auto 20px", lineHeight: 1.65 }}>
          Month-to-month. No contracts. No setup fees. Two tracks — one for contractors and professionals, one for market vendors. Cancel anytime.
        </p>
      </section>

      {/* FREE PROFILE BLOCK */}
      <section style={{ background: "#f0fdf4", borderBottom: "1px solid #bbf7d0", padding: "56px 24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", background: "#16a34a", color: "#fff", fontSize: "11px", fontWeight: "800", padding: "4px 12px", borderRadius: "20px", letterSpacing: "1px", marginBottom: "16px" }}>ALWAYS FREE</div>
            <h2 style={{ fontSize: "28px", fontWeight: "900", margin: "0 0 12px", letterSpacing: "-0.5px" }}>Free Professional Profile</h2>
            <p style={{ fontSize: "16px", lineHeight: 1.7, color: "#374151", margin: "0 0 24px" }}>
              Every worker gets a free public profile on SurfCoast. No subscription required. No credit card. Your reputation lives on the platform indefinitely — even if you cancel a paid plan.
            </p>
            <a href="/BecomeContractor" style={{ display: "inline-block", background: "#16a34a", color: "#fff", padding: "13px 28px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", textDecoration: "none" }}>
              Create Free Profile — No Card Required
            </a>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              "Public profile page with photo & bio",
              "Trade specialty & location displayed",
              "Verified customer reviews",
              "Portfolio image gallery",
              "Certifications & credentials display",
              "Searchable in contractor directory",
              "Contact info for potential clients",
              "Stays active after subscription ends"
            ].map((f, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#374151" }}>
                <CheckCircle size={15} style={{ color: "#16a34a", flexShrink: 0 }} />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* WAVE FO SECTION */}
      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <p style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#d97706", marginBottom: "8px" }}>Contractor Track</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "900", margin: "0 0 12px", letterSpacing: "-1px" }}>WAVE FO Plans</h2>
            <p style={{ fontSize: "17px", color: "#6b7280", maxWidth: "580px", margin: "0 auto 40px", lineHeight: 1.6 }}>For contractors, tradespeople, and solo professionals. Start with a 2-week free trial on any plan.</p>
          </div>

          {/* Tier progression bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "48px", flexWrap: "wrap", gap: "4px" }}>
            {WAVE_TIERS.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ background: t.color, color: "#fff", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", whiteSpace: "nowrap" }}>
                  {t.name} {t.price}
                </div>
                {i < WAVE_TIERS.length - 1 && <span style={{ color: "#d1d5db", fontSize: "16px" }}>→</span>}
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {WAVE_TIERS.map((tier, i) => (
              <div key={i} style={{ background: "#fff", border: tier.tag === "Most Popular" ? `2px solid ${tier.color}` : "1px solid #e5e7eb", borderRadius: "16px", padding: "32px 28px", display: "flex", flexDirection: "column", gap: "16px", position: "relative", boxShadow: tier.tag === "Most Popular" ? `0 0 0 4px ${tier.color}18` : "none" }}>
                {tier.tag && (
                  <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", background: tier.color, color: "#fff", fontSize: "11px", fontWeight: "800", padding: "4px 14px", borderRadius: "20px", letterSpacing: "1px", whiteSpace: "nowrap" }}>{tier.tag}</div>
                )}
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: "800", margin: "0 0 4px", color: "#111" }}>{tier.name}</h3>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{ fontSize: "40px", fontWeight: "900", color: tier.color }}>{tier.price}</span>
                    <span style={{ fontSize: "14px", color: "#6b7280" }}>/month</span>
                  </div>
                </div>
                <p style={{ fontSize: "13px", lineHeight: 1.7, color: "#374151", margin: 0 }}>{tier.pitch}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                  {tier.features.map((f, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: "#374151" }}>
                      <CheckCircle size={13} style={{ color: tier.color, marginTop: "2px", flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/BecomeContractor" style={{ display: "block", textAlign: "center", background: tier.color, color: "#fff", padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", textDecoration: "none", marginTop: "8px" }}>
                  Get Started — Free Trial
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WAVESHOP SECTION */}
      <section style={{ background: "#fdf8f0", padding: "80px 24px", borderTop: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#9d7a54", marginBottom: "8px" }}>Vendor Track</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "900", margin: "0 0 12px", letterSpacing: "-1px" }}>WAVEShop Vendor Plan</h2>
            <p style={{ fontSize: "17px", color: "#6b7280", maxWidth: "560px", margin: "0 auto", lineHeight: 1.6 }}>For farmers market and swap meet vendors. Flat monthly fee — no commission on your sales, ever.</p>
          </div>
          <div style={{ background: "#fff", border: "2px solid #9d7a54", borderRadius: "20px", padding: "48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "20px" }}>
                <span style={{ fontSize: "56px", fontWeight: "900", color: "#9d7a54" }}>$35</span>
                <span style={{ fontSize: "15px", color: "#6b7280" }}>/month</span>
              </div>
              <p style={{ fontSize: "15px", lineHeight: 1.8, color: "#374151", marginBottom: "12px" }}>
                A flat-rate subscription for vendors who want a professional presence without losing a percentage of every sale. Zero commission. Zero surprises.
              </p>
              <div style={{ background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: "8px", padding: "12px 16px", marginBottom: "24px" }}>
                <p style={{ fontSize: "13px", fontWeight: "700", color: "#92400e", margin: 0 }}>Zero Commission Guarantee</p>
                <p style={{ fontSize: "13px", color: "#78350f", margin: "4px 0 0" }}>Sell $500 or $50,000 — your subscription cost stays the same. We never take a cut of your sales.</p>
              </div>
              <a href="/MarketShopSignup" style={{ display: "inline-block", background: "#9d7a54", color: "#fff", padding: "14px 28px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", textDecoration: "none" }}>
                Set Up Your Booth →
              </a>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "11px" }}>
              {[
                "Public booth/shop profile page",
                "Product listings with photos & prices",
                "Inventory tracking dashboard",
                "Customer reviews & ratings display",
                "Farmers market directory listing",
                "Swap meet directory listing",
                "Booth schedule management",
                "Analytics & sales dashboard",
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

      {/* FAQ */}
      <section style={{ maxWidth: "760px", margin: "0 auto", padding: "80px 24px" }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: "900", marginBottom: "48px", letterSpacing: "-1px", textAlign: "center" }}>Frequently Asked Questions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 0", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", gap: "16px" }}
              >
                <span style={{ fontSize: "16px", fontWeight: "700", color: "#111", lineHeight: 1.4 }}>{faq.q}</span>
                <span style={{ fontSize: "22px", color: "#9ca3af", flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ paddingBottom: "22px" }}>
                  <p style={{ fontSize: "15px", lineHeight: 1.8, color: "#4b5563", margin: 0 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a3050 100%)", color: "#fff", textAlign: "center", padding: "100px 24px" }}>
        <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: "900", margin: "0 0 20px", letterSpacing: "-1.5px" }}>Start Free. Upgrade When You're Ready.</h2>
        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.7)", maxWidth: "520px", margin: "0 auto 40px", lineHeight: 1.65 }}>
          No contracts. No setup fees. Your free profile is waiting. Start your trial anytime.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/BecomeContractor" style={{ background: "#d97706", color: "#fff", padding: "16px 36px", borderRadius: "8px", fontSize: "16px", fontWeight: "700", textDecoration: "none" }}>Create Free Profile</a>
          <a href="/why-surfcoast" style={{ background: "transparent", color: "#fff", padding: "16px 36px", borderRadius: "8px", fontSize: "16px", fontWeight: "700", textDecoration: "none", border: "2px solid rgba(255,255,255,0.35)" }}>Why SurfCoast →</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0a1628", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 24px", textAlign: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: 0 }}>© 2026 SurfCoast Marketplace. All rights reserved. · <a href="/Terms" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Terms</a> · <a href="/PrivacyPolicy" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Privacy</a></p>
      </footer>
    </div>
  );
}