import { useState, useEffect } from "react";
import { ShoppingBag, Home as HomeIcon, Wrench, Shield, CheckCircle, ChevronDown } from "lucide-react";
import FarmersMarketBanner from "@/components/home/FarmersMarketBanner";
import CampaignAdBanner from "@/components/home/CampaignAdBanner";
import { getAppBaseUrl } from "@/lib/env";
import { base44 } from "@/api/base44Client";
import InstagramQRCode from "@/components/social/InstagramQRCode";
import FacebookQRCode from "@/components/social/FacebookQRCode";
import FacebookGroupQRCode from "@/components/social/FacebookGroupQRCode";

const BG_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b5d136d5baa9e2c5f01224/f64fccdce_generated_image.png";

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 600);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleSignup = (destination) => {
    window.location.href = destination;
  };

  return (
    <div style={{ position:"relative", display:"flex", flexDirection:"column", fontFamily:"'Inter','Segoe UI',sans-serif", overflow:"hidden", background:"#0a1628", width:"100vw" }}>
      <div style={{ position:"fixed", inset:0, backgroundImage:`url(${BG_IMAGE})`, backgroundSize:"cover", backgroundPosition:"center top", backgroundRepeat:"no-repeat", zIndex:0 }} />
      <div style={{ position:"fixed", inset:0, background:"rgba(10,22,40,0.72)", zIndex:1 }} />

      <header style={{ position:"sticky", top:0, zIndex:10, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", background:"rgba(10,22,40,0.5)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.08)", minHeight:"44px" }}>
         <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
           <span style={{ fontSize:'14px', fontWeight:'800', color:'#ffffff', letterSpacing:'-0.5px', lineHeight:1, textAlign:'left' }}>SurfCoast</span>
           <span style={{ fontSize:'8px', fontWeight:'700', letterSpacing:'1.5px', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', lineHeight:1, textAlign:'left', marginLeft:'4px' }}>MARKETPLACE</span>
         </div>
         <nav style={{ display:"flex", gap:"8px", alignItems:"center", position:"relative" }}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{ color:"#fff", textDecoration:"none", fontSize:"12px", fontWeight:"700", padding:"6px 14px", background:"#1d6fa4", borderRadius:"20px", border:"1px solid #2589c7", whiteSpace:"nowrap", height:"32px", display:"flex", alignItems:"center", cursor:"pointer", gap:"6px", transition:"all 0.2s" }}>
              Enter <ChevronDown size={14} style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)", transition:"transform 0.2s" }} />
            </button>
            {dropdownOpen && (
              <div style={{ position:"absolute", top:"100%", right:0, marginTop:"8px", background:"rgba(29,111,164,0.95)", border:"1px solid #2589c7", borderRadius:"12px", boxShadow:"0 8px 24px rgba(0,0,0,0.4)", zIndex:50, minWidth:"160px", backdropFilter:"blur(12px)" }}>
                <button onClick={() => { base44.auth.redirectToLogin('/Dashboard'); setDropdownOpen(false); }} style={{ width:"100%", padding:"10px 16px", border:"none", background:"transparent", color:"#fff", fontSize:"13px", fontWeight:"600", textAlign:"left", cursor:"pointer", transition:"background 0.2s", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
                  Login / Sign Up
                </button>
                <button onClick={() => { window.location.href = '/About'; setDropdownOpen(false); }} style={{ width:"100%", padding:"10px 16px", border:"none", background:"transparent", color:"#fff", fontSize:"13px", fontWeight:"600", textAlign:"left", cursor:"pointer", transition:"background 0.2s" }}>
                  About Us
                </button>
              </div>
            )}
         </nav>
       </header>

      <main style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", padding:isMobile ? "clamp(16px, 3vw, 24px) 12px 8px" : "28px 16px 8px", width:"100%", flex:1 }}>

        <div style={{ textAlign:"center", marginBottom:isMobile ? "clamp(12px, 3vw, 16px)" : "12px", maxWidth:"680px" }}>
          <h1 style={{ fontSize:"clamp(28px, 6vw, 60px)", fontWeight:"800", color:"#ffffff", margin:"0 0 clamp(8px, 2vw, 12px)", lineHeight:1.1, letterSpacing:"-1.5px", textShadow:"0 2px 24px rgba(0,0,0,0.6)" }}>The Trades Marketplace</h1>
          <p style={{ fontSize:"clamp(16px, 4vw, 28px)", fontWeight:"700", color:"#d97706", margin:"0 0 clamp(12px, 3vw, 16px)", lineHeight:1.3, letterSpacing:"-0.5px", textShadow:"0 2px 16px rgba(217,119,6,0.3)" }}>No Shortcuts. Just Work.</p>
          <p style={{ fontSize:"clamp(13px, 3vw, 16px)", color:"rgba(255,255,255,0.72)", margin:0, lineHeight:1.65 }}>Connect with licensed, verified tradespeople across the country — or grow your business and land your next job.</p>
        </div>

        <CampaignAdBanner />

        <div style={{ display:"flex", flexDirection:isMobile ? "column" : "row", alignItems:"stretch", width:"100%", maxWidth:"900px", gap:isMobile ? "clamp(12px, 3vw, 16px)" : "clamp(16px, 4vw, 32px)", justifyContent:"center", marginBottom:"12px" }}>
           {/* Left Card - Find a Pro */}
          <div
            onMouseEnter={() => setHoveredCard("customer")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ flex:isMobile ? "unset" : 1, display:"flex", flexDirection:"column", borderRadius:"16px", padding:isMobile ? "22px 18px" : "32px 28px", backdropFilter:"blur(18px)", transition:"all 0.22s ease", cursor:"default", background:"rgba(10,22,40,0.5)", border:"1px solid rgba(45,140,200,0.4)", transform:hoveredCard==="customer"?"translateY(-2px)":"none", boxShadow:hoveredCard==="customer"?"0 12px 32px rgba(29,111,164,0.25)":"0 4px 16px rgba(0,0,0,0.3)" }}
          >
            <HomeIcon size={28} style={{ marginBottom:"clamp(10px, 3vw, 14px)", color:"#1d6fa4" }} strokeWidth={1.5} />
            <h2 style={{ fontSize:"20px", fontWeight:"700", margin:"0 0 12px", color:"#fff" }}>Find a Pro</h2>
            <p style={{ fontSize:"14px", color:"rgba(255,255,255,0.7)", margin:"0 0 16px", lineHeight:"1.6", flex:1 }}>Post your project, get competitive quotes, and hire a vetted tradesperson near you.</p>
            <ul style={{ listStyle:"none", padding:0, margin:"0 0 clamp(16px, 4vw, 22px)", display:"flex", flexDirection:"column", gap:"6px", fontSize:"clamp(12px, 2vw, 13px)", color:"rgba(255,255,255,0.78)" }}>
              <li>✓ Verified & licensed pros only</li>
              <li>✓ Free 2-week trial</li>
              <li>✓ Secure payments</li>
            </ul>
            <button onClick={() => window.location.href = '/FindContractors'} style={{ width:"100%", padding:"12px 16px", borderRadius:"8px", border:"none", fontSize:"15px", fontWeight:"700", cursor:"pointer", transition:"all 0.2s", minHeight:"44px", background:"#1d6fa4", color:"#fff", marginTop:"auto" }}>Find a Pro →</button>
          </div>

          {/* Horizontal/Vertical OR Divider */}
          {isMobile ? (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", width:"100%" }}>
              <div style={{ background:"rgba(255,255,255,0.12)", width:"100%", height:"1px" }} />
              <span style={{ color:"rgba(255,255,255,0.35)", fontSize:"clamp(11px, 2vw, 12px)", fontWeight:"600", whiteSpace:"nowrap", margin:"0 clamp(8px, 2vw, 12px)", transform:"translateZ(0)" }}>OR</span>
              <div style={{ background:"rgba(255,255,255,0.12)", width:"100%", height:"1px" }} />
            </div>
          ) : (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ background:"rgba(255,255,255,0.12)", width:"1px", height:"60%", minHeight:"100px" }} />
              <span style={{ color:"rgba(255,255,255,0.35)", fontSize:"clamp(11px, 2vw, 12px)", fontWeight:"600", whiteSpace:"nowrap", margin:"0 clamp(8px, 2vw, 12px)", transform:"translateZ(0)" }}>OR</span>
              <div style={{ background:"rgba(255,255,255,0.12)", width:"1px", height:"60%", minHeight:"100px" }} />
            </div>
          )}

          {/* Right Card - Join as a Pro */}
          <div
            onMouseEnter={() => setHoveredCard("contractor")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ flex:isMobile ? "unset" : 1, display:"flex", flexDirection:"column", borderRadius:"16px", padding:isMobile ? "22px 18px" : "32px 28px", backdropFilter:"blur(18px)", transition:"all 0.22s ease", cursor:"default", background:"rgba(10,22,40,0.5)", border:"1px solid rgba(217,119,6,0.4)", transform:hoveredCard==="contractor"?"translateY(-2px)":"none", boxShadow:hoveredCard==="contractor"?"0 12px 32px rgba(217,119,6,0.2)":"0 4px 16px rgba(0,0,0,0.3)" }}
          >
            <Wrench size={28} style={{ marginBottom:"clamp(10px, 3vw, 14px)", color:"#d97706" }} strokeWidth={1.5} />
            <h2 style={{ fontSize:"20px", fontWeight:"700", margin:"0 0 12px", color:"#fff" }}>Join as a Pro</h2>
            <p style={{ fontSize:"14px", color:"rgba(255,255,255,0.7)", margin:"0 0 16px", lineHeight:"1.6", flex:1 }}>Expand your reach, manage jobs, and get paid — all from one professional platform.</p>
            <ul style={{ listStyle:"none", padding:0, margin:"0 0 clamp(16px, 4vw, 22px)", display:"flex", flexDirection:"column", gap:"6px", fontSize:"clamp(12px, 2vw, 13px)", color:"rgba(255,255,255,0.78)" }}>
              <li>✓ Free 2-week trial</li>
              <li>✓ Get paid securely via Stripe</li>
              <li>✓ Build your reputation</li>
            </ul>
            <button onClick={() => handleSignup('/BecomeContractor')} style={{ width:"100%", padding:"12px 16px", borderRadius:"8px", border:"none", fontSize:"15px", fontWeight:"700", cursor:"pointer", transition:"all 0.2s", minHeight:"44px", background:"#d97706", color:"#fff", marginTop:"auto" }}>Join as a Pro →</button>
          </div>
        </div>

        <FarmersMarketBanner />
      </main>

      <div style={{ position:"relative", zIndex:2, width:"100%", padding:"6px 16px", background:"rgba(10,22,40,0.5)", flexShrink:0 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"16px", justifyContent:"center", alignItems:"center", maxWidth:"900px", margin:"0 auto", px:"16px" }}>
           {[
             { icon: Shield, label: "Secure payments" },
             { icon: CheckCircle, label: "Identity verified pros" },
             { icon: Shield, label: "Licensed & insured" },
             { icon: ShoppingBag, label: "Nationwide coverage" }
           ].map(({ icon: Icon, label }, i) => (
             <span key={i} style={{ display:"flex", alignItems:"center", gap:"6px", justifyContent:"center" }}>
               <Icon size={14} style={{ color:"rgba(255,255,255,0.48)", flexShrink:0 }} strokeWidth={1.5} />
               <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.48)" }}>{label}</span>
             </span>
           ))}
        </div>
      </div>

      <div style={{ position:"relative", zIndex:2, width:"100%", background:"rgba(10,22,40,0.8)", borderTop:"1px solid rgba(255,255,255,0.05)", padding:"clamp(24px, 4vw, 32px) clamp(16px, 4vw, 24px)", flexShrink:0 }}>
        <div style={{ maxWidth:"900px", margin:"0 auto" }}>
          <h3 style={{ color:"rgba(255,255,255,0.9)", fontSize:"16px", fontWeight:"700", marginBottom:"20px", textAlign:"center" }}>Connect With Us</h3>
          <div style={{ display:"grid", gridTemplateColumns:window.innerWidth < 600 ? "1fr" : "repeat(3, 1fr)", gap:"20px", justifyContent:"center", alignItems:"start" }}>
            <div style={{ display:"flex", justifyContent:"center" }}>
              <InstagramQRCode size={60} />
            </div>
            <div style={{ display:"flex", justifyContent:"center" }}>
              <FacebookQRCode size={60} />
            </div>
            <div style={{ display:"flex", justifyContent:"center" }}>
              <FacebookGroupQRCode size={60} />
            </div>
          </div>
        </div>
      </div>

      <footer style={{ position:"relative", zIndex:2, padding:"clamp(16px, 3vw, 24px) clamp(16px, 4vw, 24px)", background:"rgba(10,22,40,0.75)", borderTop:"1px solid rgba(255,255,255,0.07)", flexShrink:0 }}>
        <div style={{ maxWidth:"900px", margin:"0 auto", display:"flex", flexDirection:"column", alignItems:"center", gap:"8px", marginBottom:"12px" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"2px" }}>
            <span style={{ fontSize:"22px", fontWeight:"800", color:"#ffffff", letterSpacing:"-0.5px", lineHeight:1 }}>SurfCoast</span>
            <span style={{ fontSize:"9px", fontWeight:"700", letterSpacing:"3px", color:"rgba(255,255,255,0.5)", textTransform:"uppercase", lineHeight:1 }}>MARKETPLACE</span>
          </div>
          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"12px", textAlign:"center", margin:0 }}>Premium marketplace connecting exceptional professionals with discerning clients.</p>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", alignItems:"center", gap:"clamp(6px, 2vw, 8px)", fontSize:"clamp(11px, 2vw, 13px)", color:"rgba(255,255,255,0.4)" }}>
        <span>© 2026 SurfCoast Marketplace. All rights reserved.</span>
        <span style={{ color:"rgba(255,255,255,0.15)" }}>·</span>
        <a href={`${getAppBaseUrl()}/Terms`} style={{ color:"rgba(255,255,255,0.45)", textDecoration:"none" }}>Terms</a>
        <span style={{ color:"rgba(255,255,255,0.15)" }}>·</span>
        <a href={`${getAppBaseUrl()}/PrivacyPolicy`} style={{ color:"rgba(255,255,255,0.45)", textDecoration:"none" }}>Privacy</a>
        <span style={{ color:"rgba(255,255,255,0.15)" }}>·</span>
        <a href={`${getAppBaseUrl()}/MarketDirectory`} style={{ color:"rgba(255,255,255,0.45)", textDecoration:"none" }}>Markets</a>
      </footer>

      <div style={{ position:"relative", zIndex:2, width:"100%", background:"rgba(0,0,0,0.55)", borderTop:"1px solid rgba(255,255,255,0.05)", padding:"6px clamp(16px, 4vw, 24px)", textAlign:"center", flexShrink:0 }}>
        <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"clamp(10px, 2vw, 11px)", margin:0, lineHeight:"1.6" }}>SurfCoast Marketplace is a connection platform only. We do not employ contractors and are not responsible for the quality, safety, or legality of services provided. All agreements are between users and contractors directly.</p>
      </div>
    </div>
  );
}