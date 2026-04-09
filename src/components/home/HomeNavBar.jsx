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
      flexWrap: "wrap"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link to="/" style={{ textDecoration: "none", fontSize: 16, fontWeight: 700, color: "#fff" }}>SCMP</Link>
      </div>

      {/* Mobile hamburger */}
      <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: "4px 8px" }}>
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* CTA buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
    </nav>
  );
}