/**
 * SurfCoast Platform Theme — Single Source of Truth
 * All public-facing pages should use these constants for visual consistency with Home.
 */

export const T = {
  bg: "#EBEBEC",
  bgAlt: "#F5F5F6",
  bgDark: "#ECECED",
  card: "#fff",
  dark: "#1A1A1B",
  muted: "#333",
  border: "#D0D0D2",
  amber: "#5C3500",
  amberBg: "#F0E0C0",
  amberTint: "#FBF5EC",
  shadow: "3px 3px 0px #5C3500",
  shadowHover: "3px 3px 0px #5C3500, 0 0 18px 4px rgba(255, 180, 0, 0.35)",
  shadowGlowSm: "0 0 14px 3px rgba(255, 180, 0, 0.3)",
};

export const mono = { fontFamily: "monospace", fontWeight: 700, fontStyle: "italic" };

export const cardStyle = {
  background: T.card,
  border: `0.5px solid ${T.border}`,
  borderRadius: 10,
  boxShadow: T.shadow,
  transition: "box-shadow 0.2s ease",
};

export const hoverGlow = {
  onMouseEnter: (e) => { e.currentTarget.style.boxShadow = T.shadowHover; },
  onMouseLeave: (e) => { e.currentTarget.style.boxShadow = T.shadow; },
};

export const hoverGlowSm = {
  onMouseEnter: (e) => { e.currentTarget.style.boxShadow = T.shadowGlowSm; },
  onMouseLeave: (e) => { e.currentTarget.style.boxShadow = "none"; },
};

export const pageWrapper = {
  fontFamily: "system-ui, -apple-system, sans-serif",
  minHeight: "100vh",
  background: T.bg,
};

export const sectionPadding = "52px 24px";

export const ticker = (leftText, rightText) => ({
  wrapper: { background: T.dark, padding: "6px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 },
  left: { ...mono, fontSize: 11, color: "#e0e0e0" },
  right: { ...mono, fontSize: 11, color: "#ffffff" },
});