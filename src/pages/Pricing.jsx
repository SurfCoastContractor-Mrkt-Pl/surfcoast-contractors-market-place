import { CheckCircle, Zap, ChevronDown } from "lucide-react";
import { useState } from "react";
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

const FREE_FEATURES = [
  "Public listing & discovery",
  "Receive job requests",
  "Basic inquiry responses",
  "Reviews & ratings",
  "Mobile access",
  "No credit card required",
];

const WAVE_TIERS = [
  { name: "WAVE Starter", price: 19, tag: null, subtitle: "New contractors getting started", accent: T.amber, features: ["Public contractor profile with photo & bio", "Up to 5 active job postings", "Paid client messaging (per session)", "Quote request management", "Job scheduling calendar", "Mobile app access", "Standard client reviews", "Email notifications", "Basic analytics dashboard", "2-week free trial included"] },
  { name: "WAVE Pro", price: 39, tag: null, subtitle: "Growing contractors ready to scale", accent: T.amber, features: ["Everything in WAVE Starter", "Unlimited job postings", "Client Relationship Manager (CRM)", "Invoice generation & PDF export", "Scope of Work builder", "After-photo documentation", "Project milestone tracking", "Priority search placement", "Custom service packages", "Performance analytics", "Referral tracking", "Team collaboration tools"] },
  { name: "WAVE Max", price: 59, tag: "Most Popular", subtitle: "Established contractors", accent: T.amber, features: ["Everything in WAVE Pro", "GPS-based job tracking", "Field operations mobile suite", "Document management hub", "Multi-option client proposals", "Escrow payment support", "Project file sharing with clients", "Progress payment phases", "Contractor compliance tools", "Real-time availability manager", "Advanced scheduling assistant", "QuickBooks CSV export", "Custom invoice branding"] },
  { name: "WAVE OS Premium", price: 100, tag: null, subtitle: "Licensed sole proprietors (HIS verified)", accent: T.amber, features: ["Everything in WAVE Max", "AI scheduling assistant", "AI bio & proposal generator", "HubSpot CRM sync", "Notion project page integration", "Campaign management tools", "Case study builder", "Contractor leaderboard & trade games", "Full audit trail & activity log", "Advanced job pipeline views", "Residential Wave invoicing suite", "Priority support"] },
  { name: "WAVE Residential Bundle", price: 125, tag: "All-In", subtitle: "Licensed operators who want everything", accent: T.amber, features: ["Everything in WAVE OS Premium ($100/month value)", "Unlimited client messaging — $50/month add-on included", "No per-session messaging fees", "Residential Wave lead management", "Residential Wave job tracking", "Residential Wave invoice management", "Bundle-exclusive document templates", "Revenue tracking & bundle reports", "White-label invoice option", "Early access to new features", "Full platform access — no add-ons needed"] },
];

const MARKET_BOOTHS_AND_SPACES_FEATURES = [
  "Public booth/shop profile page", "Product listings with photos & prices", "Inventory tracking",
  "Client reviews & ratings", "Farmers market & swap meet directory listing", "Booth schedule management",
  "Analytics dashboard", "Inquiry inbox", "Mobile-optimized dashboard", "Dashboard/profile settings for booth or space",
];

const WAVESHOP_FO_FEATURES = [
  "Everything in Market Booths & Spaces", "Advanced product management tools", "Enhanced analytics & reporting",
  "Priority support", "Specialized marketing toolkit", "Social media integration suite",
  "Custom booth branding options", "Streamlined, user-friendly dashboard", "Advanced inventory tracking",
  "Photo gallery (up to 50 images)", "Early adopter pricing locked in",
];

const FAQ_ITEMS = [
  { q: "How much does SurfCoast Contractors Marketplace cost?", a: "SurfCoast Contractors Marketplace has a transparent performance-based pricing model. For all workers: Profile creation and listing are free forever. An 18% facilitation fee applies only when a job is completed and paid through the platform. Communication sessions cost $1.50 per 10 minutes or $50 per month for unlimited messaging. Receiving and responding to a client's proposal request is always free for the worker. For clients: Browsing worker profiles is free. Sending a request for proposal (RFP) to a specific worker costs $1.75 per proposal request. Communication sessions cost $1.50 per 10 minutes or $50 per month for unlimited messaging. For WAVE OS subscribers: Starter $19 per month unlocks at 5 completed jobs. Pro $39 per month and Max $59 per month unlock progressively. Premium $100 per month unlocks at 100 completed jobs and requires a verified professional license as a licensed Sole Proprietor. The Residential Bundle at $125 per month is WAVE OS Premium plus unlimited messaging — same license requirement. For Market Shop vendors: $20 per month flat fee which waives the 5% facilitation fee entirely, or 5% per sale with no monthly fee. WAVEshop OS is $35 per month for advanced inventory, analytics, and market hub tools. For everyone: The first 100 signups receive one full year of free access. After the Founding 100 spots are taken, new signups receive a free 14-day trial." },
  { q: "Is the Basic Profile really free forever?", a: "Yes. No credit card, no trial, no expiration. Your profile and listing stay live and searchable as long as you want them. Communication sessions cost $1.50 per 10 minutes when you are ready to connect with a potential client — or $50 per month for unlimited messaging." },
  { q: "Can I cancel anytime?", a: "Yes. All plans are month-to-month. Cancel before your next billing date and you won't be charged again." },
  { q: "Is there a setup fee?", a: "No. Never. You pay the monthly rate and nothing else." },
  { q: "What's the difference between WAVE OS and WAVEshop OS?", a: "WAVE OS is the field operations system for contractors and independent service workers — it includes scheduling, invoicing, CRM, and compliance tools across multiple tiers. WAVEshop OS is an optional advanced program within the MarketShop offering for farmers market sellers, flea market vendors, and swap meet space operators. MarketShop vendors have a free basic profile and can choose between a 5% facilitation fee or a $20/month subscription to waive the fee. WAVEshop OS is a premium $35/month add-on for vendors who want advanced booth management features." },
  { q: "What's the facilitation fee structure for MarketShop vendors?", a: "MarketShop vendors can choose between two payment models: pay a 5% facilitation fee per sale, or subscribe to the $20/month plan to waive the fee entirely and keep 100% of your sales. WAVEshop OS is an optional premium program at $35/month that includes advanced tools." },
  { q: "Do I need a license to join?", a: "No. Unlicensed workers can join on a Basic Profile. Motivated individuals as young as 13 are welcome. Licensed contractors unlock additional compliance and document features in higher tiers." },
  { q: "What is the 18% facilitation fee?", a: "When a client pays for a job through the platform, SurfCoast collects an 18% facilitation fee automatically via Stripe. This covers payment processing, platform infrastructure, and dispute protection. Contractors receive 82% directly to their connected bank account." },
  { q: "Is messaging free?", a: "No. Communication is not free — profile and listing are free. Sessions are available for $1.50 per 10 minutes each, or you can add the $50/month Unlimited Communication plan. The WAVE Residential Bundle includes unlimited messaging at no extra charge." },
  { q: "Can I upgrade or downgrade my plan?", a: "Yes. You can change plans at any time. Changes take effect on your next billing cycle." },
];

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${T.border}` }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: T.dark }}>{item.q}</span>
        <ChevronDown size={16} style={{ color: T.muted, flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
      </button>
      {open && <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.75, margin: "0 0 18px", paddingRight: 28, fontStyle: "italic" }}>{item.a}</p>}
    </div>
  );
}

export default function Pricing() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh", background: T.bg }}>

      {/* Ticker */}
      <div style={{ background: T.dark, padding: "6px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
        <span style={{ ...mono, fontSize: 11, color: "#e0e0e0" }}>// PRICING · SIMPLE. HONEST. NO SURPRISES.</span>
        <span style={{ ...mono, fontSize: 11, color: "#ffffff" }}>Month-to-month · Cancel anytime</span>
      </div>

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "56px 24px 40px", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.amberTint, border: `0.5px solid #D9B88A`, borderRadius: 6, padding: "4px 12px", marginBottom: 20 }}>
          <Zap size={11} style={{ color: T.amber }} />
          <span style={{ ...mono, fontSize: 10, color: T.amber, letterSpacing: "0.08em" }}>SIMPLE, HONEST PRICING</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 3.5rem)", fontWeight: 900, margin: "0 0 16px", lineHeight: 1.08, color: T.dark }}>
          Simple, Honest Pricing.<br />No Surprises.
        </h1>
        <p style={{ fontSize: 16, color: T.muted, margin: "0 0 10px", lineHeight: 1.65, fontStyle: "italic" }}>
          Month-to-month. No setup fees. No annual contracts. Cancel anytime.
        </p>
        <p style={{ fontSize: 13, color: T.muted, margin: "0 0 32px", fontStyle: "italic" }}>
          Start free — upgrade when you're ready. Two tracks: <strong style={{ color: T.dark }}>WAVE OS</strong> for contractors · <strong style={{ color: T.dark }}>WAVEshop OS</strong> for market booth operators
        </p>
        <Link to="/BecomeContractor" style={{ display: "inline-block", background: T.dark, color: "#fff", padding: "12px 32px", borderRadius: 6, fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: T.shadow }}>
          Get Started Free →
        </Link>
      </section>

      {/* FREE FOREVER */}
      <section style={{ maxWidth: 900, margin: "0 auto 44px", padding: "0 24px" }}>
        <div style={{ ...cardStyle, padding: "28px 24px", display: "grid", gridTemplateColumns: "1fr", gap: 24, borderTop: `3px solid #16a34a` }}>
          <div>
            <div style={{ display: "inline-block", background: "#16a34a", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 4, letterSpacing: "1.5px", marginBottom: 14, textTransform: "uppercase", ...mono }}>Always Free</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 10px", color: T.dark }}>Basic Profile</h2>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 14 }}>
              <span style={{ ...mono, fontSize: 44, fontWeight: 700, color: "#16a34a" }}>$0</span>
              <span style={{ fontSize: 14, color: T.muted }}>forever</span>
            </div>
            <p style={{ fontSize: 13, color: T.muted, margin: "0 0 24px", lineHeight: 1.7, fontStyle: "italic" }}>
              Every professional gets a free public profile — no credit card, no expiration. Build your reputation from day one.
            </p>
            <Link to="/BecomeContractor" style={{ display: "inline-block", background: "#16a34a", color: "#fff", padding: "11px 24px", borderRadius: 6, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Create Free Profile — No Card Required
            </Link>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {FREE_FEATURES.map((f, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: T.dark }}>
                <CheckCircle size={14} style={{ color: "#16a34a", flexShrink: 0 }} />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* WAVE OS PLANS */}
      <section style={{ maxWidth: 1200, margin: "0 auto 52px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 10, letterSpacing: "0.1em" }}>// CONTRACTOR TRACK</div>
          <h2 style={{ fontSize: "clamp(1.4rem, 4vw, 2.2rem)", fontWeight: 900, margin: "0 0 10px", color: T.dark }}>WAVE OS Plans</h2>
          <p style={{ fontSize: 14, color: T.muted, maxWidth: 500, margin: "0 auto", fontStyle: "italic" }}>For contractors, tradespeople &amp; solo professionals. Every plan includes a 2-week free trial.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
          {WAVE_TIERS.map((tier, i) => (
            <div key={i} style={{ ...cardStyle, padding: "24px 18px", display: "flex", flexDirection: "column", gap: 14, position: "relative", borderTop: tier.tag ? `3px solid ${T.amber}` : `3px solid ${T.border}` }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = goldGlowSm}
              onMouseLeave={e => e.currentTarget.style.boxShadow = T.shadow}
            >
              {tier.tag && (
                <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: T.amberBg, color: T.amber, fontSize: 9, fontWeight: 800, padding: "2px 10px", borderRadius: 4, letterSpacing: "1px", whiteSpace: "nowrap", border: `0.5px solid #D9B88A`, ...mono }}>
                  {tier.tag}
                </div>
              )}
              <div>
                <h3 style={{ ...mono, fontSize: 12, color: T.amber, margin: "0 0 4px" }}>{tier.name}</h3>
                <p style={{ fontSize: 11, color: T.muted, margin: "0 0 8px", lineHeight: 1.4, fontStyle: "italic" }}>{tier.subtitle}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ ...mono, fontSize: 32, fontWeight: 700, color: T.dark }}>${tier.price}</span>
                  <span style={{ fontSize: 12, color: T.muted }}>/mo</span>
                </div>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
                {tier.features.map((f, j) => (
                  <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 11, color: T.muted }}>
                    <CheckCircle size={11} style={{ color: T.amber, marginTop: 2, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/BecomeContractor" style={{ display: "block", textAlign: "center", background: tier.tag ? T.dark : "transparent", color: tier.tag ? "#fff" : T.dark, padding: "9px", borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: "none", border: `1px solid ${T.border}` }}>
                Get Started Free
              </Link>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", ...mono, fontSize: 11, color: T.muted, marginTop: 18 }}>
          All plans are month-to-month · No setup fees · No contracts · Cancel anytime
        </p>
      </section>

      {/* COMMUNICATION & PROPOSAL PRICING */}
      <section style={{ maxWidth: 1200, margin: "0 auto 52px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.1em" }}>// COMMUNICATION & PROPOSALS</div>
          <h2 style={{ fontSize: "clamp(1.4rem, 4vw, 2.2rem)", fontWeight: 900, margin: "0 0 10px", color: T.dark }}>How Clients & Contractors Connect</h2>
          <p style={{ fontSize: 14, color: T.muted, maxWidth: 560, margin: "0 auto", fontStyle: "italic" }}>Clear pricing for messaging and proposal requests on the platform.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {/* Client Communication Card */}
          <div style={{ ...cardStyle, padding: "32px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ ...mono, fontSize: 10, color: T.muted, marginBottom: 6, letterSpacing: "0.06em" }}>FOR CLIENTS</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 6px", color: T.dark }}>Client Communication & Proposals</h3>
              <p style={{ fontSize: 12, color: T.muted, margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>For clients seeking contractor services</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: T.amberTint, border: `0.5px solid #D9B88A`, borderRadius: 8, padding: 16 }}>
                <p style={{ ...mono, fontSize: 11, color: T.amber, margin: "0 0 10px" }}>DIRECT MESSAGING</p>
                <p style={{ ...mono, fontSize: 18, fontWeight: 700, color: T.dark, margin: "0 0 3px" }}>$1.50</p>
                <p style={{ fontSize: 11, color: T.muted, margin: "0 0 10px", fontStyle: "italic" }}>Per 10-minute session with a contractor</p>
                <p style={{ ...mono, fontSize: 18, fontWeight: 700, color: T.dark, margin: "0 0 3px" }}>$50<span style={{ fontSize: 12 }}>/month</span></p>
                <p style={{ fontSize: 11, color: T.muted, margin: 0, fontStyle: "italic" }}>Unlimited messaging with multiple contractors</p>
              </div>
              <div style={{ background: T.bg, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: 16 }}>
                <p style={{ ...mono, fontSize: 11, color: T.muted, margin: "0 0 10px" }}>PROPOSAL REQUESTS</p>
                <p style={{ ...mono, fontSize: 18, fontWeight: 700, color: T.dark, margin: "0 0 3px" }}>$1.75</p>
                <p style={{ fontSize: 11, color: T.muted, margin: 0, fontStyle: "italic" }}>Per proposal request — send detailed requirements to a contractor.</p>
              </div>
            </div>
          </div>

          {/* Contractor Communication Card */}
          <div style={{ ...cardStyle, padding: "32px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ ...mono, fontSize: 10, color: T.amber, marginBottom: 6, letterSpacing: "0.06em" }}>FOR CONTRACTORS</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 6px", color: T.dark }}>Contractor Communication</h3>
              <p style={{ fontSize: 12, color: T.muted, margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>For contractors connecting with clients</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: T.amberTint, border: `0.5px solid #D9B88A`, borderRadius: 8, padding: 16 }}>
                <p style={{ ...mono, fontSize: 11, color: T.amber, margin: "0 0 10px" }}>DIRECT MESSAGING</p>
                <p style={{ ...mono, fontSize: 18, fontWeight: 700, color: T.dark, margin: "0 0 3px" }}>$1.50</p>
                <p style={{ fontSize: 11, color: T.muted, margin: "0 0 10px", fontStyle: "italic" }}>Per 10-minute session to initiate a conversation with a client</p>
                <p style={{ ...mono, fontSize: 18, fontWeight: 700, color: T.dark, margin: "0 0 3px" }}>$50<span style={{ fontSize: 12 }}>/month</span></p>
                <p style={{ fontSize: 11, color: T.muted, margin: 0, fontStyle: "italic" }}>Unlimited messaging. Included in WAVE Residential Bundle.</p>
              </div>
              <div style={{ background: T.bg, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: 16 }}>
                <p style={{ ...mono, fontSize: 11, color: T.muted, margin: "0 0 10px" }}>RESPONDING TO PROPOSAL REQUESTS</p>
                <p style={{ ...mono, fontSize: 18, fontWeight: 700, color: "#16a34a", margin: "0 0 3px" }}>Free</p>
                <p style={{ fontSize: 11, color: T.muted, margin: 0, fontStyle: "italic" }}>No charge to respond to client-initiated proposal requests.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARKET BOOTHS */}
      <section style={{ maxWidth: 900, margin: "0 auto 52px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.1em" }}>// BOOTH & SPACE OPERATOR TRACK</div>
          <h2 style={{ fontSize: "clamp(1.4rem, 4vw, 2.2rem)", fontWeight: 900, margin: "0 0 10px", color: T.dark }}>MarketShop Plans</h2>
          <p style={{ fontSize: 14, color: T.muted, maxWidth: 560, margin: "0 auto", fontStyle: "italic" }}>For farmers market sellers, flea market booth holders, and swap meet space operators. Choose your payment model.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          <div style={{ ...cardStyle, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <h3 style={{ ...mono, fontSize: 13, color: T.muted, margin: "0 0 4px" }}>Pay Per Sale</h3>
              <p style={{ fontSize: 11, color: T.muted, margin: "0 0 8px", fontStyle: "italic" }}>Perfect for casual sellers</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}><span style={{ ...mono, fontSize: 32, fontWeight: 700, color: T.dark }}>5%</span><span style={{ fontSize: 12, color: T.muted }}>facilitation fee</span></div>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1 }}>
              {MARKET_BOOTHS_AND_SPACES_FEATURES.map((f, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 11, color: T.muted, marginBottom: 6 }}>
                  <CheckCircle size={11} style={{ color: T.amber, marginTop: 2, flexShrink: 0 }} />{f}
                </li>
              ))}
            </ul>
            <Link to="/MarketShopSignup" style={{ display: "block", textAlign: "center", background: "transparent", color: T.dark, padding: 10, borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: "none", border: `1px solid ${T.border}` }}>Get Started with 5%</Link>
          </div>

          <div style={{ ...cardStyle, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 14, borderTop: `3px solid ${T.amber}`, position: "relative" }}>
            <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: T.amberBg, color: T.amber, fontSize: 9, fontWeight: 800, padding: "2px 10px", borderRadius: 4, letterSpacing: "1px", whiteSpace: "nowrap", border: `0.5px solid #D9B88A`, ...mono }}>
              SAVE WITH SUBSCRIPTION
            </div>
            <div>
              <h3 style={{ ...mono, fontSize: 13, color: T.amber, margin: "0 0 4px" }}>Flat Monthly Fee</h3>
              <p style={{ fontSize: 11, color: T.muted, margin: "0 0 8px", fontStyle: "italic" }}>Keep 100% of sales</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}><span style={{ ...mono, fontSize: 32, fontWeight: 700, color: T.dark }}>$20</span><span style={{ fontSize: 12, color: T.muted }}>/month</span></div>
            </div>
            <div style={{ background: T.amberTint, border: `0.5px solid #D9B88A`, borderRadius: 6, padding: "10px 12px" }}>
              <p style={{ ...mono, fontSize: 11, color: T.amber, margin: "0 0 2px" }}>No Facilitation Fee</p>
              <p style={{ fontSize: 11, color: T.muted, margin: 0, fontStyle: "italic" }}>5% fee is completely waived when you subscribe</p>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1 }}>
              {MARKET_BOOTHS_AND_SPACES_FEATURES.map((f, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 11, color: T.muted, marginBottom: 6 }}>
                  <CheckCircle size={11} style={{ color: T.amber, marginTop: 2, flexShrink: 0 }} />{f}
                </li>
              ))}
            </ul>
            <Link to="/MarketShopSignup" style={{ display: "block", textAlign: "center", background: T.dark, color: "#fff", padding: 10, borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Get Started for $20/month</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 720, margin: "0 auto 52px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.1em" }}>// FAQ</div>
          <h2 style={{ fontSize: "clamp(1.4rem, 4vw, 2.2rem)", fontWeight: 900, margin: "0 0 10px", color: T.dark }}>Frequently Asked Questions</h2>
          <p style={{ fontSize: 14, color: T.muted, fontStyle: "italic" }}>Straight answers, no runaround.</p>
        </div>
        <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 10, boxShadow: T.shadow, padding: "0 24px" }}>
          {FAQ_ITEMS.map((item, i) => <FAQItem key={i} item={item} />)}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ textAlign: "center", padding: "56px 24px", borderTop: `1px solid ${T.border}`, background: T.dark }}>
        <div style={{ ...mono, fontSize: 11, color: T.amberBg, marginBottom: 12, letterSpacing: "0.1em" }}>// GET STARTED</div>
        <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.8rem)", fontWeight: 900, margin: "0 0 14px", color: "#fff" }}>Ready to get started?</h2>
        <p style={{ fontSize: 16, color: "#ccc", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.65, fontStyle: "italic" }}>
          Join the marketplace built for people who actually work.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/BecomeContractor" style={{ background: T.amberBg, color: T.amber, padding: "13px 32px", borderRadius: 6, fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: T.shadow }}>Get Started Free</Link>
          <Link to="/why-surfcoast" style={{ background: "transparent", color: "#fff", padding: "13px 32px", borderRadius: 6, fontSize: 15, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>Why SurfCoast →</Link>
        </div>
      </section>

    </div>
  );
}