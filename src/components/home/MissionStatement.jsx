export default function MissionStatement() {
  return (
    <div style={{
      width: "100%",
      maxWidth: "900px",
      marginBottom: "36px",
      padding: "clamp(24px, 5vw, 40px)",
      background: "rgba(217,119,6,0.08)",
      border: "1px solid rgba(217,119,6,0.3)",
      borderRadius: "16px",
      backdropFilter: "blur(12px)"
    }}>
      <h2 style={{
        fontSize: "clamp(20px, 4vw, 28px)",
        fontWeight: "800",
        color: "#d97706",
        margin: "0 0 20px",
        textAlign: "center",
        lineHeight: 1.2
      }}>
        Our Mission
      </h2>
      
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}>
        <p style={{
          fontSize: "clamp(14px, 2.5vw, 16px)",
          color: "rgba(255,255,255,0.9)",
          margin: 0,
          lineHeight: 1.7,
          fontWeight: "600"
        }}>
          We exist to build a community where anyone willing to work—whether just starting out or walking the path alone—has a place to grow, connect, and succeed.
        </p>

        <p style={{
          fontSize: "clamp(13px, 2.2vw, 15px)",
          color: "rgba(255,255,255,0.85)",
          margin: 0,
          lineHeight: 1.7
        }}>
          SurfCoast Contractors Marketplace (SCMP) is committed to empowering the beginner, backing the lone wolf, and turning ambition into real opportunity. We believe being a "contractor" isn't a title—it's a mindset built on effort, ownership, and pride in doing the job right.
        </p>

        <p style={{
          fontSize: "clamp(13px, 2.2vw, 15px)",
          color: "rgba(255,255,255,0.85)",
          margin: 0,
          lineHeight: 1.7
        }}>
          Because starting out is tough—and nobody makes it alone—SCMP is here to support you the way you actually need it. No gatekeeping. No one-size-fits-all playbook. Just real support, real people, and real opportunities.
        </p>

        <p style={{
          fontSize: "clamp(13px, 2.2vw, 15px)",
          color: "rgba(255,255,255,0.85)",
          margin: 0,
          lineHeight: 1.7,
          fontStyle: "italic"
        }}>
          Through shared knowledge, accessible work, and a community that respects the grind, SCMP helps you take your first step, your next step, and every step toward building something of your own.
        </p>
      </div>
    </div>
  );
}