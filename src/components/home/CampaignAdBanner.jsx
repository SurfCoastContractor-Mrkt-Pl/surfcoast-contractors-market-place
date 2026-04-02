import { Sparkles, ArrowRight } from 'lucide-react';
import { getAppBaseUrl } from '@/lib/env';

export default function CampaignAdBanner() {
  const handleClick = () => {
    window.location.href = `${getAppBaseUrl()}/ReferralSignup`;
  };

  return (
    <button
      onClick={handleClick}
      style={{
        width: "100%",
        maxWidth: "900px",
        marginTop: "clamp(16px, 4vw, 28px)",
        marginBottom: "clamp(16px, 4vw, 28px)",
        padding: "clamp(14px, 3vw, 18px) clamp(16px, 4vw, 24px)",
        borderRadius: "12px",
        background: "linear-gradient(135deg, rgba(217,119,6,0.08) 0%, rgba(30,90,150,0.05) 100%)",
        border: "1px solid rgba(217,119,6,0.3)",
        display: "flex",
        alignItems: "center",
        gap: "clamp(12px, 3vw, 16px)",
        backdropFilter: "blur(8px)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "linear-gradient(135deg, rgba(217,119,6,0.12) 0%, rgba(30,90,150,0.08) 100%)";
        e.currentTarget.style.borderColor = "rgba(217,119,6,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "linear-gradient(135deg, rgba(217,119,6,0.08) 0%, rgba(30,90,150,0.05) 100%)";
        e.currentTarget.style.borderColor = "rgba(217,119,6,0.2)";
      }}
    >
      <Sparkles size={24} style={{ color: "#d97706", flexShrink: 0 }} strokeWidth={1.5} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontSize: "clamp(13px, 2.5vw, 15px)",
          fontWeight: "600",
          color: "#1f2937",
          lineHeight: 1.5,
        }}>
          Help us grow and <span style={{ color: "#d97706" }}>extend your free trial</span> — refer a friend today!
        </p>
      </div>
      <ArrowRight size={18} style={{ color: "#d97706", flexShrink: 0 }} strokeWidth={2} />
    </button>
  );
}