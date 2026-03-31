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
import WhySurfCoastSection from "@/components/home/WhySurfCoastSection";
import { base44 } from "@/api/base44Client";
// QRCode imports temporarily disabled due to package resolution issue
// import InstagramQRCode from "@/components/social/InstagramQRCode";
// import FacebookQRCode from "@/components/social/FacebookQRCode";
// import FacebookGroupQRCode from "@/components/social/FacebookGroupQRCode";

const BG_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b5d136d5baa9e2c5f01224/f64fccdce_generated_image.png";

export default function Home() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownButtonRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 600);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const redirectIfLoggedIn = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          navigate('/Dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    redirectIfLoggedIn();
  }, [navigate]);

  // Handle keyboard navigation for dropdown
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && dropdownOpen) {
        setDropdownOpen(false);
        dropdownButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !dropdownButtonRef.current?.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);



  const handleSignup = (destination) => {
    window.location.href = destination;
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin();
    setDropdownOpen(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, overflowY:"auto", overflowX:"hidden", display:"flex", flexDirection:"column", fontFamily:"'Inter','Segoe UI',sans-serif", background:"#0a1628" }}>
      <NewsletterSubscribeModal />
      <div style={{ position:"fixed", inset:0, backgroundImage:`url(${BG_IMAGE})`, backgroundSize:"cover", backgroundPosition:"center top", backgroundRepeat:"no-repeat", zIndex:0 }} />
      <div style={{ position:"fixed", inset:0, background:"rgba(10,22,40,0.72)", zIndex:1 }} />

      <header style={{ position:"sticky", top:0, zIndex:10, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", background:"rgba(10,22,40,0.5)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.08)", minHeight:"44px" }} role="banner">
        <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
          <h1 style={{ fontSize:'14px', fontWeight:'800', color:'#ffffff', letterSpacing:'-0.5px', lineHeight:1, textAlign:'left', margin:0 }}>SurfCoast</h1>
          <span style={{ fontSize:'8px', fontWeight:'700', letterSpacing:'1.5px', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', lineHeight:1, textAlign:'left', marginLeft:'4px' }}>MARKETPLACE</span>
        </div>
        <nav style={{ display:"flex", gap:"8px", alignItems:"center", position:"relative" }} aria-label="Main navigation">
          <a href="/why-surfcoast" style={{ color:"rgba(255,255,255,0.85)", textDecoration:"none", fontSize:"12px", fontWeight:"600", padding:"6px 12px", whiteSpace:"nowrap", transition:"color 0.2s" }} onMouseEnter={(e) => e.target.style.color="#fff"} onMouseLeave={(e) => e.target.style.color="rgba(255,255,255,0.85)"}>Why SurfCoast</a>
          <a href="/pricing" style={{ color:"rgba(255,255,255,0.85)", textDecoration:"none", fontSize:"12px", fontWeight:"600", padding:"6px 12px", whiteSpace:"nowrap", transition:"color 0.2s" }} onMouseEnter={(e) => e.target.style.color="#fff"} onMouseLeave={(e) => e.target.style.color="rgba(255,255,255,0.85)"}>Pricing</a>
          <button 
            ref={dropdownButtonRef}
            onClick={() => setDropdownOpen(!dropdownOpen)} 
            onMouseEnter={(e) => e.target.style.boxShadow = "0 0 12px rgba(37,137,199,0.6)"} 
            onMouseLeave={(e) => e.target.style.boxShadow = "none"}
            aria-haspopup="menu" 
            aria-expanded={dropdownOpen}
            aria-controls="user-menu"
            style={{ color:"#fff", textDecoration:"none", fontSize:"12px", fontWeight:"700", padding:"6px 14px", background:"#1d6fa4", borderRadius:"20px", border:"1px solid #2589c7", whiteSpace:"nowrap", height:"32px", display:"flex", alignItems:"center", cursor:"pointer", gap:"6px", transition:"all 0.2s", outline:"2px solid transparent", outlineOffset:"2px" }}
          >
            Enter <ChevronDown size={14} aria-hidden="true" style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)", transition:"transform 0.2s" }} />
          </button>
          {dropdownOpen && (
           <div 
             ref={dropdownRef}
             id="user-menu"
             role="menu"
             style={{ position:"absolute", top:"100%", right:0, marginTop:"8px", background:"rgba(29,111,164,0.95)", border:"1px solid #2589c7", borderRadius:"12px", boxShadow:"0 8px 24px rgba(0,0,0,0.4)", zIndex:50, minWidth:"160px", backdropFilter:"blur(12px)" }}
           >
             <button 
               role="menuitem"
               onClick={() => { window.location.href = '/pricing'; setDropdownOpen(false); }} 
               onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
               onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
               style={{ width:"100%", padding:"10px 16px", border:"none", background:"transparent", color:"#fff", fontSize:"13px", fontWeight:"600", textAlign:"left", cursor:"pointer", transition:"background 0.2s", borderBottom:"1px solid rgba(255,255,255,0.1)" }}
             >
               Pricing
             </button>
             <button 
               role="menuitem"
               onClick={() => { window.location.href = '/why-surfcoast'; setDropdownOpen(false); }} 
               onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
               onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
               style={{ width:"100%", padding:"10px 16px", border:"none", background:"transparent", color:"#fff", fontSize:"13px", fontWeight:"600", textAlign:"left", cursor:"pointer", transition:"background 0.2s", borderBottom:"1px solid rgba(255,255,255,0.1)" }}
             >
               Why SurfCoast
             </button>
             <button 
               role="menuitem"
               onClick={handleLogin} 
               onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
               onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
               style={{ width:"100%", padding:"10px 16px", border:"none", background:"transparent", color:"#fff", fontSize:"13px", fontWeight:"600", textAlign:"left", cursor:"pointer", transition:"background 0.2s", borderBottom:"1px solid rgba(255,255,255,0.1)" }}
             >
               Login / Sign Up
             </button>
             <button 
               role="menuitem"
               onClick={() => { window.location.href = '/About'; setDropdownOpen(false); }} 
               onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
               onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
               style={{ width:"100%", padding:"10px 16px", border:"none", background:"transparent", color:"#fff", fontSize:"13px", fontWeight:"600", textAlign:"left", cursor:"pointer", transition:"background 0.2s" }}
             >
               About Us
             </button>
           </div>
          )}
        </nav>
      </header>

      <main style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", padding:isMobile ? "clamp(16px, 3vw, 24px) 12px 8px" : "28px 16px 8px", width:"100%", flex:1 }}>

        <section style={{ textAlign:"center", marginBottom:isMobile ? "clamp(12px, 3vw, 16px)" : "12px", maxWidth:"680px" }}>
          <h2 style={{ fontSize:"clamp(28px, 6vw, 60px)", fontWeight:"800", color:"#ffffff", margin:"0 0 clamp(8px, 2vw, 12px)", lineHeight:1.1, letterSpacing:"-1.5px", textShadow:"0 2px 24px rgba(0,0,0,0.6)" }}>The Trades Marketplace</h2>
          <p style={{ fontSize:"clamp(16px, 4vw, 28px)", fontWeight:"700", color:"#d97706", margin:"0 0 clamp(12px, 3vw, 16px)", lineHeight:1.3, letterSpacing:"-0.5px", textShadow:"0 2px 16px rgba(217,119,6,0.3)" }}>No Shortcuts. Just Hard Work.</p>
          <p style={{ fontSize:"clamp(13px, 3vw, 16px)", color:"rgba(255,255,255,0.82)", margin:0, lineHeight:1.65 }}>Connect with licensed, verified tradespeople across the country — or grow your business and land your next job.</p>
        </section>

        <CampaignAdBanner />
        <EarlyAdopterBanner />

        {/* Mission Statement */}
        <MissionStatement />

        {/* Why SurfCoast Section */}
        <WhySurfCoastSection />

        {/* Why SurfCoast - Three Column Benefits */}
        <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', alignItems: 'start', width: '100%', maxWidth: '900px', gap: 'clamp(12px, 3vw, 20px)', marginBottom: '32px' }} aria-label="Platform benefits">
          {[
            {
              title: 'For Contractors',
              points: [
                'WAVE Starter at $19/month',
                'Job scheduling & invoicing',
                'Customer portal & messaging',
                'Mobile app with full features'
              ]
            },
            {
              title: 'For WAVEShop Vendors',
              points: [
                'Market booth management',
                'Inventory tracking & payments',
                'Customer reviews & ratings',
                'Marketing tools at $35/month'
              ]
            },
            {
              title: 'For Everyone Else',
              points: [
                'Freelancers, creatives, services',
                'Flexible month-to-month plans',
                'No contracts or setup fees',
                'Cancel anytime, no penalties'
              ]
            }
          ].map((section, idx) => (
            <article key={idx} style={{ display: 'flex', flexDirection: 'column', borderRadius: '14px', padding: isMobile ? '20px 16px' : '24px 20px', backdropFilter: 'blur(18px)', background: 'rgba(10,22,40,0.5)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 14px', color: '#d97706' }}>
                {section.title}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {section.points.map((point, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                    <span style={{ color: '#d97706', marginTop: '2px' }}>✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        {/* Pricing Tracks */}
        <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', alignItems: 'stretch', width: '100%', maxWidth: '900px', gap: 'clamp(16px, 4vw, 24px)', marginBottom: '32px' }} aria-label="Pricing options">
          {/* Wave FO Pricing Card */}
          <article style={{ display: 'flex', flexDirection: 'column', borderRadius: '16px', padding: '28px 24px', backdropFilter: 'blur(18px)', background: 'rgba(217,119,6,0.08)', border: '2px solid rgba(217,119,6,0.3)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px', color: '#ffffff' }}>WAVE FO Plans</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '0 0 16px' }}>For contractors and solo professionals</p>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '32px', fontWeight: '800', color: '#d97706' }}>From $19</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>/month</span>
            </div>
            <button
              onClick={() => window.location.href = '/pricing'}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                background: '#d97706',
                color: '#fff',
                minHeight: '40px',
                transition: 'all 0.2s'
              }}
            >
              See all plans →
            </button>
          </article>

          {/* WAVEShop Pricing Card */}
          <article style={{ display: 'flex', flexDirection: 'column', borderRadius: '16px', padding: '28px 24px', backdropFilter: 'blur(18px)', background: 'rgba(157,122,84,0.08)', border: '2px solid rgba(157,122,84,0.3)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px', color: '#ffffff' }}>WAVEShop Vendor</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '0 0 16px' }}>For farmers market & swap meet booths</p>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '32px', fontWeight: '800', color: '#9d7a54' }}>$35</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>/month</span>
            </div>
            <button
              onClick={() => window.location.href = '/pricing'}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                background: '#9d7a54',
                color: '#fff',
                minHeight: '40px',
                transition: 'all 0.2s'
              }}
            >
              See all plans →
            </button>
          </article>
        </section>

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
              onClick={() => window.location.href = '/CustomerSignup'} 
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
              onClick={() => window.location.href = '/MarketShopSignup?type=farmers_market'} 
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
              onClick={() => window.location.href = '/MarketShopSignup?type=swap_meet'} 
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
              onClick={() => window.location.href = '/ConsumerSignup'} 
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
      </main>

      <section style={{ position:"relative", zIndex:2, width:"100%", padding:"6px 16px", background:"rgba(10,22,40,0.5)", flexShrink:0 }} aria-label="Trust and security features">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"16px", justifyContent:"center", alignItems:"center", maxWidth:"900px", margin:"0 auto", px:"16px" }}>
          {[
            { icon: Shield, label: "Secure payments" },
            { icon: CheckCircle, label: "Identity verified pros" },
            { icon: Shield, label: "Licensed & insured" },
            { icon: ShoppingBag, label: "Nationwide coverage" }
          ].map(({ icon: Icon, label }, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:"6px", justifyContent:"center" }}>
              <Icon size={14} style={{ color:"rgba(255,255,255,0.8)", flexShrink:0 }} strokeWidth={1.5} aria-hidden="true" />
              <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.8)" }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* QR Code section temporarily disabled due to package resolution issue */}
      {/* <section style={{ position:"relative", zIndex:2, width:"100%", background:"rgba(10,22,40,0.8)", borderTop:"1px solid rgba(255,255,255,0.05)", padding:"clamp(24px, 4vw, 32px) clamp(16px, 4vw, 24px)", flexShrink:0 }} aria-label="Connect with us on social media">
        <div style={{ maxWidth:"900px", margin:"0 auto" }}>
          <h2 style={{ color:"#ffffff", fontSize:"16px", fontWeight:"700", marginBottom:"20px", textAlign:"center" }}>Connect With Us</h2>
          <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "repeat(3, 1fr)", gap:"20px", justifyContent:"center", alignItems:"start" }}>
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
      </section> */}

      <footer style={{ position:"relative", zIndex:2, padding:"clamp(16px, 3vw, 24px) clamp(16px, 4vw, 24px)", background:"rgba(10,22,40,0.75)", borderTop:"1px solid rgba(255,255,255,0.07)", flexShrink:0 }}>
        <div style={{ maxWidth:"900px", margin:"0 auto", display:"flex", flexDirection:"column", alignItems:"center", gap:"8px", marginBottom:"12px" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"2px" }}>
            <h2 style={{ fontSize:"22px", fontWeight:"800", color:"#ffffff", letterSpacing:"-0.5px", lineHeight:1, margin:0 }}>SurfCoast</h2>
            <span style={{ fontSize:"9px", fontWeight:"700", letterSpacing:"3px", color:"rgba(255,255,255,0.5)", textTransform:"uppercase", lineHeight:1 }}>MARKETPLACE</span>
          </div>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"12px", textAlign:"center", margin:0 }}>Premium marketplace connecting exceptional professionals with discerning clients.</p>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", alignItems:"center", gap:"clamp(6px, 2vw, 8px)", fontSize:"clamp(11px, 2vw, 13px)", color:"rgba(255,255,255,0.5)" }}>
          <span>© 2026 SurfCoast Marketplace. All rights reserved.</span>
          <span style={{ color:"rgba(255,255,255,0.15)" }}>·</span>
          <a href="/Terms" style={{ color:"rgba(255,255,255,0.55)", textDecoration:"none", transition:"color 0.2s" }}>Terms</a>
          <span style={{ color:"rgba(255,255,255,0.15)" }}>·</span>
          <a href="/PrivacyPolicy" style={{ color:"rgba(255,255,255,0.55)", textDecoration:"none", transition:"color 0.2s" }}>Privacy</a>
          <span style={{ color:"rgba(255,255,255,0.15)" }}>·</span>
          <a href="/MarketDirectory" style={{ color:"rgba(255,255,255,0.55)", textDecoration:"none", transition:"color 0.2s" }}>Markets</a>
        </div>
      </footer>

      <section style={{ position:"relative", zIndex:2, width:"100%", background:"rgba(0,0,0,0.55)", borderTop:"1px solid rgba(255,255,255,0.05)", padding:"6px clamp(16px, 4vw, 24px)", textAlign:"center", flexShrink:0 }} aria-label="Legal disclaimer">
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"clamp(10px, 2vw, 11px)", margin:0, lineHeight:"1.6" }}>SurfCoast Marketplace is a connection platform only. We do not employ contractors and are not responsible for the quality, safety, or legality of services provided. All agreements are between users and contractors directly.</p>
      </section>
    </div>
  );
}