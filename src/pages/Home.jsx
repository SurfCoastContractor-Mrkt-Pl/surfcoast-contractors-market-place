import { useState, useEffect } from "react";
import { ShoppingBag, Home as HomeIcon, Wrench, Shield, CheckCircle } from "lucide-react";
import MarketsVendorsSection from "@/components/home/MarketsVendorsSection";

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

      <header style={{ position:"relative", zIndex:10, display:"flex", alignItems:"center", padding:"12px 16px", background:"rgba(10,22,40,0.5)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
          <span style={{ fontSize:'clamp(14px, 4vw, 17px)', fontWeight:'800', color:'#ffffff', letterSpacing:'-0.5px', lineHeight:1, textAlign:'left' }}>SurfCoast</span>
          <span style={{ fontSize:'clamp(7px, 2vw, 10px)', fontWeight:'700', letterSpacing:'1.5px', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', lineHeight:1, textAlign:'left', marginLeft:'8px' }}>MARKETPLACE</span>
        </div>
        <nav style={{ marginLeft:"auto", display:"flex", gap:"8px", alignItems:"center", flexWrap:"wrap" }}>
          <a href={`${BASE_URL}/MarketDirectory`} style={{ color:"rgba(255,255,255,0.8)", textDecoration:"none", fontSize:"clamp(12px, 2vw, 14px)", fontWeight:"600", padding:"6px 12px", background:"rgba(255,255,255,0.08)", borderRadius:"20px", border:"1px solid rgba(255,255,255,0.18)", display:"flex", alignItems:"center", gap:"4px" }}><ShoppingBag size={16} /> Markets & Vendors</a>
          <a href={`${BASE_URL}/login`} style={{ color:"#fff", textDecoration:"none", fontSize:"clamp(12px, 2vw, 14px)", fontWeight:"700", padding:"6px 16px", background:"#1d6fa4", borderRadius:"20px", border:"1px solid #2589c7", whiteSpace:"nowrap", minHeight:"32px", display:"flex", alignItems:"center" }}>Sign In</a>
        </nav>
      </header>

      <main style={{ position:"relative", zIndex:2, flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"clamp(24px, 8vw, 56px) 16px 24px", minHeight:"100svh" }}>
        <div style={{ textAlign:"center", marginBottom:"clamp(24px, 6vw, 44px)", maxWidth:"680px" }}>
          <h1 style={{ fontSize:"clamp(28px, 6vw, 68px)", fontWeight:"800", color:"#ffffff", margin:"0 0 clamp(12px, 3vw, 16px)", lineHeight:1.1, letterSpacing:"-1.5px", textShadow:"0 2px 24px rgba(0,0,0,0.6)" }}>The Trades Marketplace</h1>
          <p style={{ fontSize:"clamp(13px, 3vw, 18px)", color:"rgba(255,255,255,0.72)", margin:0, lineHeight:1.65 }}>Connect with licensed, verified tradespeople across the country — or grow your business and land your next job.</p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:"100%", maxWidth:"780px", gap:"clamp(12px, 4vw, 20px)", justifyContent:"center" }}>
          <div
            onMouseEnter={() => setHoveredCard("customer")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ width:"100%", borderRadius:"clamp(12px, 3vw, 18px)", padding:"clamp(20px, 5vw, 30px)", backdropFilter:"blur(18px)", transition:"all 0.22s ease", cursor:"default", background:hoveredCard==="customer"?"linear-gradient(145deg,rgba(29,111,164,0.95),rgba(14,80,130,0.97))":"rgba(10,22,40,0.68)", border:hoveredCard==="customer"?"1.5px solid rgba(45,140,200,0.8)":"1.5px solid rgba(255,255,255,0.15)", transform:hoveredCard==="customer"?"translateY(-4px)":"none", boxShadow:hoveredCard==="customer"?"0 24px 56px rgba(0,0,0,0.55)":"0 8px 32px rgba(0,0,0,0.4)" }}
          >
            <HomeIcon size={28} style={{ marginBottom:"clamp(10px, 3vw, 14px)", color:"#1d6fa4" }} strokeWidth={1.5} />
            <h2 style={{ fontSize:"clamp(18px, 4vw, 21px)", fontWeight:"700", margin:"0 0 clamp(8px, 2vw, 10px)", color:"#fff" }}>I Need a Contractor</h2>
            <p style={{ fontSize:"clamp(13px, 2vw, 14px)", color:"rgba(255,255,255,0.68)", margin:"0 0 clamp(12px, 3vw, 16px)", lineHeight:"1.6" }}>Post your project, receive competitive quotes, and hire vetted tradespeople near you.</p>
            <ul style={{ listStyle:"none", padding:0, margin:"0 0 clamp(16px, 4vw, 22px)", display:"flex", flexDirection:"column", gap:"6px", fontSize:"clamp(12px, 2vw, 13px)", color:"rgba(255,255,255,0.78)" }}>
              <li>✓ Verified & licensed pros only</li>
              <li>✓ Free 2-week trial</li>
              <li>✓ Secure payments</li>
            </ul>
            <button onClick={() => handleAuth("customer")} style={{ width:"100%", padding:"clamp(12px, 3vw, 13px)", borderRadius:"12px", border:"none", fontSize:"clamp(13px, 2vw, 15px)", fontWeight:"700", cursor:"pointer", transition:"all 0.2s", minHeight:"44px", background:hoveredCard==="customer"?"#ffffff":"#1d6fa4", color:hoveredCard==="customer"?"#0e5082":"#fff" }}>Find a Pro →</button>
          </div>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", width:"100%", padding:"8px 0" }}>
            <div style={{ background:"rgba(255,255,255,0.12)", flex:1, height:"1px" }} />
            <span style={{ color:"rgba(255,255,255,0.35)", fontSize:"12px", fontWeight:"600", whiteSpace:"nowrap" }}>OR</span>
            <div style={{ background:"rgba(255,255,255,0.12)", flex:1, height:"1px" }} />
          </div>

          <div
            onMouseEnter={() => setHoveredCard("contractor")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ width:"100%", borderRadius:"clamp(12px, 3vw, 18px)", padding:"clamp(20px, 5vw, 30px)", backdropFilter:"blur(18px)", transition:"all 0.22s ease", cursor:"default", background:hoveredCard==="contractor"?"linear-gradient(145deg,rgba(217,119,6,0.95),rgba(180,90,0,0.97))":"rgba(10,22,40,0.68)", border:hoveredCard==="contractor"?"1.5px solid rgba(245,158,11,0.8)":"1.5px solid rgba(255,255,255,0.15)", transform:hoveredCard==="contractor"?"translateY(-4px)":"none", boxShadow:hoveredCard==="contractor"?"0 24px 56px rgba(0,0,0,0.55)":"0 8px 32px rgba(0,0,0,0.4)" }}
          >
            <Wrench size={28} style={{ marginBottom:"clamp(10px, 3vw, 14px)", color:"#d97706" }} strokeWidth={1.5} />
            <h2 style={{ fontSize:"clamp(18px, 4vw, 21px)", fontWeight:"700", margin:"0 0 clamp(8px, 2vw, 10px)", color:"#fff" }}>I'm a Contractor</h2>
            <p style={{ fontSize:"clamp(13px, 2vw, 14px)", color:"rgba(255,255,255,0.68)", margin:"0 0 clamp(12px, 3vw, 16px)", lineHeight:"1.6" }}>Expand your reach, manage jobs, and get paid — all from one professional platform.</p>
            <ul style={{ listStyle:"none", padding:0, margin:"0 0 clamp(16px, 4vw, 22px)", display:"flex", flexDirection:"column", gap:"6px", fontSize:"clamp(12px, 2vw, 13px)", color:"rgba(255,255,255,0.78)" }}>
              <li>✓ Free 2-week trial</li>
              <li>✓ Get paid securely via Stripe</li>
              <li>✓ Build your reputation</li>
            </ul>
            <button onClick={() => handleAuth("contractor")} style={{ width:"100%", padding:"clamp(12px, 3vw, 13px)", borderRadius:"12px", border:"none", fontSize:"clamp(13px, 2vw, 15px)", fontWeight:"700", cursor:"pointer", transition:"all 0.2s", minHeight:"44px", background:hoveredCard==="contractor"?"#ffffff":"#d97706", color:hoveredCard==="contractor"?"#92400e":"#fff" }}>Join as a Pro →</button>
          </div>
        </div>

        <div style={{ marginTop:"clamp(20px, 6vw, 28px)", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"clamp(8px, 2vw, 12px)", justifyContent:"center", alignItems:"center", maxWidth:"100%", px:"16px" }}>
           {[
             { icon: Shield, label: "Secure payments" },
             { icon: CheckCircle, label: "Identity verified pros" },
             { icon: Shield, label: "Licensed & insured" },
             { icon: ShoppingBag, label: "Nationwide coverage" }
           ].map(({ icon: Icon, label }, i) => (
             <span key={i} style={{ display:"flex", alignItems:"center", gap:"clamp(4px, 2vw, 6px)", justifyContent:"center" }}>
               <Icon size={14} style={{ color:"rgba(255,255,255,0.48)", flexShrink:0 }} strokeWidth={1.5} />
               <span style={{ fontSize:"clamp(11px, 2vw, 13px)", color:"rgba(255,255,255,0.48)" }}>{label}</span>
             </span>
           ))}
        </div>
      </main>

      <MarketsVendorsSection />

      <footer style={{ position:"relative", zIndex:2, display:"flex", flexWrap:"wrap", justifyContent:"center", alignItems:"center", gap:"clamp(6px, 2vw, 8px)", padding:"clamp(12px, 3vw, 18px) clamp(16px, 4vw, 24px)", background:"rgba(10,22,40,0.75)", borderTop:"1px solid rgba(255,255,255,0.07)", fontSize:"clamp(11px, 2vw, 13px)", color:"rgba(255,255,255,0.4)" }}>
        <span>© 2026 SurfCoast Marketplace. All rights reserved.</span>
        <span style={{ color:"rgba(255,255,255,0.15)" }}>·</span>
        <a href={`${BASE_URL}/Terms`} style={{ color:"rgba(255,255,255,0.45)", textDecoration:"none" }}>Terms</a>
        <span style={{ color:"rgba(255,255,255,0.15)" }}>·</span>
        <a href={`${BASE_URL}/PrivacyPolicy`} style={{ color:"rgba(255,255,255,0.45)", textDecoration:"none" }}>Privacy</a>
        <span style={{ color:"rgba(255,255,255,0.15)" }}>·</span>
        <a href={`${BASE_URL}/MarketDirectory`} style={{ color:"rgba(255,255,255,0.45)", textDecoration:"none" }}>Markets</a>
      </footer>

      <div style={{ position:"relative", zIndex:2, width:"100%", background:"rgba(0,0,0,0.55)", borderTop:"1px solid rgba(255,255,255,0.05)", padding:"clamp(8px, 2vw, 9px) clamp(16px, 4vw, 24px)", textAlign:"center" }}>
        <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"clamp(10px, 2vw, 11px)", margin:0, lineHeight:"1.6" }}>SurfCoast Marketplace is a connection platform only. We do not employ contractors and are not responsible for the quality, safety, or legality of services provided. All agreements are between users and contractors directly.</p>
      </div>
    </div>
  );
}