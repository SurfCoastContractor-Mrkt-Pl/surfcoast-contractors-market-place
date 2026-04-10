import { Link } from 'react-router-dom';

const T = {
  dark: "#1A1A1B",
  border: "#D0D0D2",
  amber: "#5C3500",
  amberBg: "#F0E0C0",
};

const mono = { fontFamily: "monospace", fontWeight: 700, fontStyle: "italic" };

export default function HomeNavBar() {
  return (
    <nav style={{ background: T.dark, padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, position: "sticky", top: 0, zIndex: 50 }}>
      <Link to="/" style={{ textDecoration: "none" }}>
        <span style={{ ...mono, fontSize: 15, color: "#fff", letterSpacing: "0.04em" }}>SCMP</span>
        <span style={{ ...mono, fontSize: 11, color: "#aaa", marginLeft: 8 }}>surfcoastcmp.com</span>
      </Link>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Link to="/SearchContractors" style={{ ...mono, fontSize: 11, color: "#ccc", textDecoration: "none", padding: "5px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 5 }}>Find Entrepreneurs</Link>
        <Link to="/PostJob" style={{ ...mono, fontSize: 11, color: "#ccc", textDecoration: "none", padding: "5px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 5 }}>Post a Project</Link>
        <Link to="/BecomeContractor" style={{ ...mono, fontSize: 11, color: T.amber, background: T.amberBg, textDecoration: "none", padding: "5px 12px", borderRadius: 5, border: "1px solid #D9B88A" }}>Join Free</Link>
      </div>
    </nav>
  );
}