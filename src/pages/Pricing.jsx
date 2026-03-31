import { CheckCircle, Zap, ChevronDown } from "lucide-react";
import { useState } from "react";

const FREE_FEATURES = [
  "Public listing & discovery",
  "Receive job requests",
  "Basic inquiry responses",
  "Reviews & ratings",
  "Mobile access",
  "No credit card required",
];

const WAVE_TIERS = [
  {
    name: "WAVE Starter",
    price: 19,
    tag: null,
    subtitle: "Best for new contractors getting started",
    accent: "#38bdf8",
    features: [
      "Public contractor profile with photo & bio",
      "Up to 5 active job postings",
      "Paid client messaging (per session)",
      "Quote request management",
      "Job scheduling calendar",
      "Mobile app access",
      "Standard client reviews",
      "Email notifications",
      "Basic analytics dashboard",
      "2-week free trial included",
    ],
  },
  {
    name: "WAVE Pro",
    price: 39,
    tag: null,
    subtitle: "Best for growing contractors ready to scale",
    accent: "#a78bfa",
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
      "Team collaboration tools",
    ],
  },
  {
    name: "WAVE Max",
    price: 59,
    tag: "Most Popular ⭐",
    subtitle: "Best for established contractors",
    accent: "#f59e0b",
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
      "Custom invoice branding",
    ],
  },
  {
    name: "WAVE FO Premium",
    price: 100,
    tag: null,
    subtitle: "Best for licensed sole proprietors (HIS verified)",
    accent: "#34d399",
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
      "Priority support",
    ],
  },
  {
    name: "WAVE Residential Bundle",
    price: 125,
    tag: "All-In",
    subtitle: "Best for licensed operators who want everything",
    accent: "#f472b6",
    features: [
      "Everything in WAVE FO Premium ($100/month value)",
      "Unlimited client messaging — $50/month add-on included",
      "No per-session messaging fees",
      "Residential Wave lead management",
      "Residential Wave job tracking",
      "Residential Wave invoice management",
      "Bundle-exclusive document templates",
      "Revenue tracking & bundle reports",
      "White-label invoice option",
      "Early access to new features",
      "Full platform access — no add-ons needed",
    ],
  },
];

const MARKET_BOOTHS_AND_SPACES_FEATURES = [
  "Public booth/shop profile page",
  "Product listings with photos & prices",
  "Inventory tracking",
  "Client reviews & ratings",
  "Farmers market & swap meet directory listing",
  "Booth schedule management",
  "Analytics dashboard",
  "Inquiry inbox",
  "Mobile-optimized dashboard",
  "Dashboard/profile settings for booth or space",
];

const WAVESHOP_FO_FEATURES = [
  "Everything in Market Booths & Spaces",
  "Advanced product management tools",
  "Enhanced analytics & reporting",
  "Priority support",
  "Specialized marketing toolkit",
  "Social media integration suite",
  "Custom booth branding options",
  "Streamlined, user-friendly dashboard",
  "Advanced inventory tracking",
  "Photo gallery (up to 50 images)",
  "Early adopter pricing locked in",
];

const FAQ_ITEMS = [
  {
    q: "Is the Basic Profile really free forever?",
    a: "Yes. No credit card, no trial, no expiration. Your profile stays live and searchable as long as you want it."
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. All plans are month-to-month. Cancel before your next billing date and you won't be charged again."
  },
  {
    q: "Is there a setup fee?",
    a: "No. Never. You pay the monthly rate and nothing else."
  },
  {
    q: "What's the difference between WAVE FO and WAVEShop FO?",
    a: "WAVE FO is the field operations system for contractors and independent service workers — it includes scheduling, invoicing, CRM, and compliance tools across multiple tiers. WAVEShop FO is an optional advanced program within the MarketShop offering for farmers market sellers, flea market vendors, and swap meet space operators. MarketShop vendors have a free basic profile and can choose between a 5% facilitation fee or a $20/month subscription to waive the fee. WAVEShop FO is a premium $35/month add-on for vendors who want advanced booth management features."
  },
  {
    q: "What's the facilitation fee structure for MarketShop vendors?",
    a: "MarketShop vendors can choose between two payment models: pay a 5% facilitation fee per sale, or subscribe to the $20/month plan to waive the fee entirely and keep 100% of your sales. WAVEShop FO is an optional premium program at $35/month that includes advanced tools and waives all facilitation fees."
  },
  {
    q: "Do I need a license to join?",
    a: "No. Unlicensed workers can join on a Basic Profile. Licensed contractors unlock additional compliance and document features in higher tiers."
  },
  {
    q: "What is the 18% facilitation fee?",
    a: "When a client pays for a job through the platform, SurfCoast collects an 18% facilitation fee automatically via Stripe. This covers payment processing, platform infrastructure, and dispute protection. Contractors receive 82% directly to their connected bank account."
  },
  {
    q: "Is messaging free?",
    a: "No. Client messaging is a paid feature. Sessions are available for $1.50 each, or you can add the $50/month Unlimited Communication plan. The WAVE Residential Bundle includes unlimited messaging at no extra charge."
  },
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Yes. You can change plans at any time. Changes take effect on your next billing cycle."
  },
];

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: "16px" }}>
        <span style={{ fontSize: "15px", fontWeight: "600", color: "#f1f5f9" }}>{item.q}</span>
        <ChevronDown size={18} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
      </button>
      {open && <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.75, margin: "0 0 20px", paddingRight: "32px" }}>{item.a}</p>}
    </div>
  );
}

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
          Simple, Honest Pricing.<br />No Surprises.
        </h1>
        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.6)", margin: "0 0 12px", lineHeight: 1.65 }}>
          Month-to-month. No setup fees. No annual contracts. Cancel anytime.
        </p>
        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", margin: "0 0 36px" }}>
          Start free — upgrade when you're ready. Two tracks: <strong style={{ color: "rgba(255,255,255,0.7)" }}>WAVE FO</strong> for contractors · <strong style={{ color: "rgba(255,255,255,0.7)" }}>WAVEShop FO</strong> for market booth operators
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
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: "900", margin: "0 0 12px", letterSpacing: "-1px" }}>WAVE FO (Field Operations) Plans</h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", maxWidth: "500px", margin: "0 auto" }}>For contractors, tradespeople &amp; solo professionals. Every plan includes a 2-week free trial.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "20px" }}>
          {WAVE_TIERS.map((tier, i) => (
            <div key={i} style={{ background: tier.tag === "Most Popular ⭐" ? "rgba(245,158,11,0.06)" : tier.tag === "All-In" ? "rgba(244,114,182,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${tier.tag ? tier.accent + "55" : "rgba(255,255,255,0.08)"}`, borderRadius: "16px", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
              {tier.tag && (
                <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: tier.accent, color: "#0f172a", fontSize: "10px", fontWeight: "800", padding: "3px 12px", borderRadius: "20px", letterSpacing: "1px", whiteSpace: "nowrap" }}>
                  {tier.tag}
                </div>
              )}
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: "800", margin: "0 0 4px", color: tier.accent }}>{tier.name}</h3>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 8px", lineHeight: 1.4 }}>{tier.subtitle}</p>
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

        {/* Messaging & Proposals note */}
        <div style={{ marginTop: "28px", background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: "12px", padding: "16px 24px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <Zap size={16} style={{ color: "#38bdf8", flexShrink: 0, marginTop: "2px" }} />
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.65 }}>
            <strong style={{ color: "#38bdf8" }}>Client Messaging:</strong> Paid add-on. Sessions are <strong style={{ color: "#f1f5f9" }}>$1.50/session</strong> or <strong style={{ color: "#f1f5f9" }}>$50/month</strong> for unlimited. The <strong style={{ color: "#f472b6" }}>WAVE Residential Bundle</strong> includes unlimited messaging at no extra cost. <strong style={{ color: "#38bdf8" }}>Proposals:</strong> <strong style={{ color: "#f1f5f9" }}>$1.75</strong> per submission.
          </p>
        </div>

        <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(255,255,255,0.35)", marginTop: "20px" }}>
          All plans are month-to-month · No setup fees · No contracts · Cancel anytime
        </p>
      </section>

      {/* MARKET BOOTHS & SPACES */}
      <section style={{ maxWidth: "900px", margin: "0 auto 80px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#ec4899", marginBottom: "10px" }}>Booth & Space Operator Track</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: "900", margin: "0 0 12px", letterSpacing: "-1px" }}>MarketShop Plans</h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", maxWidth: "580px", margin: "0 auto" }}>For farmers market sellers, flea market booth holders, and swap meet space operators. Choose your payment model.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* 5% Facilitation Fee Option */}
          <div style={{ background: "rgba(236,72,153,0.06)", border: "1px solid rgba(236,72,153,0.35)", borderRadius: "16px", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "800", margin: "0 0 4px", color: "#ec4899" }}>Pay Per Sale</h3>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 8px", lineHeight: 1.4 }}>Perfect for casual sellers</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ fontSize: "36px", fontWeight: "900", color: "#f1f5f9" }}>5%</span>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>facilitation fee</span>
              </div>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
              {MARKET_BOOTHS_AND_SPACES_FEATURES.map((f, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>
                  <CheckCircle size={12} style={{ color: "#ec4899", marginTop: "2px", flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
            <a href="/MarketShopSignup" style={{ display: "block", textAlign: "center", background: "rgba(236,72,153,0.12)", color: "#ec4899", padding: "11px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", textDecoration: "none", border: "1px solid rgba(236,72,153,0.3)" }}>
              Get Started with 5%
            </a>
          </div>

          {/* $20/month Subscription Option */}
          <div style={{ background: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.35)", borderRadius: "16px", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
            <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "#ec4899", color: "#0f172a", fontSize: "10px", fontWeight: "800", padding: "3px 12px", borderRadius: "20px", letterSpacing: "1px", whiteSpace: "nowrap" }}>
              SAVE WITH SUBSCRIPTION
            </div>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "800", margin: "0 0 4px", color: "#ec4899" }}>Flat Monthly Fee</h3>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 8px", lineHeight: 1.4 }}>Keep 100% of sales</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ fontSize: "36px", fontWeight: "900", color: "#f1f5f9" }}>$20</span>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>/month</span>
              </div>
            </div>
            <div style={{ background: "rgba(236,72,153,0.15)", border: "1px solid rgba(236,72,153,0.3)", borderRadius: "10px", padding: "12px 14px" }}>
              <p style={{ fontSize: "12px", fontWeight: "700", color: "#ec4899", margin: "0 0 2px" }}>No Facilitation Fee</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.5 }}>5% fee is completely waived when you subscribe</p>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
              {MARKET_BOOTHS_AND_SPACES_FEATURES.map((f, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>
                  <CheckCircle size={12} style={{ color: "#ec4899", marginTop: "2px", flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
            <a href="/MarketShopSignup" style={{ display: "block", textAlign: "center", background: "#ec4899", color: "#0f172a", padding: "11px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", textDecoration: "none" }}>
              Get Started for $20/month
            </a>
          </div>
        </div>
      </section>

      {/* WAVESHOP FO - WAVE FO TIER */}
      <section style={{ maxWidth: "1200px", margin: "0 auto 80px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#a855f7", marginBottom: "10px" }}>MarketShop Track — Optional Premium Program</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: "900", margin: "0 0 12px", letterSpacing: "-1px" }}>WAVEShop FO for the MarketShop</h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", maxWidth: "580px", margin: "0 auto" }}>Optional advanced program for MarketShop vendors with professional tools, enhanced analytics, and streamlined booth management.</p>
        </div>

        <div style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.35)", borderRadius: "20px", padding: "40px 48px", display: "grid", gridTemplateColumns: "auto 1fr", gap: "48px", alignItems: "start" }}>
          <div style={{ minWidth: "240px" }}>
            <div style={{ display: "inline-block", background: "#a855f7", color: "#0f172a", fontSize: "10px", fontWeight: "800", padding: "4px 12px", borderRadius: "20px", letterSpacing: "1px", marginBottom: "16px", textTransform: "uppercase" }}>
              Premium Program
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "20px" }}>
              <span style={{ fontSize: "56px", fontWeight: "900", color: "#a855f7" }}>$35</span>
              <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)" }}>/month</span>
            </div>
            <div style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "10px", padding: "14px 16px", marginBottom: "24px" }}>
              <p style={{ fontSize: "13px", fontWeight: "800", color: "#a855f7", margin: "0 0 4px" }}>Premium Experience</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.6 }}>Advanced tools, superior efficiency, and enhanced user-friendly interface for serious booth operators.</p>
            </div>
            <a href="/MarketShopSignup" style={{ display: "block", textAlign: "center", background: "#a855f7", color: "#0f172a", padding: "13px 24px", borderRadius: "8px", fontSize: "14px", fontWeight: "800", textDecoration: "none", marginBottom: "12px" }}>
              Upgrade to WAVEShop FO →
            </a>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", textAlign: "center" }}>Month-to-month · Cancel anytime</p>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
            {WAVESHOP_FO_FEATURES.map((f, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
                <CheckCircle size={13} style={{ color: "#a855f7", marginTop: "2px", flexShrink: 0 }} />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: "700px", margin: "0 auto 80px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: "900", margin: "0 0 12px", letterSpacing: "-1px" }}>Frequently Asked Questions</h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)" }}>Straight answers, no runaround.</p>
        </div>
        {FAQ_ITEMS.map((item, i) => <FAQItem key={i} item={item} />)}
      </section>

      {/* FEE & SUBSCRIPTION OVERVIEW */}
      <section style={{ maxWidth: "1200px", margin: "0 auto 80px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: "900", margin: "0 0 12px", letterSpacing: "-1px" }}>Facilitation Fees & Subscriptions</h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", maxWidth: "600px", margin: "0 auto" }}>A transparent breakdown of how different users interact with our platform payment models.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
          {/* Contractors */}
          <div style={{ background: "rgba(30,90,150,0.06)", border: "1px solid rgba(30,90,150,0.3)", borderRadius: "16px", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "800", margin: "0 0 8px", color: "#38bdf8" }}>Contractors</h3>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6 }}>Service providers & field professionals</p>
            </div>
            <div style={{ background: "rgba(30,90,150,0.1)", borderRadius: "8px", padding: "12px", marginBottom: "8px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 4px", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px" }}>Facilitation Fee</p>
              <p style={{ fontSize: "24px", fontWeight: "900", color: "#38bdf8", margin: 0 }}>18%</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", margin: "4px 0 0" }}>On job payments</p>
            </div>
            <div style={{ background: "rgba(30,90,150,0.1)", borderRadius: "8px", padding: "12px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 4px", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px" }}>Monthly Plans</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", margin: 0 }}>$19 – $125/mo</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", margin: "4px 0 0" }}>Subscription-based tiers</p>
            </div>
          </div>

          {/* Clients/Consumers */}
          <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "16px", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "800", margin: "0 0 8px", color: "#4ade80" }}>Clients & Consumers</h3>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6 }}>Job posters & service buyers</p>
            </div>
            <div style={{ background: "rgba(34,197,94,0.1)", borderRadius: "8px", padding: "12px", marginBottom: "8px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 4px", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px" }}>Messaging & Quotes</p>
              <p style={{ fontSize: "24px", fontWeight: "900", color: "#4ade80", margin: 0 }}>$1.50</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", margin: "4px 0 0" }}>Per session / quote</p>
            </div>
            <div style={{ background: "rgba(34,197,94,0.1)", borderRadius: "8px", padding: "12px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 4px", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px" }}>Profile</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", margin: 0 }}>Free</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", margin: "4px 0 0" }}>No cost to post jobs</p>
            </div>
          </div>

          {/* Market Booth Operators */}
          <div style={{ background: "rgba(236,72,153,0.06)", border: "1px solid rgba(236,72,153,0.3)", borderRadius: "16px", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "800", margin: "0 0 8px", color: "#ec4899" }}>Market Booth Operators</h3>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6 }}>Booth & space holders</p>
            </div>
            <div style={{ background: "rgba(236,72,153,0.1)", borderRadius: "8px", padding: "12px", marginBottom: "8px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 4px", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px" }}>Facilitation Fee</p>
              <p style={{ fontSize: "24px", fontWeight: "900", color: "#ec4899", margin: 0 }}>5%</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", margin: "4px 0 0" }}>OR subscribe to waive</p>
            </div>
            <div style={{ background: "rgba(236,72,153,0.1)", borderRadius: "8px", padding: "12px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 4px", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px" }}>Subscription</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", margin: 0 }}>$20 – $35/mo</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", margin: "4px 0 0" }}>Waives facilitation fee</p>
            </div>
          </div>

          {/* Vendors (WAVEShop FO for the MarketShop) */}
          <div style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "16px", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "800", margin: "0 0 8px", color: "#a855f7" }}>WAVEShop FO for the MarketShop</h3>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6 }}>Optional premium program for MarketShop vendors</p>
            </div>
            <div style={{ background: "rgba(168,85,247,0.1)", borderRadius: "8px", padding: "12px", marginBottom: "8px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 4px", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px" }}>Monthly Fee</p>
              <p style={{ fontSize: "24px", fontWeight: "900", color: "#a855f7", margin: 0 }}>$35</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", margin: "4px 0 0" }}>Advanced features</p>
            </div>
            <div style={{ background: "rgba(168,85,247,0.1)", borderRadius: "8px", padding: "12px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 4px", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px" }}>Facilitation</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", margin: 0 }}>None</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", margin: "4px 0 0" }}>Keep 100% of sales</p>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ textAlign: "center", padding: "80px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "900", margin: "0 0 16px", letterSpacing: "-1px" }}>Ready to get started?</h2>
        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.5)", maxWidth: "480px", margin: "0 auto 36px", lineHeight: 1.65 }}>
          Join the marketplace built for people who actually work.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/BecomeContractor" style={{ background: "#f59e0b", color: "#0f172a", padding: "15px 36px", borderRadius: "8px", fontSize: "16px", fontWeight: "800", textDecoration: "none" }}>Create Free Profile</a>
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