import { Link } from 'react-router-dom';
import useScrollTracking from '@/hooks/useScrollTracking';

const T = {
  dark: "#1A1A1B",
};

export default function CTABar() {
  const ref = useScrollTracking('cta_bar');
  return (
    <section ref={ref} style={{ background: T.dark, padding: "44px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Ready to run your business on WAVE OS?</h2>
          <p style={{ fontSize: 14, color: "#bbb" }}>Free to start. No lead fees. California-born. Nationwide.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/BecomeContractor" style={{ textDecoration: "none", display: "inline-block", background: "#fff", color: T.dark, border: "none", borderRadius: 6, padding: "11px 18px", fontSize: 14, fontWeight: 700 }}>Join the Founding 100</Link>
        </div>
      </div>
    </section>
  );
}