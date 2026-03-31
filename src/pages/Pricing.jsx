import { CheckCircle, Zap } from "lucide-react";

const FREE_FEATURES = [
  "Public profile listing — searchable by customers",
  "Customer discovery & inbound inquiries",
  "Direct messaging with potential clients",
  "Verified customer reviews & ratings",
  "Portfolio image gallery",
  "No credit card required",
];

const WAVE_TIERS = [
  {
    name: "WAVE Starter",
    price: 19,
    tag: null,
    accent: "#38bdf8",
    features: [
      "Everything in Free Profile",
      "Up to 5 active job postings",
      "Quote request management",
      "Job scheduling calendar",
      "Mobile app access",
      "Basic analytics dashboard",
      "Email notifications",
      "2-week free trial",
    ],
  },
  {
    name: "WAVE Pro",
    price: 39,
    tag: null,
    accent: "#a78bfa",
    features: [
      "Everything in Starter",
      "Unlimited job postings",
      "Client relationship manager (CRM)",
      "Invoice generation & PDF export",
      "Scope of Work builder with e-signature",
      "After-photo documentation",
      "Project milestone tracking",
      "Priority search placement",
    ],
  },
  {
    name: "WAVE Max",
    price: 59,
    tag: "Most Popular",
    accent: "#f59e0b",
    features: [
      "Everything in Pro",
      "GPS-based job tracking",
      "Field operations mobile suite",
      "Document management hub",
      "Multi-option client proposals",
      "Escrow payment support",
      "Progress payment phases",
      "QuickBooks CSV export",
    ],
  },
  {
    name: "WAVE FO Premium",
    price: 100,
    tag: null,
    accent: "#34d399",
    features: [
      "Everything in Max",
      "AI scheduling assistant",
      "AI bio & proposal generator",
      "HubSpot CRM sync",
      "Notion project page integration",
      "Campaign management tools",
      "Advanced job pipeline views",
      "Dedicated support priority",
    ],
  },
  {
    name: "WAVE Residential Bundle",
    price: 125,
    tag: "All-In",
    accent: "#f472b6",
    features: [
      "Everything in Premium",
      "Residential Wave lead management",
      "Residential Wave job tracking",
      "Residential Wave invoice management",
      "Bundle-exclusive document templates",
      "Revenue tracking & bundle reports",
      "Early access to new features",
      "White-label invoice option",
    ],
  },
];

const WAVESHOP_FEATURES = [
  "Public booth/shop profile page",
  "Product listings with photos & prices",
  "Inventory tracking dashboard",
  "Customer reviews & ratings",
  "Farmers market & swap meet directory listing",
  "Booth schedule management",
  "Analytics & sales dashboard",
  "Vendor inquiry inbox",
  "Marketing toolkit",
  "Zero commission on all sales — ever",
  "No listing fees",
  "Mobile-optimized dashboard",
];

export default function Pricing() {
  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#f1f5f9", fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* NAV */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(15,23,42,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ display: "flex", flexDirection: "column", gap: "1px", textDecoration: "none" }}>
          <span style={{ fontSize: "14px", fontWeight: "800", color: "#fff", letterSpacing: "-0.5px", lineHeight: 1 }}>SurfCoast</span>
          <span style={{ fontSize: "8px", fontWeight: "700", letterSpacing: "1.5px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>MARKETPLACE</span>
        </a>
        <nav style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <a href="/why-surfcoast" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>Why SurfCoast</a>
          <a href="/pricing" style={{ color: "#f59e0b", textDecoration: "none", fontSize: "13px", fontWeight: "700" }}>Pricing</a>
          <a href="/BecomeContractor" style={{ background: "#1d6fa4", color: "#fff", padding: "7px 18px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", textDecoration: "none" }}>
            Get Started Free
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "80px 24px 60px", maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "20px", padding: "5px 14px", marginBottom: "24px" }}>
          <Zap size={13} style={{ color: "#f59e0b" }} />
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#f59e0b", letterSpacing: "1px", textTransform: "uppercase" }}>Simple, Honest Pricing</span>
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 60px)", fontWeight: "900", margin: "0 0 20px", lineHeight: 1.05, letterSpacing: "-2px" }}>
          No Surprises.<br />No Contracts.
        </h1>
        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.6)", margin: "0 0 12px", lineHeight: 1.65 }}>
          Month-to-month on every plan. No setup fees. Cancel anytime.
        </p>
        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", margin: "0 0 36px" }}>
          Two tracks: <strong style={{ color: "rgba(255,255,255,0.7)" }}>WAVE FO</strong> for contractors &amp; professionals · <strong style={{ color: "rgba(255,255,255,0.7)" }}>WAVEShop</strong> for market vendors
        </p>
        <a href="/BecomeContractor" style={{ display: "inline-block", background: "#f59e0b", color: "#0f172a", padding: "14px 36px", borderRadius: "8px", fontSize: "16px", fontWeight: "800", textDecoration: "none" }}>
          Get Started Free →
        </a>
      </section>

      {/* FREE FOREVER */}
      <section style={{ maxWidth: "900px", margin: "0 auto 64px", padding: "0 24px" }}>
        <div style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.35)", borderRadius: "20px", padding: "40px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", background: "#16a34a", color: "#fff", fontSize: "10px", fontWeight: "800", padding: "4px 12px", borderRadius: "20px", letterSpacing: "1.5px", marginBottom: "16px", textTransform: "uppercase" }}>Always Free</div>
            <h2 style={{ fontSize: "28px", fontWeight: "900", margin: "0 0 12px", letterSpacing: "-0.5px" }}>Basic Profile</h2>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "16px" }}>
              <span style={{ fontSize: "48px", fontWeight: "900", color: "#4ade80" }}>$0</span>
              <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)" }}>forever</span>
            </div>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", margin: "0 0 28px", lineHeight: 1.7 }}>
              Every professional gets a free public profile — no credit card, no expiration. Build your reputation from day one.
            </p>
            <a href="/BecomeContractor" style={{ display: "inline-block", background: "#16a34a", color: "#fff", padding: "12px 28px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", textDecoration: "none" }}>
              Create Free Profile — No Card Required
            </a>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {FREE_FEATURES.map((f, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>
                <CheckCircle size={15} style={{ color: "#4ade80", flexShrink: 0 }} />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* WAVE FO PLANS */}
      <section style={{ maxWidth: "1200px", margin: "0 auto 80px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#f59e0b", marginBottom: "10px" }}>Contractor Track</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: "900", margin: "0 0 12px", letterSpacing: "-1px" }}>WAVE FO Plans</h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", maxWidth: "500px", margin: "0 auto" }}>For contractors, tradespeople &amp; solo professionals. Every plan includes a 2-week free trial.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "20px" }}>
          {WAVE_TIERS.map((tier, i) => (
            <div key={i} style={{ background: tier.tag ? `rgba(${tier.tag === "Most Popular" ? "245,158,11" : "244,114,182"},0.06)` : "rgba(255,255,255,0.03)", border: `1px solid ${tier.tag ? tier.accent + "55" : "rgba(255,255,255,0.08)"}`, borderRadius: "16px", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
              {tier.tag && (
                <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: tier.accent, color: "#0f172a", fontSize: "10px", fontWeight: "800", padding: "3px 12px", borderRadius: "20px", letterSpacing: "1px", whiteSpace: "nowrap" }}>
                  {tier.tag}
                </div>
              )}
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: "800", margin: "0 0 8px", color: tier.accent }}>{tier.name}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span style={{ fontSize: "36px", fontWeight: "900", color: "#f1f5f9" }}>${tier.price}</span>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>/mo</span>
                </div>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                {tier.features.map((f, j) => (
                  <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>
                    <CheckCircle size={12} style={{ color: tier.accent, marginTop: "2px", flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="/BecomeContractor" style={{ display: "block", textAlign: "center", background: tier.tag ? tier.accent : "rgba(255,255,255,0.08)", color: tier.tag ? "#0f172a" : "#f1f5f9", padding: "11px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", textDecoration: "none", border: tier.tag ? "none" : `1px solid rgba(255,255,255,0.12)` }}>
                Get Started Free
              </a>
            </div>
          ))}
        </div>

        {/* Fine print */}
        <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(255,255,255,0.35)", marginTop: "28px" }}>
          All plans are month-to-month · No setup fees · No contracts · Cancel anytime
        </p>
      </section>

      {/* WAVESHOP */}
      <section style={{ maxWidth: "900px", margin: "0 auto 80px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#c084fc", marginBottom: "10px" }}>Vendor Track</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: "900", margin: "0 0 12px", letterSpacing: "-1px" }}>WAVEShop</h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", maxWidth: "480px", margin: "0 auto" }}>For farmers market &amp; swap meet vendors. Flat rate, zero commissions, no listing fees.</p>
        </div>
        <div style={{ background: "rgba(192,132,252,0.06)", border: "1px solid rgba(192,132,252,0.35)", borderRadius: "20px", padding: "40px 48px", display: "grid", gridTemplateColumns: "auto 1fr", gap: "48px", alignItems: "start" }}>
          <div style={{ minWidth: "220px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "16px" }}>
              <span style={{ fontSize: "56px", fontWeight: "900", color: "#c084fc" }}>$35</span>
              <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)" }}>/month</span>
            </div>
            <div style={{ background: "rgba(192,132,252,0.12)", border: "1px solid rgba(192,132,252,0.3)", borderRadius: "10px", padding: "14px 16px", marginBottom: "24px" }}>
              <p style={{ fontSize: "13px", fontWeight: "800", color: "#c084fc", margin: "0 0 4px" }}>Zero Commission Guarantee</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.6 }}>Sell $500 or $50,000 — you keep every dollar. No hidden fees, ever.</p>
            </div>
            <a href="/MarketShopSignup" style={{ display: "block", textAlign: "center", background: "#c084fc", color: "#0f172a", padding: "13px 24px", borderRadius: "8px", fontSize: "14px", fontWeight: "800", textDecoration: "none" }}>
              Set Up Your Booth →
            </a>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "12px", textAlign: "center" }}>Month-to-month · Cancel anytime</p>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
            {WAVESHOP_FEATURES.map((f, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
                <CheckCircle size={13} style={{ color: "#c084fc", marginTop: "2px", flexShrink: 0 }} />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ textAlign: "center", padding: "80px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "900", margin: "0 0 16px", letterSpacing: "-1px" }}>Start Free Today</h2>
        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.5)", maxWidth: "480px", margin: "0 auto 36px", lineHeight: 1.65 }}>
          No credit card. No commitment. Your free profile is permanent — upgrade whenever you're ready.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/BecomeContractor" style={{ background: "#f59e0b", color: "#0f172a", padding: "15px 36px", borderRadius: "8px", fontSize: "16px", fontWeight: "800", textDecoration: "none" }}>Get Started Free</a>
          <a href="/why-surfcoast" style={{ background: "transparent", color: "rgba(255,255,255,0.7)", padding: "15px 36px", borderRadius: "8px", fontSize: "16px", fontWeight: "700", textDecoration: "none", border: "1px solid rgba(255,255,255,0.15)" }}>Why SurfCoast →</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "28px 24px", textAlign: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", margin: 0 }}>
          © 2026 SurfCoast Marketplace · <a href="/Terms" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Terms</a> · <a href="/PrivacyPolicy" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Privacy</a>
        </p>
      </footer>
    </div>
  );
}