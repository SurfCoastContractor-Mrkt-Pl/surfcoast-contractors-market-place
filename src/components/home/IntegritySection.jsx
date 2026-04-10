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
    <section ref={ref} data-section="integrity" style={{ background: T.bg, padding: "40px 16px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ ...mono, fontSize: 11, color: T.amber, marginBottom: 10, letterSpacing: "0.06em" }}>// BUILDING TRUST TOGETHER</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: T.dark, marginBottom: 8, fontStyle: "italic" }}>Building Trust Together.</h2>
        <p style={{ fontSize: 14, color: T.dark, marginBottom: 28, lineHeight: 1.6, fontWeight: 700, fontStyle: "italic" }}>We believe in a level playing field. Our system helps ensure everyone stays honest — so the people who work hard never get cheated.</p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          {[
            { label: "TRIGGER_01 // 72HR_PHOTO_RULE", heading: "72-Hour After-Photo Rule", desc: "Entrepreneurs must upload after-photos within 72 hours of the agreed work date. Missing this window means account activity is paused automatically — keeping every project on record and every client protected.", badge: "auto-pause · lifts on upload" },
            { label: "TRIGGER_02 // MUTUAL_RATINGS", heading: "Mutual Ratings Required", desc: "Both parties must submit honest ratings at closeout. If either party hasn't submitted, only their account is paused — ensuring fairness without punishing the other side.", badge: "paused · non-rating party only" },
          ].map((c) => (
            <div key={c.label} style={{ ...cardStyle, flex: "1 1 240px", padding: 20 }} {...hoverGlow}>
              <div style={{ ...mono, fontSize: 10, color: T.muted, marginBottom: 8, letterSpacing: "0.06em" }}>{c.label}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: T.dark, marginBottom: 8, fontStyle: "italic" }}>{c.heading}</h3>
              <p style={{ fontSize: 13, color: T.dark, lineHeight: 1.6, marginBottom: 12 }}>{c.desc}</p>
              <span style={{ ...mono, fontSize: 10, background: T.amberTint, border: `0.5px solid #D9B88A`, color: T.amber, borderRadius: 4, padding: "3px 8px" }}>{c.badge}</span>
            </div>
          ))}
        </div>

        <div style={{ ...cardStyle, padding: 18 }} {...hoverGlow}>
          <div style={{ ...mono, fontSize: 10, color: T.muted, marginBottom: 8, letterSpacing: "0.06em" }}>ACCOUNT PAUSE — WHAT IT MEANS</div>
          <p style={{ fontSize: 13, color: T.dark, lineHeight: 1.6 }}>When an account is paused, activities like project requests, messaging sessions, and payments are temporarily on hold. There is no manual review — pauses happen instantly when the trigger condition is met and lift the moment the required action is completed. This keeps our community fair and transparent for everyone.</p>
        </div>
      </div>
    </section>
  );
}