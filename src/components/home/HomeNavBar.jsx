import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function HomeNavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 40,
      background: "#1A1A1B",
      borderBottom: "1px solid #333",
      padding: "10px 16px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link to="/" style={{ textDecoration: "none", fontSize: 16, fontWeight: 700, color: "#fff" }}>SCMP</Link>
      </div>

      {/* Desktop CTA buttons */}
      <div className="hidden sm:flex" style={{ display: "flex", gap: 8 }}>
        <Link to="/PostJob" style={{
          textDecoration: "none",
          background: "#fff",
          color: "#1A1A1B",
          border: "none",
          borderRadius: 5,
          padding: "8px 14px",
          fontSize: 12,
          fontWeight: 700,
          whiteSpace: "nowrap",
          cursor: "pointer"
        }}>
          Post a Job
        </Link>
        <Link to="/BecomeContractor" style={{
          textDecoration: "none",
          background: "transparent",
          color: "#fff",
          border: "1px solid #fff",
          borderRadius: 5,
          padding: "8px 14px",
          fontSize: 12,
          fontWeight: 700,
          whiteSpace: "nowrap",
          cursor: "pointer"
        }}>
          Join
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button className="sm:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: "4px 8px" }}>
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: 0,
          left: 0,
          background: "#1A1A1B",
          borderTop: "1px solid #333",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          padding: "8px 16px",
          zIndex: 39
        }}>
          <Link to="/PostJob" onClick={() => setMenuOpen(false)} style={{
            textDecoration: "none",
            color: "#fff",
            padding: "12px 0",
            fontSize: 14,
            fontWeight: 600,
            borderBottom: "1px solid #333"
          }}>
            Post a Job
          </Link>
          <Link to="/BecomeContractor" onClick={() => setMenuOpen(false)} style={{
            textDecoration: "none",
            color: "#fff",
            padding: "12px 0",
            fontSize: 14,
            fontWeight: 600
          }}>
            Join as Entrepreneur
          </Link>
        </div>
      )}
    </nav>
  );
}