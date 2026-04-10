import { Link } from "react-router-dom";
import useScrollTracking from "@/hooks/useScrollTracking";

const T = {
  bg: "#EBEBEC",
  card: "#fff",
  dark: "#1A1A1B",
  sub: "#1A1A1B",
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
  transition: "box-shadow 0.2s ease",
};

const hoverGlow = {
  onMouseEnter: (e) => { e.currentTarget.style.boxShadow = "3px 3px 0px #5C3500, 0 0 18px 4px rgba(255, 180, 0, 0.35)"; },
  onMouseLeave: (e) => { e.currentTarget.style.boxShadow = T.shadow; },
};

const hoverGlowSm = {
  onMouseEnter: (e) => { e.currentTarget.style.boxShadow = "0 0 14px 3px rgba(255, 180, 0, 0.3)"; },
  onMouseLeave: (e) => { e.currentTarget.style.boxShadow = "none"; },
};

const buttonStyle = (bg, color, border) => ({
  textDecoration: "none",
  display: "block",
  width: "100%",
  maxWidth: 320,
  background: bg,
  color,
  border,
  borderRadius: 8,
  padding: "14px 18px",
  fontSize: 14,
  fontWeight: 700,
  textAlign: "center",
  fontFamily: "system-ui, -apple-system, sans-serif",
  lineHeight: 1.3,
});

function HeroPlatformCard() {
  const block = (borderColor, labelColor, labelText, tiles) => (
    <div style={{ borderLeft: `3px solid ${borderColor}`, paddingLeft: 12, marginBottom: 14 }}>
      <div style={{ ...mono, fontSize: 10, color: labelColor, marginBottom: 8, letterSpacing: "0.06em" }}>{labelText}</div>
      {tiles.map(({ text, tinted }) => (
        <div key={text} style={{ background: tinted ? T.amberTint : T.bg, border: `0.5px solid ${tinted ? "#D9B88A" : T.border}`, borderRadius: 6, padding: "6px 10px", fontSize: 12, color: tinted ? T.amber : T.sub, marginBottom: 5, ...mono, transition: "box-shadow 0.2s ease", cursor: "default" }} {...hoverGlowSm}>
          {text}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ ...cardStyle, padding: 20, minWidth: 0 }} {...hoverGlow}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
        <span style={{ ...mono, fontSize: 11, color: T.muted }}>surfcoast / platform_map</span>
        <span style={{ ...mono, fontSize: 11, color: T.amber }}>● live</span>
      </div>
      {block(T.border, T.muted, "SURFCOAST MARKETPLACE", [
        { text: "Service Side — Clients · Entrepreneurs", tinted: false },
        { text: "Market Shop — Vendors · Consumers", tinted: false },
      ])}
      {block(T.amber, T.amber, "WAVE OS — STANDALONE SOFTWARE BRAND", [
        { text: "WAVE TIERS, WAVEshop OS", tinted: true },
        { text: "What is WAVE OS?", tinted: true },
      ])}
      <div style={{ background: T.amberTint, border: `0.5px solid #D9B88A`, borderRadius: 6, padding: "7px 10px", fontSize: 11, color: T.amber, ...mono, transition: "box-shadow 0.2s ease" }} {...hoverGlowSm}>
        Logic gate: consumers cannot access service side
      </div>
    </div>
  );
}

export default function HeroSection() {
  const ref = useScrollTracking('hero');
  return (
    <section ref={ref} data-section="hero" style={{ background: "#ECECED", padding: "32px 16px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 380px", minWidth: 0 }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 14, letterSpacing: "0.06em", fontWeight: 700, fontStyle: "italic" }}>// SERVICE · COMMUNITY · NATIONWIDE</div>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.75rem)", fontWeight: 800, color: T.dark, lineHeight: 1.12, marginBottom: 16 }}>
            Built for the worker.<br />Not the <span style={{ color: T.amber }}>algorithm.</span>
          </h1>
          <p style={{ fontSize: 15, color: T.dark, lineHeight: 1.6, marginBottom: 26, fontWeight: 400 }}>
            This platform is for you. The entrepreneur waking up early, the craftsperson perfecting their skill, the solo business owner building something from the ground up. We know your journey, because we've lived it too. Here, your profile is always free. Connect with clients, respond to project opportunities, and only pay a small <strong>Project Completion Fee</strong> when you successfully finish work. <strong>No lead fees, no noise, just a community where hard work gets noticed.</strong>
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28, flexDirection: "column", alignItems: "flex-start" }}>
            <Link to="/PostJob" style={buttonStyle("#fff", T.dark, `2px solid ${T.border}`)}>
              Post a Job — Free
            </Link>
            <Link to="/BecomeContractor" style={buttonStyle(T.amberBg, T.amber, `2px solid #D9B88A`)}>
              Join as Entrepreneur
            </Link>
          </div>
          <div style={{ display: "flex", background: "#fff", border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: "hidden", transition: "box-shadow 0.2s ease", width: "100%" }} {...hoverGlowSm}>
            {[
              { amount: "$0", label: "Profile & listing", amber: true },
              { amount: "5%", label: "Vendors fee", amber: false },
              { amount: "18%", label: "Entrepreneurs fee", amber: true },
            ].map(({ amount, label, amber }, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", padding: "12px 4px", borderRight: i < 2 ? `1px solid ${T.border}` : "none", minWidth: 0 }}>
                <div style={{ ...mono, fontSize: 20, fontWeight: 700, color: amber ? T.amber : T.dark }}>{amount}</div>
                <div style={{ fontSize: 10, color: T.dark, marginTop: 3, lineHeight: 1.3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: "1 1 300px", minWidth: 0 }}>
          <HeroPlatformCard />
        </div>
      </div>
    </section>
  );
}