import { Sparkles } from 'lucide-react';

export default function CampaignAdBanner() {
  return (
    <div style={{
      width: "100%",
      maxWidth: "900px",
      marginTop: "clamp(16px, 4vw, 28px)",
      marginBottom: "clamp(16px, 4vw, 28px)",
      padding: "clamp(14px, 3vw, 18px) clamp(16px, 4vw, 24px)",
      borderRadius: "12px",
      background: "linear-gradient(135deg, rgba(217,119,6,0.15) 0%, rgba(30,90,150,0.1) 100%)",
      border: "1px solid rgba(217,119,6,0.3)",
      display: "flex",
      alignItems: "center",
      gap: "clamp(12px, 3vw, 16px)",
      backdropFilter: "blur(8px)",
    }}>
      <Sparkles size={24} style={{ color: "#d97706", flexShrink: 0 }} strokeWidth={1.5} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontSize: "clamp(13px, 2.5vw, 15px)",
          fontWeight: "600",
          color: "#ffffff",
          lineHeight: 1.5,
        }}>
          Help us grow and <span style={{ color: "#d97706" }}>extend your free trial</span> — refer a friend today!
        </p>
      </div>
    </div>
  );
}