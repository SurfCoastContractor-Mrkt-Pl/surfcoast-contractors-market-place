import useScrollTracking from '@/hooks/useScrollTracking';

const T = {
  bg: "#F5F5F6",
  card: "#fff",
  dark: "#1A1A1B",
  muted: "#333",
  border: "#D0D0D2",
  amber: "#5C3500",
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

export default function IntegritySection() {
  const ref = useScrollTracking('integrity');
  return (
    <section ref={ref} style={{ background: T.bg, padding: "40px 16px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 10, letterSpacing: "0.06em", fontWeight: 700, fontStyle: "italic" }}>// INTEGRITY & ACCOUNT HOLD ENFORCEMENT</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: T.dark, marginBottom: 8, fontStyle: "italic" }}>100% compliance. Automated.</h2>
        <p style={{ fontSize: 14, color: T.dark, marginBottom: 28, lineHeight: 1.6, fontWeight: 700, fontStyle: "italic" }}>Non-compliance triggers immediate account holds with no manual review required.</p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          {[
            { label: "TRIGGER_01 // 72HR_PHOTO_RULE", heading: "72-Hour Photo Rule", desc: "Entrepreneurs must upload after-photos within 72 hours of the agreed work date. Failure triggers an immediate account hold blocking all platform activity.", badge: "immediate account hold" },
            { label: "TRIGGER_02 // MUTUAL_RATINGS", heading: "Mandatory Mutual Ratings", desc: "Both parties must submit ratings at closeout. Non-compliant accounts are held until the rating is submitted.", badge: "hold: non-compliant party only" },
          ].map((c) => (
            <div key={c.label} style={{ ...cardStyle, flex: "1 1 240px", padding: 20 }} {...hoverGlow}>
              <div style={{ ...mono, fontSize: 10, color: T.muted, marginBottom: 8, letterSpacing: "0.06em", fontWeight: 700, fontStyle: "italic" }}>{c.label}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: T.dark, marginBottom: 8, fontStyle: "italic" }}>{c.heading}</h3>
              <p style={{ fontSize: 13, color: T.dark, lineHeight: 1.6, marginBottom: 12 }}>{c.desc}</p>
              <span style={{ ...mono, fontSize: 10, background: T.amberTint, border: `0.5px solid #D9B88A`, color: T.amber, borderRadius: 4, padding: "3px 8px" }}>{c.badge}</span>
            </div>
          ))}
        </div>

        <div style={{ ...cardStyle, padding: 18 }} {...hoverGlow}>
          <div style={{ ...mono, fontSize: 10, color: T.muted, marginBottom: 8, letterSpacing: "0.06em" }}>HOLD STATUS — FULL PLATFORM BLOCK</div>
          <p style={{ fontSize: 13, color: T.dark, lineHeight: 1.6 }}>A hold blocks all platform activity — job applications, messaging, payments, and RFP access — until the required action is completed. Holds lift automatically once compliance is confirmed.</p>
        </div>
      </div>
    </section>
  );
}