import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Home as HomeIcon, Wrench, Shield, CheckCircle, ChevronDown, Store, Users } from "lucide-react";
import VendorSearchBar from "@/components/home/VendorSearchBar";
import ContractorLocationSearch from "@/components/home/ContractorLocationSearch";
import CampaignAdBanner from "@/components/home/CampaignAdBanner";
import EarlyAdopterBanner from "@/components/home/EarlyAdopterBanner";
import FeaturedVendors from "@/components/home/FeaturedVendors";
import NewsletterSubscribeModal from "@/components/home/NewsletterSubscribeModal";
import MissionStatement from "@/components/home/MissionStatement";
import { base44 } from "@/api/base44Client";

const BG_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b5d136d5baa9e2c5f01224/f64fccdce_generated_image.png";

export default function Home() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 600);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleSignup = (destination) => {
    navigate(destination);
  };

  return (
    <div style={{ background:"linear-gradient(135deg, #0a1628 0%, #0f2040 50%, #0a1628 100%)", backgroundImage:`url(${BG_IMAGE})`, backgroundSize:"cover", backgroundPosition:"center top", backgroundRepeat:"no-repeat", backgroundAttachment:"fixed", minHeight:"100vh" }}>
      <NewsletterSubscribeModal />
      <div style={{ position:"absolute", inset:0, background:"rgba(10,22,40,0.72)", pointerEvents:"none" }} />
      
      <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", padding:isMobile ? "clamp(16px, 3vw, 24px) 12px 8px" : "28px 16px 8px", width:"100%", minHeight:"100vh" }}>

        <section style={{ textAlign:"center", marginBottom:isMobile ? "clamp(12px, 3vw, 16px)" : "12px", maxWidth:"680px" }}>
          <h2 style={{ fontSize:"clamp(28px, 6vw, 60px)", fontWeight:"800", color:"#ffffff", margin:"0 0 clamp(8px, 2vw, 12px)", lineHeight:1.1, letterSpacing:"-1.5px", textShadow:"0 2px 24px rgba(0,0,0,0.6)" }}>The Trades Marketplace</h2>
          <p style={{ fontSize:"clamp(16px, 4vw, 28px)", fontWeight:"700", color:"#d97706", margin:"0 0 clamp(12px, 3vw, 16px)", lineHeight:1.3, letterSpacing:"-0.5px", textShadow:"0 2px 16px rgba(217,119,6,0.3)" }}>No Shortcuts. Just Hard Work.</p>
          <p style={{ fontSize:"clamp(13px, 3vw, 16px)", color:"rgba(255,255,255,0.82)", margin:0, lineHeight:1.65 }}>Connect with licensed, verified tradespeople across the country — or grow your business and land your next job.</p>
        </section>

        <CampaignAdBanner />
        <EarlyAdopterBanner />

        {/* Mission Statement */}
        <MissionStatement />





        {/* Primary CTA Cards - Find a Pro / Join as a Pro */}
        <section style={{ display:"flex", flexDirection:isMobile ? "column" : "row", alignItems:"stretch", width:"100%", maxWidth:"900px", gap:isMobile ? "clamp(12px, 3vw, 16px)" : "clamp(16px, 4vw, 32px)", justifyContent:"center", marginBottom:"24px" }} aria-label="Primary action cards">
          {/* Left Card - Find a Pro */}
          <article
            onMouseEnter={() => setHoveredCard("customer")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ flex:isMobile ? "unset" : 1, display:"flex", flexDirection:"column", borderRadius:"16px", padding:isMobile ? "22px 18px" : "32px 28px", backdropFilter:"blur(18px)", transition:"all 0.22s ease", cursor:"default", background:"rgba(10,22,40,0.5)", border:"1px solid rgba(45,140,200,0.4)", transform:hoveredCard==="customer"?"translateY(-2px)":"none", boxShadow:hoveredCard==="customer"?"0 0 32px rgba(29,111,164,0.4), 0 12px 32px rgba(29,111,164,0.25)":"0 4px 16px rgba(0,0,0,0.3)", position:"relative", overflow:"hidden" }}
          >
            <HomeIcon size={28} style={{ marginBottom:"clamp(10px, 3vw, 14px)", color:"#1d6fa4" }} strokeWidth={1.5} aria-hidden="true" />
            <h3 style={{ fontSize:"20px", fontWeight:"700", margin:"0 0 12px", color:"#fff" }}>Find a Pro</h3>
            <p style={{ fontSize:"14px", color:"rgba(255,255,255,0.82)", margin:"0 0 16px", lineHeight:"1.6", flex:1 }}>Post your project, get competitive quotes, and hire a vetted tradesperson near you.</p>
            <ul style={{ listStyle:"none", padding:0, margin:"0 0 clamp(16px, 4vw, 22px)", display:"flex", flexDirection:"column", gap:"6px", fontSize:"clamp(12px, 2vw, 13px)", color:"rgba(255,255,255,0.88)" }}>
              <li>✓ Verified & licensed pros only</li>
              <li>✓ Free 2-week trial</li>
              <li>✓ Secure payments</li>
            </ul>
            <button 
              onClick={() => navigate('/CustomerSignup')} 
              onMouseEnter={(e) => e.target.style.boxShadow = "0 0 16px rgba(29,111,164,0.6), 0 4px 12px rgba(29,111,164,0.3)"} 
              onMouseLeave={(e) => e.target.style.boxShadow = "none"}
              aria-label="Find a Pro - navigate to customer signup"
              style={{ width:"100%", padding:"12px 16px", borderRadius:"8px", border:"none", fontSize:"15px", fontWeight:"700", cursor:"pointer", transition:"all 0.2s", minHeight:"44px", background:"#1d6fa4", color:"#fff", marginTop:"auto", outline:"2px solid transparent", outlineOffset:"2px" }}
            >
              Find a Pro →
            </button>
          </article>

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
          <article
            onMouseEnter={() => setHoveredCard("contractor")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ flex:isMobile ? "unset" : 1, display:"flex", flexDirection:"column", borderRadius:"16px", padding:isMobile ? "22px 18px" : "32px 28px", backdropFilter:"blur(18px)", transition:"all 0.22s ease", cursor:"default", background:"rgba(10,22,40,0.5)", border:"1px solid rgba(217,119,6,0.4)", transform:hoveredCard==="contractor"?"translateY(-2px)":"none", boxShadow:hoveredCard==="contractor"?"0 0 32px rgba(217,119,6,0.5), 0 12px 32px rgba(217,119,6,0.2)":"0 4px 16px rgba(0,0,0,0.3)", position:"relative", overflow:"hidden" }}
          >
            <Wrench size={28} style={{ marginBottom:"clamp(10px, 3vw, 14px)", color:"#d97706" }} strokeWidth={1.5} aria-hidden="true" />
            <h3 style={{ fontSize:"20px", fontWeight:"700", margin:"0 0 12px", color:"#fff" }}>Join as a Pro</h3>
            <p style={{ fontSize:"14px", color:"rgba(255,255,255,0.82)", margin:"0 0 16px", lineHeight:"1.6", flex:1 }}>Expand your reach, manage jobs, and get paid — all from one professional platform.</p>
            <ul style={{ listStyle:"none", padding:0, margin:"0 0 clamp(16px, 4vw, 22px)", display:"flex", flexDirection:"column", gap:"6px", fontSize:"clamp(12px, 2vw, 13px)", color:"rgba(255,255,255,0.88)" }}>
              <li>✓ Free 2-week trial</li>
              <li>✓ Get paid securely via Stripe</li>
              <li>✓ Build your reputation</li>
            </ul>
            <button 
              onClick={() => handleSignup('/BecomeContractor')} 
              onMouseEnter={(e) => e.target.style.boxShadow = "0 0 16px rgba(217,119,6,0.7), 0 4px 12px rgba(217,119,6,0.4)"} 
              onMouseLeave={(e) => e.target.style.boxShadow = "none"}
              aria-label="Join as a Pro - navigate to contractor signup"
              style={{ width:"100%", padding:"12px 16px", borderRadius:"8px", border:"none", fontSize:"15px", fontWeight:"700", cursor:"pointer", transition:"all 0.2s", minHeight:"44px", background:"#d97706", color:"#fff", marginTop:"auto", outline:"2px solid transparent", outlineOffset:"2px" }}
            >
              Join as a Pro →
            </button>
          </article>
          </section>

        {/* Secondary CTA Cards - Market Booth, Vendor, Consumer */}
        <section style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "repeat(3, 1fr)", alignItems:"stretch", width:"100%", maxWidth:"900px", gap:isMobile ? "clamp(12px, 3vw, 16px)" : "clamp(12px, 2vw, 16px)", justifyContent:"center", marginBottom:"24px" }} aria-label="Secondary action cards">
          {/* Market Booth Card */}
          <article
            onMouseEnter={() => setHoveredCard("booth")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ display:"flex", flexDirection:"column", borderRadius:"14px", padding:isMobile ? "20px 16px" : "24px 20px", backdropFilter:"blur(18px)", transition:"all 0.22s ease", cursor:"default", background:"rgba(10,22,40,0.5)", border:"1px solid rgba(139,125,107,0.4)", transform:hoveredCard==="booth"?"translateY(-2px)":"none", boxShadow:hoveredCard==="booth"?"0 0 24px rgba(139,125,107,0.35), 0 8px 24px rgba(139,125,107,0.15)":"0 4px 16px rgba(0,0,0,0.3)", position:"relative", overflow:"hidden", textAlign:"left" }}
          >
            <Store size={24} style={{ marginBottom:"10px", color:"#9d7a54" }} strokeWidth={1.5} aria-hidden="true" />
            <h3 style={{ fontSize:"17px", fontWeight:"700", margin:"0 0 4px", color:"#fff" }}>Welcome to the Marketplace</h3>
            <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.75)", margin:"0 0 12px", lineHeight:"1.5", flex:1 }}>Pick Your Market — Select Farmers Market to set up your booth and sell fresh goods.</p>
            <button 
              onClick={() => navigate('/MarketShopSignup?type=farmers_market')} 
              onMouseEnter={(e) => e.target.style.boxShadow = "0 0 12px rgba(157,122,84,0.6), 0 4px 8px rgba(157,122,84,0.3)"} 
              onMouseLeave={(e) => e.target.style.boxShadow = "none"}
              aria-label="Get started as a farmers market vendor"
              style={{ width:"100%", padding:"10px 14px", borderRadius:"8px", border:"none", fontSize:"13px", fontWeight:"700", cursor:"pointer", transition:"all 0.2s", minHeight:"40px", background:"#9d7a54", color:"#fff", outline:"2px solid transparent", outlineOffset:"2px" }}
            >
              Get Started →
            </button>
          </article>

          {/* SwapMeets Card */}
          <article
            onMouseEnter={() => setHoveredCard("swapmeets")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ display:"flex", flexDirection:"column", borderRadius:"14px", padding:isMobile ? "20px 16px" : "24px 20px", backdropFilter:"blur(18px)", transition:"all 0.22s ease", cursor:"default", background:"rgba(10,22,40,0.5)", border:"1px solid rgba(249,115,22,0.4)", transform:hoveredCard==="swapmeets"?"translateY(-2px)":"none", boxShadow:hoveredCard==="swapmeets"?"0 0 24px rgba(249,115,22,0.4), 0 8px 24px rgba(249,115,22,0.15)":"0 4px 16px rgba(0,0,0,0.3)", position:"relative", overflow:"hidden", textAlign:"left" }}
          >
            <ShoppingBag size={24} style={{ marginBottom:"10px", color:"#f97316" }} strokeWidth={1.5} aria-hidden="true" />
            <h3 style={{ fontSize:"17px", fontWeight:"700", margin:"0 0 4px", color:"#fff" }}>Reserve Your Swap Meet Space</h3>
            <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.75)", margin:"0 0 12px", lineHeight:"1.5", flex:1 }}>Secure your booth, list your goods, and start selling to local buyers today.</p>
            <button 
              onClick={() => navigate('/MarketShopSignup?type=swap_meet')} 
              onMouseEnter={(e) => e.target.style.boxShadow = "0 0 12px rgba(249,115,22,0.6), 0 4px 8px rgba(249,115,22,0.3)"} 
              onMouseLeave={(e) => e.target.style.boxShadow = "none"}
              aria-label="Get started as a swap meet vendor"
              style={{ width:"100%", padding:"10px 14px", borderRadius:"8px", border:"none", fontSize:"13px", fontWeight:"700", cursor:"pointer", transition:"all 0.2s", minHeight:"40px", background:"#f97316", color:"#fff", outline:"2px solid transparent", outlineOffset:"2px" }}
            >
              Get Started →
            </button>
          </article>

          {/* Consumer Card */}
          <article
            onMouseEnter={() => setHoveredCard("consumer")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ display:"flex", flexDirection:"column", borderRadius:"14px", padding:isMobile ? "20px 16px" : "24px 20px", backdropFilter:"blur(18px)", transition:"all 0.22s ease", cursor:"default", background:"rgba(10,22,40,0.5)", border:"1px solid rgba(34,197,94,0.4)", transform:hoveredCard==="consumer"?"translateY(-2px)":"none", boxShadow:hoveredCard==="consumer"?"0 0 24px rgba(34,197,94,0.4), 0 8px 24px rgba(34,197,94,0.15)":"0 4px 16px rgba(0,0,0,0.3)", position:"relative", overflow:"hidden" }}
          >
            <Users size={24} style={{ marginBottom:"10px", color:"#22c55e" }} strokeWidth={1.5} aria-hidden="true" />
            <h3 style={{ fontSize:"17px", fontWeight:"700", margin:"0 0 8px", color:"#fff" }}>Consumer</h3>
            <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.75)", margin:"0 0 12px", lineHeight:"1.5", flex:1 }}>Shop booths and vendors at local farmers markets.</p>
            <button 
              onClick={() => navigate('/ConsumerSignup')} 
              onMouseEnter={(e) => e.target.style.boxShadow = "0 0 12px rgba(34,197,94,0.6), 0 4px 8px rgba(34,197,94,0.3)"} 
              onMouseLeave={(e) => e.target.style.boxShadow = "none"}
              aria-label="Start shopping as a consumer"
              style={{ width:"100%", padding:"10px 14px", borderRadius:"8px", border:"none", fontSize:"13px", fontWeight:"700", cursor:"pointer", transition:"all 0.2s", minHeight:"40px", background:"#22c55e", color:"#fff", outline:"2px solid transparent", outlineOffset:"2px" }}
            >
              Start Shopping →
            </button>
          </article>
        </section>

        <FeaturedVendors />
        <ContractorLocationSearch />
        <VendorSearchBar />
      </div>
    </div>
  );
}