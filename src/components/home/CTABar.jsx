import { Link } from 'react-router-dom';
import useScrollTracking from '@/hooks/useScrollTracking';

export default function CTABar() {
  const ref = useScrollTracking('cta_bar');
  return (
    <section ref={ref} style={{ background: "#1A1A1B", padding: "44px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Whether you're starting out or have years of experience — you belong here.</h2>
          <p style={{ fontSize: 14, color: "#bbb" }}>Workers, clients, vendors, shoppers. Free to start. Built in California. Helping across the nation.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/BecomeContractor" style={{ textDecoration: "none", display: "inline-block", background: "#fff", color: "#1A1A1B", border: "none", borderRadius: 6, padding: "11px 18px", fontSize: 14, fontWeight: 700 }}>Become a Founding Member</Link>
        </div>
      </div>
    </section>
  );
}