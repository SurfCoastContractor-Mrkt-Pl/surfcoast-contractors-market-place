import useScrollTracking from '@/hooks/useScrollTracking';

const T = {
  bg: "#EBEBEC",
  card: "#fff",
  dark: "#1A1A1B",
  muted: "#333",
  border: "#D0D0D2",
  amber: "#5C3500",
  amberTint: "#FBF5EC",
  amberBg: "#F0E0C0",
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

const tag = (text, amber) => (
  <span key={text} style={{ display: "inline-block", ...mono, fontSize: 10, padding: "3px 8px", borderRadius: 4, border: `0.5px solid ${amber ? "#D9B88A" : T.border}`, background: amber ? T.amberTint : T.bg, color: amber ? T.amber : T.muted, marginRight: 4, marginTop: 4 }}>
    {text}
  </span>
);

export default function LaunchEngineSection() {
  const ref = useScrollTracking('launch_engine');
  const cards = [
    { topBorder: T.dark, number: "100", numberColor: T.dark, label: "FOUNDING_100", desc: "The first 100 entrepreneurs receive 1 full year of all-access free. No credit card. No catch.", tag: "1 year all-access free", amber: true },
    { topBorder: "transparent", number: "14", numberColor: "#AAA", label: "STANDARD_TRIAL", desc: "After Founding 100 fills, new entrepreneurs start with a 14-day free trial to explore the platform.", tag: "standard onboarding", amber: false },
    { topBorder: T.amber, number: "5:1", numberColor: T.amber, label: "THE_5_FOR_1_LOOP", desc: "During your trial, refer 5 signups to earn 1 extra free day. Stackable. Trial window only.", tag: "trial window only", amber: true },
  ];

  return (
    <section style={{ background: T.bg, padding: "40px 16px" }}>
      <div ref={ref} style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.06em", fontWeight: 700, fontStyle: "italic" }}>// LAUNCH ENGINE</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: T.dark, marginBottom: 8, fontStyle: "italic" }}>Three mechanics. One flywheel.</h2>
        <p style={{ fontSize: 14, color: T.dark, marginBottom: 28, lineHeight: 1.6, fontWeight: 700, fontStyle: "italic" }}>Each mechanic feeds the next. Early movers win.</p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {cards.map((c) => (
            <div key={c.label} style={{ ...cardStyle, borderTop: `3px solid ${c.topBorder}`, padding: 20, flex: "1 1 200px" }} {...hoverGlow}>
              <div style={{ ...mono, fontSize: 38, fontWeight: 700, color: c.numberColor, marginBottom: 4 }}>{c.number}</div>
              <div style={{ ...mono, fontSize: 10, color: T.muted, marginBottom: 10, letterSpacing: "0.06em" }}>{c.label}</div>
              <p style={{ fontSize: 13, color: T.dark, lineHeight: 1.6, marginBottom: 12 }}>{c.desc}</p>
              {tag(c.tag, c.amber)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}