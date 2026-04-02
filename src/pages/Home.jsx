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
    <div className="w-full bg-white">
      <NewsletterSubscribeModal />
      
      <div className="w-full flex flex-col items-center px-3 py-8 md:py-10 md:px-4 bg-white">

        <section className="text-center mb-6 md:mb-4 max-w-2xl px-4">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">The Trades Marketplace</h2>
          <p className="text-xl md:text-3xl font-bold text-orange-700 mb-4 md:mb-4 leading-snug">No Shortcuts. Just Hard Work.</p>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">Connect with licensed, verified tradespeople across the country — or grow your business and land your next job.</p>
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
            className={`flex-1 flex flex-col rounded-2xl p-6 md:p-8 transition-all duration-200 bg-white border border-gray-200 ${hoveredCard === "customer" ? "transform -translate-y-0.5 shadow-lg" : "shadow-md"} overflow-hidden`}
          >
            <HomeIcon size={28} className="mb-3 md:mb-4 text-blue-600" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="text-xl font-bold mb-2 text-gray-900">Find a Pro</h3>
            <p className="text-sm text-gray-700 mb-4 leading-relaxed flex-1">Post your project, get competitive quotes, and hire a vetted tradesperson near you.</p>
            <ul className="list-none p-0 mb-4 md:mb-6 flex flex-col gap-1 text-xs text-gray-700">
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
              <div className="bg-gray-300 w-full h-px" />
              <span className="text-gray-600 text-xs font-semibold whitespace-nowrap mx-2 md:mx-3">OR</span>
              <div className="bg-gray-300 w-full h-px" />
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="bg-gray-300 w-px h-24 min-h-24" />
              <span className="text-gray-600 text-xs font-semibold whitespace-nowrap mx-2 md:mx-3">OR</span>
              <div className="bg-gray-300 w-px h-24 min-h-24" />
            </div>
          )}

          {/* Right Card - Join as a Pro */}
          <article
            onMouseEnter={() => setHoveredCard("contractor")}
            onMouseLeave={() => setHoveredCard(null)}
            className={`flex-1 flex flex-col rounded-2xl p-6 md:p-8 transition-all duration-200 bg-white border border-gray-200 ${hoveredCard === "contractor" ? "transform -translate-y-0.5 shadow-lg" : "shadow-md"} overflow-hidden`}
          >
            <Wrench size={28} className="mb-3 md:mb-4 text-orange-600" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="text-xl font-bold mb-2 text-gray-900">Join as a Pro</h3>
            <p className="text-sm text-gray-700 mb-4 leading-relaxed flex-1">Expand your reach, manage jobs, and get paid — all from one professional platform.</p>
            <ul className="list-none p-0 mb-4 md:mb-6 flex flex-col gap-1 text-xs text-gray-700">
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
            className={`flex flex-col rounded-xl p-5 md:p-6 transition-all duration-200 bg-white border border-gray-200 ${hoveredCard === "booth" ? "transform -translate-y-0.5 shadow-lg" : "shadow-md"} overflow-hidden`}
          >
            <Store size={24} className="mb-2 text-amber-700" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="text-base font-bold mb-1 text-gray-900">Welcome to the Marketplace</h3>
            <p className="text-xs text-gray-700 mb-3 leading-snug flex-1">Pick Your Market — Select Farmers Market to set up your booth and sell fresh goods.</p>
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
            className={`flex flex-col rounded-xl p-5 md:p-6 transition-all duration-200 bg-white border border-gray-200 ${hoveredCard === "swapmeets" ? "transform -translate-y-0.5 shadow-lg" : "shadow-md"} overflow-hidden`}
          >
            <ShoppingBag size={24} className="mb-2 text-orange-500" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="text-base font-bold mb-1 text-gray-900">Reserve Your Swap Meet Space</h3>
            <p className="text-xs text-gray-700 mb-3 leading-snug flex-1">Secure your booth, list your goods, and start selling to local buyers today.</p>
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
            className={`flex flex-col rounded-xl p-5 md:p-6 transition-all duration-200 bg-white border border-gray-200 ${hoveredCard === "consumer" ? "transform -translate-y-0.5 shadow-lg" : "shadow-md"} overflow-hidden`}
          >
            <Users size={24} className="mb-2 text-green-500" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="text-base font-bold mb-1 text-gray-900">Consumer</h3>
            <p className="text-xs text-gray-700 mb-3 leading-snug flex-1">Shop booths and vendors at local farmers markets.</p>
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