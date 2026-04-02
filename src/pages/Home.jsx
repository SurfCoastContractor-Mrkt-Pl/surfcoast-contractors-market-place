import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Home as HomeIcon, Wrench, Store, Users } from "lucide-react";
import VendorSearchBar from "@/components/home/VendorSearchBar";
import ContractorLocationSearch from "@/components/home/ContractorLocationSearch";
import CampaignAdBanner from "@/components/home/CampaignAdBanner";
import EarlyAdopterBanner from "@/components/home/EarlyAdopterBanner";
import FeaturedVendors from "@/components/home/FeaturedVendors";
import NewsletterSubscribeModal from "@/components/home/NewsletterSubscribeModal";
import MissionStatement from "@/components/home/MissionStatement";

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
    <div className="w-full">
      <NewsletterSubscribeModal />
      
      <div className="w-full flex flex-col items-center px-3 py-8 md:py-10 md:px-4">

        <section className="text-center mb-6 md:mb-4 max-w-2xl px-4">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-3 md:mb-4 leading-tight">The Trades Marketplace</h2>
          <p className="text-xl md:text-3xl font-bold text-orange-500 mb-4 md:mb-4 leading-snug">No Shortcuts. Just Hard Work.</p>
          <p className="text-sm md:text-base text-white/82 leading-relaxed">Connect with licensed, verified tradespeople across the country — or grow your business and land your next job.</p>
        </section>

        <CampaignAdBanner />
        <EarlyAdopterBanner />

        {/* Mission Statement */}
        <MissionStatement />





        {/* Primary CTA Cards - Find a Pro / Join as a Pro */}
        <section className="flex flex-col md:flex-row items-stretch w-full max-w-4xl gap-4 md:gap-8 justify-center mb-6" aria-label="Primary action cards">
          {/* Left Card - Find a Pro */}
          <article
            onMouseEnter={() => setHoveredCard("customer")}
            onMouseLeave={() => setHoveredCard(null)}
            className={`flex-1 flex flex-col rounded-2xl p-6 md:p-8 backdrop-blur-xl transition-all duration-200 bg-blue-950/50 border border-blue-500/40 ${hoveredCard === "customer" ? "transform -translate-y-0.5 shadow-xl shadow-blue-600/30" : "shadow-md"} overflow-hidden`}
          >
            <HomeIcon size={28} className="mb-3 md:mb-4 text-blue-600" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="text-xl font-bold mb-2 text-white">Find a Pro</h3>
            <p className="text-sm text-white/82 mb-4 leading-relaxed flex-1">Post your project, get competitive quotes, and hire a vetted tradesperson near you.</p>
            <ul className="list-none p-0 mb-4 md:mb-6 flex flex-col gap-1 text-xs text-white/88">
              <li>✓ Verified & licensed pros only</li>
              <li>✓ Free 2-week trial</li>
              <li>✓ Secure payments</li>
            </ul>
            <button 
              onClick={() => navigate('/CustomerSignup')} 
              aria-label="Find a Pro - navigate to customer signup"
              className="w-full px-4 py-3 rounded-lg border-none text-sm font-bold cursor-pointer transition-all bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg mt-auto"
            >
              Find a Pro →
            </button>
          </article>

          {/* Horizontal/Vertical OR Divider */}
          {isMobile ? (
            <div className="flex items-center justify-center w-full">
              <div className="bg-white/12 w-full h-px" />
              <span className="text-white/35 text-xs font-semibold whitespace-nowrap mx-2 md:mx-3">OR</span>
              <div className="bg-white/12 w-full h-px" />
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="bg-white/12 w-px h-24 min-h-24" />
              <span className="text-white/35 text-xs font-semibold whitespace-nowrap mx-2 md:mx-3">OR</span>
              <div className="bg-white/12 w-px h-24 min-h-24" />
            </div>
          )}

          {/* Right Card - Join as a Pro */}
          <article
            onMouseEnter={() => setHoveredCard("contractor")}
            onMouseLeave={() => setHoveredCard(null)}
            className={`flex-1 flex flex-col rounded-2xl p-6 md:p-8 backdrop-blur-xl transition-all duration-200 bg-amber-950/50 border border-orange-500/40 ${hoveredCard === "contractor" ? "transform -translate-y-0.5 shadow-xl shadow-orange-600/30" : "shadow-md"} overflow-hidden`}
          >
            <Wrench size={28} className="mb-3 md:mb-4 text-orange-600" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="text-xl font-bold mb-2 text-white">Join as a Pro</h3>
            <p className="text-sm text-white/82 mb-4 leading-relaxed flex-1">Expand your reach, manage jobs, and get paid — all from one professional platform.</p>
            <ul className="list-none p-0 mb-4 md:mb-6 flex flex-col gap-1 text-xs text-white/88">
              <li>✓ Free 2-week trial</li>
              <li>✓ Get paid securely via Stripe</li>
              <li>✓ Build your reputation</li>
            </ul>
            <button 
              onClick={() => handleSignup('/BecomeContractor')} 
              aria-label="Join as a Pro - navigate to contractor signup"
              className="w-full px-4 py-3 rounded-lg border-none text-sm font-bold cursor-pointer transition-all bg-orange-600 text-white hover:bg-orange-700 hover:shadow-lg mt-auto"
            >
              Join as a Pro →
            </button>
          </article>
        </section>

        {/* Secondary CTA Cards - Market Booth, Vendor, Consumer */}
        <section className="grid grid-cols-1 md:grid-cols-3 items-stretch w-full max-w-4xl gap-3 md:gap-4 justify-center mb-6" aria-label="Secondary action cards">
          {/* Market Booth Card */}
          <article
            onMouseEnter={() => setHoveredCard("booth")}
            onMouseLeave={() => setHoveredCard(null)}
            className={`flex flex-col rounded-xl p-5 md:p-6 backdrop-blur-xl transition-all duration-200 bg-stone-900/50 border border-amber-700/40 ${hoveredCard === "booth" ? "transform -translate-y-0.5 shadow-lg shadow-amber-700/25" : "shadow-md"} overflow-hidden`}
          >
            <Store size={24} className="mb-2 text-amber-700" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="text-base font-bold mb-1 text-white">Welcome to the Marketplace</h3>
            <p className="text-xs text-white/75 mb-3 leading-snug flex-1">Pick Your Market — Select Farmers Market to set up your booth and sell fresh goods.</p>
            <button 
              onClick={() => navigate('/MarketShopSignup?type=farmers_market')} 
              aria-label="Get started as a farmers market vendor"
              className="w-full px-3 py-2 rounded-lg border-none text-xs font-bold cursor-pointer transition-all bg-amber-700 text-white hover:bg-amber-800 hover:shadow-lg"
            >
              Get Started →
            </button>
          </article>

          {/* SwapMeets Card */}
          <article
            onMouseEnter={() => setHoveredCard("swapmeets")}
            onMouseLeave={() => setHoveredCard(null)}
            className={`flex flex-col rounded-xl p-5 md:p-6 backdrop-blur-xl transition-all duration-200 bg-orange-950/50 border border-orange-600/40 ${hoveredCard === "swapmeets" ? "transform -translate-y-0.5 shadow-lg shadow-orange-600/25" : "shadow-md"} overflow-hidden`}
          >
            <ShoppingBag size={24} className="mb-2 text-orange-500" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="text-base font-bold mb-1 text-white">Reserve Your Swap Meet Space</h3>
            <p className="text-xs text-white/75 mb-3 leading-snug flex-1">Secure your booth, list your goods, and start selling to local buyers today.</p>
            <button 
              onClick={() => navigate('/MarketShopSignup?type=swap_meet')} 
              aria-label="Get started as a swap meet vendor"
              className="w-full px-3 py-2 rounded-lg border-none text-xs font-bold cursor-pointer transition-all bg-orange-600 text-white hover:bg-orange-700 hover:shadow-lg"
            >
              Get Started →
            </button>
          </article>

          {/* Consumer Card */}
          <article
            onMouseEnter={() => setHoveredCard("consumer")}
            onMouseLeave={() => setHoveredCard(null)}
            className={`flex flex-col rounded-xl p-5 md:p-6 backdrop-blur-xl transition-all duration-200 bg-green-950/50 border border-green-600/40 ${hoveredCard === "consumer" ? "transform -translate-y-0.5 shadow-lg shadow-green-600/25" : "shadow-md"} overflow-hidden`}
          >
            <Users size={24} className="mb-2 text-green-500" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="text-base font-bold mb-1 text-white">Consumer</h3>
            <p className="text-xs text-white/75 mb-3 leading-snug flex-1">Shop booths and vendors at local farmers markets.</p>
            <button 
              onClick={() => navigate('/ConsumerSignup')} 
              aria-label="Start shopping as a consumer"
              className="w-full px-3 py-2 rounded-lg border-none text-xs font-bold cursor-pointer transition-all bg-green-600 text-white hover:bg-green-700 hover:shadow-lg"
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