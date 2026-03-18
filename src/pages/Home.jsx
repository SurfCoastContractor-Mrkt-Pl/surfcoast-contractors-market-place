import { useState, useEffect } from "react";

const BASE_URL = "https://surfcoastcmp.base44.app";
const BG_IMAGE = "https://media.base44.com/images/public/69b5d136d5baa9e2c5f01224/1210d9a44_generated_image.png";

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleAuth = (role) => {
    window.location.href = `${BASE_URL}/login?from_url=${encodeURIComponent(`${BASE_URL}/${role === "contractor" ? "ContractorDashboard" : "CustomerDashboard"}`)}`;
  };

  return (
    <div style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column", fontFamily:"'Inter','Segoe UI',sans-serif", overflowX:"hidden", background:"#020817" }}>
      <div style={{ position:"fixed", inset:0, backgroundImage:`url(${BG_IMAGE})`, backgroundSize:"cover", backgroundPosition:"center", zIndex:0 }} />
      <div style={{ position:"fixed", inset:0, background:"linear-gradient(to bottom,rgba(2,8,23,0.72) 0%,rgba(2,8,23,0.55) 40%,rgba(2,8,23,0.75) 100%)", zIndex:1 }} />

      <header style={{ position:"relative", zIndex:10, display:"flex", alignItems:"center", padding:"18px 28px", backdropFilter:"blur(12px)", background:"rgba(2,8,23,0.45)", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"2px", lineHeight:1 }}>
          <span style={{ fontSize:"22px", fontWeight:"800", color:"#fff", letterSpacing:"-0.5px" }}>SurfCoast</span>
          <span style={{ fontSize:"9px", fontWeight:"700", letterSpacing:"3px", color:"rgba(255,255,255,0.55)", textTransform:"uppercase" }}>MARKETPLACE</span>
        </div>
        <nav style={{ marginLeft:"auto", display:"flex", gap:"12px", alignItems:"center" }}>
          <a href={`${BASE_URL}/MarketDirectory`} style={{ color:"rgba(255,255,255,0.8)", textDecoration:"none", fontSize:"14px", fontWeight:"600", padding:"8px 16px", background:"rgba(255,255,255,0.1)", borderRadius:"20px", border:"1px solid rgba(255,255,255,0.2)" }}>🛍️ Markets &amp; Vendors</a>
          <a href={`${BASE_URL}/login`} style={{ color:"#fff", textDecoration:"none", fontSize:"14px", fontWeight:"700", padding:"8px 20px", background:"rgba(14,165,233,0.85)", borderRadius:"20px", border:"1px solid rgba(14,165,233,0.9)", whiteSpace:"nowrap" }}>Sign In</a>
        </nav>
      </header>

      <main style={{ position:"relative", zIndex:2, flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 24px 40px" }}>
        <div style={{ textAlign:"center", marginBottom:"48px", maxWidth:"700px" }}>
          <h1 style={{ fontSize:"clamp(36px,6vw,64px)", fontWeight:"800", color:"#fff", margin:"0 0 18px", lineHeight:1.1, letterSpacing:"-1px", textShadow:"0 2px 20px rgba(0,0,0,0.5)" }}>The Trades Marketplace</h1>
          <p style={{ fontSize:"clamp(15px,2vw,18px)", color:"rgba(255,255,255,0.75)", margin:0, lineHeight:1.6 }}>Connect with licensed, verified tradespeople across the country — or grow your business and land your next job.</p>
        </div>

        <div style={{ display:"flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "center" : "stretch", width:"100%", maxWidth:"780px", justifyContent:"center" }}>
          <div style={{ flex:1, maxWidth: isMobile ? "420px" : "340px", width: isMobile ? "100%" : undefined, borderRadius:"20px", padding:"32px 28px", backdropFilter:"blur(16px)", transition:"all 0.25s ease", background: hoveredCard==="customer" ? "linear-gradient(145deg,rgba(14,165,233,0.92),rgba(2,132,199,0.95))" : "rgba(5,20,40,0.62)", border: hoveredCard==="customer" ? "1.5px solid rgba(14,165,233,0.9)" : "1.5px solid rgba(255,255,255,0.2)", transform: hoveredCard==="customer" ? "translateY(-5px)" : "none", boxShadow: hoveredCard==="customer" ? "0 28px 60px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.35)" }} onMouseEnter={() => setHoveredCard("customer")} onMouseLeave={() => setHoveredCard(null)}>
            <div style={{ fontSize:"36px", marginBottom:"16px" }}>🏠</div>
            <h2 style={{ fontSize:"22px", fontWeight:"700", margin:"0 0 10px", color:"#fff" }}>I Need a Contractor</h2>
            <p style={{ fontSize:"14px", color:"rgba(255,255,255,0.7)", margin:"0 0 16px", lineHeight:"1.6" }}>Post your project, receive competitive quotes, and hire vetted tradespeople near you.</p>
            <ul style={{ listStyle:"none", padding:0, margin:"0 0 24px", display:"flex", flexDirection:"column", gap:"8px", fontSize:"13px", color:"rgba(255,255,255,0.8)" }}>
              <li>✓ Verified &amp; licensed pros only</li>
              <li>✓ Free 2-week trial</li>
              <li>✓ Secure payments</li>
            </ul>
            <button style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"none", fontSize:"15px", fontWeight:"700", cursor:"pointer", background: hoveredCard==="customer" ? "#fff" : "rgba(14,165,233,0.9)", color: hoveredCard==="customer" ? "#0284c7" : "#fff" }} onClick={() => handleAuth("customer")}>Find a Pro →</button>
          </div>

          <div style={{ display:"flex", flexDirection: isMobile ? "row" : "column", alignItems:"center", justifyContent:"center", gap:"8px", padding: isMobile ? "8px 0" : "0 20px" }}>
            <div style={{ background:"rgba(255,255,255,0.15)", flex:1, width: isMobile ? undefined : "1px", height: isMobile ? "1px" : undefined, minHeight: isMobile ? "auto" : "60px", minWidth: isMobile ? "60px" : "auto" }} />
            <span style={{ color:"rgba(255,255,255,0.4)", fontSize:"12px", fontWeight:"600" }}>or</span>
            <div style={{ background:"rgba(255,255,255,0.15)", flex:1, width: isMobile ? undefined : "1px", height: isMobile ? "1px" : undefined, minHeight: isMobile ? "auto" : "60px", minWidth: isMobile ? "60px" : "auto" }} />
          </div>

          <div style={{ flex:1, maxWidth: isMobile ? "420px" : "340px", width: isMobile ? "100%" : undefined, borderRadius:"20px", padding:"32px 28px", backdropFilter:"blur(16px)", transition:"all 0.25s ease", background: hoveredCard==="contractor" ? "linear-gradient(145deg,rgba(245,158,11,0.92),rgba(217,119,6,0.95))" : "rgba(5,20,40,0.62)", border: hoveredCard==="contractor" ? "1.5px solid rgba(245,158,11,0.9)" : "1.5px solid rgba(255,255,255,0.2)", transform: hoveredCard==="contractor" ? "translateY(-5px)" : "none", boxShadow: hoveredCard==="contractor" ? "0 28px 60px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.35)" }} onMouseEnter={() => setHoveredCard("contractor")} onMouseLeave={() => setHoveredCard(null)}>
            <div style={{ fontSize:"36px", marginBottom:"16px" }}>🔧</div>
            <h2 style={{ fontSize:"22px", fontWeight:"700", margin:"0 0 10px", color:"#fff" }}>I'm a Contractor</h2>
            <p style={{ fontSize:"14px", color:"rgba(255,255,255,0.7)", margin:"0 0 16px", lineHeight:"1.6" }}>Expand your reach, manage jobs, and get paid — all from one professional platform.</p>
            <ul style={{ listStyle:"none", padding:0, margin:"0 0 24px", display:"flex", flexDirection:"column", gap:"8px", fontSize:"13px", color:"rgba(255,255,255,0.8)" }}>
              <li>✓ Free 2-week trial</li>
              <li>✓ Get paid securely via Stripe</li>
              <li>✓ Build your reputation</li>
            </ul>
            <button style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"none", fontSize:"15px", fontWeight:"700", cursor:"pointer", background: hoveredCard==="contractor" ? "#fff" : "rgba(245,158,11,0.9)", color: hoveredCard==="contractor" ? "#d97706" : "#fff" }} onClick={() => handleAuth("contractor")}>Join as a Pro →</button>
          </div>
        </div>

        <div style={{ marginTop:"36px", width:"100%", maxWidth:"780px", background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.4)", borderRadius:"18px", padding: isMobile ? "20px" : "22px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"16px", flexDirection: isMobile ? "column" : "row", backdropFilter:"blur(12px)", cursor:"pointer" }} onClick={() => window.location.href=`${BASE_URL}/MarketDirectory`}>
          <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
            <span style={{ fontSize:"32px" }}>🛍️</span>
            <div>
              <div style={{ color:"#c4b5fd", fontWeight:"700", fontSize:"16px" }}>Farmers Markets &amp; Swap Meets</div>
              <div style={{ color:"rgba(255,255,255,0.55)", fontSize:"13px", marginTop:"2px" }}>Browse local vendors or create your own MarketShop</div>
            </div>
          </div>
          <div style={{ background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"white", borderRadius:"12px", padding:"10px 22px", fontSize:"13px", fontWeight:"700", whiteSpace:"nowrap", flexShrink:0 }}>Browse Vendors →</div>
        </div>

        <div style={{ marginTop:"32px", display:"flex", flexWrap:"wrap", justifyContent:"center", alignItems:"center", gap:"8px" }}>
          {["🔒 Secure payments","✅ Identity verified pros","📋 Licensed & insured","🇺🇸 Nationwide coverage"].map((t,i,a) => (
            <span key={i} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.55)" }}>{t}</span>
              {i < a.length-1 && <span style={{ color:"rgba(255,255,255,0.2)" }}>·</span>}
            </span>
          ))}
        </div>
      </main>

      <footer style={{ position:"relative", zIndex:2, display:"flex", flexWrap:"wrap", justifyContent:"center", alignItems:"center", gap:"8px", padding:"20px 24px", background:"rgba(2,8,23,0.7)", borderTop:"1px solid rgba(255,255,255,0.08)", fontSize:"13px", color:"rgba(255,255,255,0.45)" }}>
        <span>© 2026 SurfCoast Marketplace. All rights reserved.</span>
        <span style={{ color:"rgba(255,255,255,0.2)" }}>·</span>
        <a href={`${BASE_URL}/TermsOfService`} style={{ color:"rgba(255,255,255,0.5)", textDecoration:"none" }}>Terms of Service</a>
        <span style={{ color:"rgba(255,255,255,0.2)" }}>·</span>
        <a href={`${BASE_URL}/PrivacyPolicy`} style={{ color:"rgba(255,255,255,0.5)", textDecoration:"none" }}>Privacy Policy</a>
        <span style={{ color:"rgba(255,255,255,0.2)" }}>·</span>
        <a href={`${BASE_URL}/MarketDirectory`} style={{ color:"rgba(255,255,255,0.5)", textDecoration:"none" }}>Markets &amp; Vendors</a>
      </footer>

      <div style={{ position:"relative", zIndex:2, width:"100%", background:"rgba(0,0,0,0.6)", borderTop:"1px solid rgba(255,255,255,0.06)", padding:"10px 24px", textAlign:"center" }}>
        <p style={{ color:"#94a3b8", fontSize:"11px", margin:0, lineHeight:"1.6" }}>SurfCoast Marketplace is a connection platform only. We do not employ contractors and are not responsible for the quality, safety, or legality of services provided. All agreements are between users and contractors directly.</p>
      </div>
    </div>
  );
}