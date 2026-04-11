import { Link } from 'react-router-dom';
import useScrollTracking from '@/hooks/useScrollTracking';

export default function CTABar() {
  const ref = useScrollTracking('cta_bar');
  return (
    <section ref={ref} style={{ background: "#1A1A1B", padding: "44px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: "clamp(16px, 4vw, 24px)", fontWeight: 800, color: "#fff", marginBottom: 6, lineHeight: 1.3 }}>Whether you're starting out or have years of experience — you belong here.</h2>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/BecomeContractor" style={{ textDecoration: "none", display: "inline-block", background: "#fff", color: "#1A1A1B", border: "none", borderRadius: 6, padding: "11px 18px", fontSize: 14, fontWeight: 700 }}>Become a Founding Member</Link>
        </div>
      </div>
    </section>
  );
}