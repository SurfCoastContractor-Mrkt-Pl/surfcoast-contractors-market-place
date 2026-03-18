import { useState, useEffect } from "react";

const BASE_URL = "https://surfcoastcmp.base44.app";
const BG_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b5d136d5baa9e2c5f01224/f64fccdce_generated_image.png";

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
    const fromUrl = encodeURIComponent(`${BASE_URL}/${role === "contractor" ? "ContractorDashboard" : "CustomerDashboard"}`);
    window.location.href = `${BASE_URL}/login?from_url=${fromUrl}`;
  };

  return (
    <div style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column", fontFamily:"'Inter','Segoe UI',sans-serif", overflowX:"hidden", background:"#0a1628" }}>
      <div style={{ position:"fixed", inset:0, backgroundImage:`url(${BG_IMAGE})`, backgroundSize:"cover", backgroundPosition:"center top", backgroundRepeat:"no-repeat", zIndex:0 }} />
      <div style={{ position:"fixed", inset:0, background:"linear-gradient(to bottom, rgba(10,22,40,0.65) 0%, rgba(10,22,40,0.45) 35%, rgba(10,22,40,0.80) 100%)", zIndex:1 }} />

      <header style={{ position:"relative", zIndex:10, display:"flex", alignItems:"center", padding:"16px 28px", background:"rgba(10,22,40,0.5)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
          <span style={{ fontSize:'20px', fontWeight:'800', color:'#ffffff', letterSpacing:'-0.5px', lineHeight:1, textAlign:'left' }}>SurfCoast</span>
          <span style={{ fontSize:'11px', fontWeight:'700', letterSpacing:'1.5px', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', lineHeight:1, textAlign:'left', marginLeft:'2px' }}>MARKETPLACE</span>
        </div>
        <nav style={{ marginLeft:"auto", display:"flex", gap:"12px", alignItems:"center" }}>
          <a href={`${BASE_URL}/MarketDirectory`} style={{ color:"rgba(255,255,255,0.8)", textDecoration:"none", fontSize:"14px", fontWeight:"600", padding:"8px 16px", background:"rgba(255,255,255,0.08)", borderRadius:"20px", border:"1px solid rgba(255,255,255,0.18)" }}>🛍️ Markets & Vendors</a>
          <a href={`${BASE_URL}/login`} style={{ color:"#fff", textDecoration:"none", fontSize:"14px", fontWeight:"700", padding:"8px 22px", background:"#1d6fa4", borderRadius:"20px", border:"1px solid #2589c7", whiteSpace:"nowrap" }}>Sign In</a>
        </nav>
      </header>

      <main style={{ position:"relative", zIndex:2, flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"56px 24px 40px" }}>
        <div style={{ textAlign:"center", marginBottom:"44px", maxWidth:"680px" }}>
          <h1 style={{ fontSize:"clamp(38px,6vw,68px)", fontWeight:"800", color:"#ffffff", margin:"0 0 16px", lineHeight:1.1, letterSpacing:"-1.5px", textShadow:"0 2px 24px rgba(0,0,0,0.6)" }}>The Trades Marketplace</h1>
          <p style={{ fontSize:"clamp(15px,2vw,18px)", color:"rgba(255,255,255,0.72)", margin:0, lineHeight:1.65 }}>Connect with licensed, verified tradespeople across the country — or grow your business and land your next job.</p>
        </div>

        <div style={{ display:"flex", flexDirection:isMobile?"column":"row", alignItems:isMobile?"center":"stretch", width:"100%", maxWidth:"780px", justifyContent:"center" }}>
          <div
            onMouseEnter={() => setHoveredCard("customer")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ flex:1, maxWidth:isMobile?"420px":"340px", width:isMobile?"100%":undefined, borderRadius:"18px", padding:"30px 26px", backdropFilter:"blur(18px)", transition:"all 0.22s ease", cursor:"default", background:hoveredCard==="customer"?"linear-gradient(145deg,rgba(29,111,164,0.95),rgba(14,80,130,0.97))":"rgba(10,22,40,0.68)", border:hoveredCard==="customer"?"1.5px solid rgba(45,140,200,0.8)":"1.5px solid rgba(255,255,255,0.15)", transform:hoveredCard==="customer"?"translateY(-4px)":"none", boxShadow:hoveredCard==="customer"?"0 24px 56px rgba(0,0,0,0.55)":"0 8px 32px rgba(0,0,0,0.4)" }}
          >
            <div style={{ fontSize:"34px", marginBottom:"14px" }}>🏠</div>
            <h2 style={{ fontSize:"21px", fontWeight:"700", margin:"0 0 10px", color:"#fff" }}>I Need a Contractor</h2>
            <p style={{ fontSize:"14px", color:"rgba(255,255,255,0.68)", margin:"0 0 16px", lineHeight:"1.6" }}>Post your project, receive competitive quotes, and hire vetted tradespeople near you.</p>
            <ul style={{ listStyle:"none", padding:0, margin:"0 0 22px", display:"flex", flexDirection:"column", gap:"8px", fontSize:"13px", color:"rgba(255,255,255,0.78)" }}>
              <li>✓ Verified & licensed pros only</li>
              <li>✓ Free 2-week trial</li>
              <li>✓ Secure payments</li>
            </ul>
            <button onClick={() => handleAuth("customer")} style={{ width:"100%", padding:"13px", borderRadius:"12px", border:"none", fontSize:"15px", fontWeight:"700", cursor:"pointer", transition:"all 0.2s", background:hoveredCard==="customer"?"#ffffff":"#1d6fa4", color:hoveredCard==="customer"?"#0e5082":"#fff" }}>Find a Pro →</button>
          </div>

          <div style={{ display:"flex", flexDirection:isMobile?"row":"column", alignItems:"center", justifyContent:"center", gap:"8px", padding:isMobile?"10px 0":"0 22px" }}>
            <div style={{ background:"rgba(255,255,255,0.12)", flex:1, width:isMobile?undefined:"1px", height:isMobile?"1px":undefined, minHeight:isMobile?"auto":"50px", minWidth:isMobile?"50px":"auto" }} />
            <span style={{ color:"rgba(255,255,255,0.35)", fontSize:"12px", fontWeight:"600" }}>OR</span>
            <div style={{ background:"rgba(255,255,255,0.12)", flex:1, width:isMobile?undefined:"1px", height:isMobile?"1px":undefined, minHeight:isMobile?"auto":"50px", minWidth:isMobile?"50px":"auto" }} />
          </div>

          <div
            onMouseEnter={() => setHoveredCard("contractor")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ flex:1, maxWidth:isMobile?"420px":"340px", width:isMobile?"100%":undefined, borderRadius:"18px", padding:"30px 26px", backdropFilter:"blur(18px)", transition:"all 0.22s ease", cursor:"default", background:hoveredCard==="contractor"?"linear-gradient(145deg,rgba(217,119,6,0.95),rgba(180,90,0,0.97))":"rgba(10,22,40,0.68)", border:hoveredCard==="contractor"?"1.5px solid rgba(245,158,11,0.8)":"1.5px solid rgba(255,255,255,0.15)", transform:hoveredCard==="contractor"?"translateY(-4px)":"none", boxShadow:hoveredCard==="contractor"?"0 24px 56px rgba(0,0,0,0.55)":"0 8px 32px rgba(0,0,0,0.4)" }}
          >
            <div style={{ fontSize:"34px", marginBottom:"14px" }}>🔧</div>
            <h2 style={{ fontSize:"21px", fontWeight:"700", margin:"0 0 10px", color:"#fff" }}>I'm a Contractor</h2>
            <p style={{ fontSize:"14px", color:"rgba(255,255,255,0.68)", margin:"0 0 16px", lineHeight:"1.6" }}>Expand your reach, manage jobs, and get paid — all from one professional platform.</p>
            <ul style={{ listStyle:"none", padding:0, margin:"0 0 22px", display:"flex", flexDirection:"column", gap:"8px", fontSize:"13px", color:"rgba(255,255,255,0.78)" }}>
              <li>✓ Free 2-week trial</li>
              <li>✓ Get paid securely via Stripe</li>
              <li>✓ Build your reputation</li>
            </ul>
            <button onClick={() => handleAuth("contractor")} style={{ width:"100%", padding:"13px", borderRadius:"12px", border:"none", fontSize:"15px", fontWeight:"700", cursor:"pointer", transition:"all 0.2s", background:hoveredCard==="contractor"?"#ffffff":"#d97706", color:hoveredCard==="contractor"?"#92400e":"#fff" }}>Join as a Pro →</button>
          </div>
        </div>

        <div onClick={() => window.location.href=`${BASE_URL}/MarketDirectory`} style={{ marginTop:"32px", width:"100%", maxWidth:"780px", background:"rgba(79,46,150,0.22)", border:"1px solid rgba(124,58,237,0.35)", borderRadius:"16px", padding:isMobile?"18px 20px":"20px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"16px", flexDirection:isMobile?"column":"row", backdropFilter:"blur(12px)", cursor:"pointer" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
            <span style={{ fontSize:"30px" }}>🛍️</span>
            <div>
              <div style={{ color:"#c4b5fd", fontWeight:"700", fontSize:"15px" }}>Farmers Markets & Swap Meets</div>
              <div style={{ color:"rgba(255,255,255,0.5)", fontSize:"13px", marginTop:"2px" }}>Browse local vendors or create your own MarketShop</div>
            </div>
          </div>
          <div style={{ background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"white", borderRadius:"10px", padding:"9px 20px", fontSize:"13px", fontWeight:"700", whiteSpace:"nowrap", flexShrink:0 }}>Browse Vendors →</div>
        </div>

        <div style={{ marginTop:"28px", display:"flex", flexWrap:"wrap", justifyContent:"center", alignItems:"center", gap:"6px 4px" }}>
          {["🔒 Secure payments","✅ Identity verified pros","📋 Licensed & insured","🇺🇸 Nationwide coverage"].map((t,i,a) => (
            <span key={i} style={{ display:"flex", alignItems:"center", gap:"6px" }}>
              <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.48)" }}>{t}</span>
              {i < a.length-1 && <span style={{ color:"rgba(255,255,255,0.18)", margin:"0 2px" }}>·</span>}
            </span>
          ))}
        </div>
      </main>

      <footer style={{ position:"relative", zIndex:2, display:"flex", flexWrap:"wrap", justifyContent:"center", alignItems:"center", gap:"8px", padding:"18px 24px", background:"rgba(10,22,40,0.75)", borderTop:"1px solid rgba(255,255,255,0.07)", fontSize:"13px", color:"rgba(255,255,255,0.4)" }}>
        <span>© 2026 SurfCoast Marketplace. All rights reserved.</span>
        <span style={{ color:"rgba(255,255,255,0.15)" }}>·</span>
        <a href={`${BASE_URL}/Terms`} style={{ color:"rgba(255,255,255,0.45)", textDecoration:"none" }}>Terms of Service</a>
        <span style={{ color:"rgba(255,255,255,0.15)" }}>·</span>
        <a href={`${BASE_URL}/PrivacyPolicy`} style={{ color:"rgba(255,255,255,0.45)", textDecoration:"none" }}>Privacy Policy</a>
        <span style={{ color:"rgba(255,255,255,0.15)" }}>·</span>
        <a href={`${BASE_URL}/MarketDirectory`} style={{ color:"rgba(255,255,255,0.45)", textDecoration:"none" }}>Markets & Vendors</a>
      </footer>

      <div style={{ position:"relative", zIndex:2, width:"100%", background:"rgba(0,0,0,0.55)", borderTop:"1px solid rgba(255,255,255,0.05)", padding:"9px 24px", textAlign:"center" }}>
        <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"11px", margin:0, lineHeight:"1.6" }}>SurfCoast Marketplace is a connection platform only. We do not employ contractors and are not responsible for the quality, safety, or legality of services provided. All agreements are between users and contractors directly.</p>
      </div>
    </div>
  );
}