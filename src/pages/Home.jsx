import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Check, Lock, MapPin, Zap, Briefcase, Users, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [spotsRemaining, setSpotsRemaining] = useState(77);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const trades = ["Plumbing", "Electrical", "Carpentry", "Landscaping", "Concreting", "Painting", "Roofing", "Tiling"];

  return (
    <div className="w-full bg-white">
      {/* ==================== HERO SECTION ==================== */}
      <section className="py-12 lg:py-24 px-4 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column */}
          <div>
            <div className="inline-block mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold text-orange-600 bg-orange-100">
                🚀 Limited Founding Member Offer
              </span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 lg:mb-6 leading-tight">
              Being a contractor <span className="text-orange-600">isn't just a job.</span>
            </h1>

            <p className="text-base text-gray-700 mb-8 leading-relaxed">
              It's a mindset built on hard work, ownership, and pride. Join a community of verified tradespeople and grow your business your way.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/BecomeContractor')}
                className="px-8 py-3 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all"
              >
                Join as a Pro
              </button>
              <button
                onClick={() => navigate('/CustomerSignup')}
                className="px-8 py-3 rounded-lg border-2 border-gray-300 text-gray-900 font-bold hover:bg-gray-50 transition-all"
              >
                Find a Tradesperson
              </button>
            </div>
          </div>

          {/* Right Column - Founding Member Card */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200 p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-8 h-8 text-orange-600 fill-orange-600" />
              <h3 className="text-lg font-bold text-gray-900">Founding Member</h3>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Join our first 100 members and get <span className="font-bold text-gray-900">1 year free</span>
            </p>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${((100 - spotsRemaining) / 100) * 100}%` }}
                />
              </div>
              <p className="text-sm font-bold text-gray-900 mt-2">
                {spotsRemaining} spots remaining
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">1 year of premium access</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">Verified badge immediately</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">Community-first support</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">Never pay per transaction</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/BecomeContractor')}
              className="w-full px-6 py-3 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all"
            >
              Claim My Founding Spot
            </button>
          </div>
        </div>
      </section>

      {/* ==================== MANIFESTO BLOCK ==================== */}
      <section className="py-12 lg:py-24 px-4 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <blockquote className="mb-8">
            <p className="text-2xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Being a contractor <span className="text-orange-600">isn't a job title.</span>
              <br />
              <span className="text-orange-600">It's a mindset.</span>
            </p>
          </blockquote>

          <p className="text-base text-gray-700 leading-relaxed">
            A mindset built on effort, ownership, and pride in doing the job right. At SurfCoast, we believe starting out is tough—and nobody makes it alone. That's why we're here to support you the way you actually need it. No gatekeeping. No one-size-fits-all playbook. Just real support, real people, and real opportunities. Through shared knowledge, accessible work, and a community that respects the grind, we help you take your first step, your next step, and every step toward building something of your own.
          </p>
        </div>
      </section>

      {/* ==================== TWO WEEK TRIAL SECTION ==================== */}
      <section className="py-12 lg:py-24 px-4 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center">
          {/* Left Column */}
          <div>
            <div className="inline-block mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold text-blue-600 bg-blue-100">
                FOR PROS
              </span>
            </div>

            <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4">
              Try it free. No pressure. No card.
            </h2>

            <p className="text-gray-600 text-base mb-8">
              Get full access to find jobs, connect with clients, and build your reputation risk-free.
            </p>

            {/* Numbered Steps */}
            <div className="space-y-6 mb-8">
              {[
                { num: "1", label: "Create your profile", desc: "Tell us about yourself and your trade" },
                { num: "2", label: "Get discovered", desc: "Clients start seeing your profile" },
                { num: "3", label: "Decide after 14 days", desc: "Choose to subscribe or walk away" }
              ].map((step) => (
                <div key={step.num} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">
                    {step.num}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{step.label}</h4>
                    <p className="text-sm text-gray-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/BecomeContractor')}
              className="px-8 py-3 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all"
            >
              Start my free trial
            </button>
          </div>

          {/* Right Column */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6">
              <span className="text-6xl lg:text-8xl font-bold text-orange-600">14</span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Days completely free
            </h3>

            <p className="text-sm text-gray-600 mb-8 max-w-sm">
              Full access to all pro features. Find jobs, connect with clients, and build your reputation.
            </p>

            <button
              onClick={() => navigate('/BecomeContractor')}
              className="w-full max-w-sm px-8 py-3 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all mb-6"
            >
              Start my free trial
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Lock className="w-4 h-4" />
              <span>No credit card required — ever, until you choose to subscribe</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== TWO-PATH SPLIT SECTION ==================== */}
      <section className="py-12 lg:py-24 px-4 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Path - For Pros */}
          <div className="border-b-2 lg:border-b-0 lg:border-r-2 border-gray-300 pb-8 lg:pb-0 lg:pr-8">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-6 h-6 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900">I'm a Pro</h3>
            </div>

            <p className="text-gray-600 text-base mb-6">
              Grow your business with verified clients, secure payments, and real support.
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <span className="text-gray-700">Find quality jobs from verified clients</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <span className="text-gray-700">Build your reputation with verified reviews</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <span className="text-gray-700">Get paid securely via Stripe</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <span className="text-gray-700">Community-first support always</span>
              </li>
            </ul>

            <button
              onClick={() => navigate('/BecomeContractor')}
              className="w-full px-6 py-3 rounded-lg border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition-all"
            >
              Join as a Pro
            </button>
          </div>

          {/* Right Path - For Customers */}
          <div className="pt-8 lg:pt-0 lg:pl-8">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-orange-600" />
              <h3 className="text-2xl font-bold text-gray-900">I need a Pro</h3>
            </div>

            <p className="text-gray-600 text-base mb-6">
              Find verified tradespeople you can trust, with transparent pricing and secure payments.
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                <span className="text-gray-700">Access verified, licensed professionals</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                <span className="text-gray-700">Get competitive quotes instantly</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                <span className="text-gray-700">Secure payments and verified reviews</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                <span className="text-gray-700">Peace of mind with professional support</span>
              </li>
            </ul>

            <button
              onClick={() => navigate('/CustomerSignup')}
              className="w-full px-6 py-3 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all"
            >
              Find a Pro
            </button>
          </div>
        </div>
      </section>

      {/* ==================== SEARCH / NOTIFY ME SECTION ==================== */}
      <section className="py-12 lg:py-24 px-4 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 text-center">
            See what's coming to your area
          </h2>

          {/* Search Bar */}
          <div className="flex flex-col gap-3 mb-8 lg:flex-row lg:gap-2">
            <input
              type="text"
              placeholder="Suburb or postcode..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
            />
            <select className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100">
              <option>Select a trade...</option>
              {trades.map((trade) => (
                <option key={trade} value={trade}>{trade}</option>
              ))}
            </select>
            <button className="px-8 py-3 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all whitespace-nowrap">
              Notify me
            </button>
          </div>

          {/* Trade Pills */}
          <div className="flex flex-wrap gap-3 justify-center">
            {trades.map((trade) => (
              <button
                key={trade}
                className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-sm font-medium hover:bg-orange-50 hover:border-orange-300 transition-all"
              >
                {trade}
              </button>
            ))}
            <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-sm font-medium hover:bg-orange-50 hover:border-orange-300 transition-all">
              + more
            </button>
          </div>
        </div>
      </section>

      {/* ==================== TOOLS SECTION ==================== */}
      <section className="py-12 lg:py-24 px-4 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-12 lg:mb-16 text-center">
            More than a directory
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1 - Swap Meet */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-6">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Swap Meet Space</h3>
              <p className="text-sm text-gray-600 mb-6">
                Book your booth and sell goods at local markets. Connect with buyers in your community.
              </p>
              <a href="#" className="text-orange-600 font-bold hover:text-orange-700 transition-colors flex items-center gap-2">
                Learn more <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Card 2 - Pro Marketplace */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-6">
                <Briefcase className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Pro Marketplace</h3>
              <p className="text-sm text-gray-600 mb-6">
                Find quality jobs, grow your business, and build your reputation with verified clients.
              </p>
              <a href="#" className="text-orange-600 font-bold hover:text-orange-700 transition-colors flex items-center gap-2">
                Learn more <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Card 3 - Consumer Hub */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Consumer Hub</h3>
              <p className="text-sm text-gray-600 mb-6">
                Find verified pros, get instant quotes, and pay securely with verified reviews.
              </p>
              <a href="#" className="text-orange-600 font-bold hover:text-orange-700 transition-colors flex items-center gap-2">
                Learn more <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== TRUST BAR ==================== */}
      <section className="py-8 lg:py-12 px-4 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700">Verified licences only</span>
          </div>
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700">Secure payments via Stripe</span>
          </div>
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700">VBA registered platform</span>
          </div>
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700">Community-first always</span>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-white border-t border-gray-200 py-8 lg:py-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:flex-row lg:gap-0 lg:items-center lg:justify-between">
          <div className="text-sm text-gray-600 mb-4 sm:mb-0">
            © 2026 SurfCoast. All rights reserved.
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-sm text-gray-700 hover:text-orange-600 transition-colors">About</a>
            <a href="#" className="text-sm text-gray-700 hover:text-orange-600 transition-colors">Privacy</a>
            <a href="#" className="text-sm text-gray-700 hover:text-orange-600 transition-colors">Terms</a>
            <a href="#" className="text-sm text-gray-700 hover:text-orange-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper component for ShoppingBag icon
function ShoppingBag(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4l1-12z" />
    </svg>
  );
}