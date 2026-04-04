import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, Lock, Briefcase, Users, ArrowRight, CheckCircle2, ShoppingBag, Star, Zap, Shield } from "lucide-react";
import { base44 } from '@/api/base44Client';
import SocialProofStats from '@/components/home/SocialProofStats';

export default function Home() {
  const [spotsRemaining] = useState(77);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full bg-white">

      {/* ==================== HERO ==================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 py-16 lg:py-28 px-4 lg:px-8">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full opacity-40 -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-100 rounded-full opacity-30 translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-orange-100 border border-orange-200">
              <Zap className="w-3.5 h-3.5 text-orange-600" />
              <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">Limited Founding Member Offer</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
              Being a contractor <br />
              <span className="logo-gradient-text">isn't just a job.</span>
            </h1>

            <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-lg">
              It's a mindset built on hard work, ownership, and pride. Join a verified community of tradespeople and grow your business your way.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                to="/BecomeContractor"
                className="px-8 py-4 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 text-center text-lg"
              >
                Join as a Pro
              </Link>
              <Link
                to="/CustomerSignup"
                className="px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-900 font-bold hover:bg-gray-50 hover:border-gray-400 transition-all text-center text-lg"
              >
                Find a Tradesperson
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {["Free to join", "No transaction fees", "Verified platform"].map(t => (
                <div key={t} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Founding Member Card */}
          <div className="bg-white rounded-2xl border-2 border-orange-200 shadow-xl shadow-orange-100 p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Founding Member</p>
                <h3 className="text-xl font-extrabold text-gray-900">1 Year Free Access</h3>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-5">Join our first 100 members and lock in your free year.</p>

            <div className="mb-6">
              <div className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
                <span>{100 - spotsRemaining} of 100 claimed</span>
                <span className="text-orange-600">{spotsRemaining} left</span>
              </div>
              <div className="w-full bg-orange-100 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all"
                  style={{ width: `${((100 - spotsRemaining) / 100) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {[
                "1 year of premium access — free",
                "Verified badge immediately",
                "Community-first support",
                "Never pay per transaction",
              ].map(b => (
                <div key={b} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{b}</span>
                </div>
              ))}
            </div>

            <Link
              to="/BecomeContractor"
              className="w-full block px-6 py-4 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all text-center shadow-md shadow-orange-200"
            >
              Claim My Founding Spot →
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== 14-DAY TRIAL ==================== */}
      <section className="py-16 lg:py-24 px-4 lg:px-8 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-blue-700 bg-blue-100 mb-4 uppercase tracking-wide">
              For Pros
            </span>
            <h2 className="text-3xl lg:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
              Try it free.<br />No pressure. No card.
            </h2>
            <p className="text-gray-600 text-lg mb-10">
              Get full access to find jobs, connect with clients, and build your reputation risk-free.
            </p>

            <div className="space-y-6 mb-10">
              {[
                { num: "1", label: "Create your profile", desc: "Tell us about yourself and your trade" },
                { num: "2", label: "Get discovered", desc: "Clients start seeing your profile immediately" },
                { num: "3", label: "Decide after 14 days", desc: "Subscribe or walk away — your choice" }
              ].map((step) => (
                <div key={step.num} className="flex gap-5">
                  <div className="flex-shrink-0 w-11 h-11 rounded-full bg-orange-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-orange-200">
                    {step.num}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{step.label}</h4>
                    <p className="text-gray-500 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/BecomeContractor"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all shadow-md shadow-orange-200 text-lg"
            >
              Start my free trial <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-100 p-12">
            <span className="text-8xl lg:text-9xl font-extrabold text-orange-600 leading-none mb-4">14</span>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Days completely free</h3>
            <p className="text-gray-500 mb-8 max-w-xs">
              Full access to all pro features. Find jobs, connect with clients, build your reputation.
            </p>
            <Link
              to="/BecomeContractor"
              className="w-full max-w-xs px-8 py-4 rounded-xl font-bold text-white text-center block logo-gradient-bg shadow-lg"
            >
              Start my free trial
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-5">
              <Lock className="w-4 h-4" />
              <span>No credit card required, ever</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== TWO-PATH SPLIT ==================== */}
      <section className="py-16 lg:py-24 px-4 lg:px-8 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 text-center mb-12">Who are you?</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pros */}
            <div className="bg-white rounded-2xl border-2 border-blue-100 p-8 hover:border-blue-300 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <Briefcase className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-3">I'm a Pro</h3>
              <p className="text-gray-600 mb-6">Grow your business with verified clients, secure payments, and real support.</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Find quality jobs from verified clients",
                  "Build reputation with verified reviews",
                  "Get paid securely via Stripe",
                  "Community-first support always",
                ].map(item => (
                  <li key={item} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/BecomeContractor"
                className="w-full block px-6 py-4 rounded-xl border-2 border-blue-600 text-blue-700 font-bold hover:bg-blue-600 hover:text-white transition-all text-center"
              >
                Join as a Pro
              </Link>
            </div>

            {/* Clients */}
            <div className="bg-white rounded-2xl border-2 border-orange-100 p-8 hover:border-orange-300 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors">
                <Users className="w-7 h-7 text-orange-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-3">I need a Pro</h3>
              <p className="text-gray-600 mb-6">Find verified tradespeople you can trust, with transparent pricing and secure payments.</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Access verified, licensed professionals",
                  "Get competitive quotes instantly",
                  "Secure payments and verified reviews",
                  "Peace of mind with professional support",
                ].map(item => (
                  <li key={item} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/CustomerSignup"
                className="w-full block px-6 py-4 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all text-center"
              >
                Find a Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== TOOLS / MORE THAN A DIRECTORY ==================== */}
      <section className="py-16 lg:py-24 px-4 lg:px-8 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">More than a directory</h2>
            <p className="text-gray-500 text-lg">A full ecosystem built for tradespeople and their clients.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: ShoppingBag,
                color: "blue",
                title: "Swap Meet Space",
                desc: "Book your booth and sell goods at local markets. Connect with buyers in your community.",
                link: "/MarketShopSignup?type=swap_meet",
              },
              {
                icon: Briefcase,
                color: "orange",
                title: "Pro Marketplace",
                desc: "Find quality jobs, grow your business, and build your reputation with verified clients.",
                link: "/BecomeContractor",
              },
              {
                icon: Users,
                color: "green",
                title: "Consumer Hub",
                desc: "Find verified pros, get instant quotes, and pay securely with verified reviews.",
                link: "/CustomerSignup",
              },
            ].map(({ icon: Icon, color, title, desc, link }) => (
              <div key={title} className={`bg-white border-2 border-${color}-100 rounded-2xl p-8 hover:border-${color}-300 hover:shadow-xl transition-all group`}>
                <div className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center mb-6 group-hover:bg-${color}-600 transition-colors`}>
                  <Icon className={`w-6 h-6 text-${color}-600 group-hover:text-white transition-colors`} />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">{desc}</p>
                <Link to={link} className={`text-${color}-600 font-bold hover:text-${color}-700 transition-colors flex items-center gap-2`}>
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SOCIAL PROOF ==================== */}
      <SocialProofStats />

      {/* ==================== TRUST BAR ==================== */}
      <section className="py-10 px-4 lg:px-8 bg-orange-600">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Shield, text: "Verified licences only" },
            { icon: CheckCircle2, text: "Secure payments via Stripe" },
            { icon: Star, text: "VBA registered platform" },
            { icon: Users, text: "Community-first always" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 justify-center lg:justify-start">
              <Icon className="w-5 h-5 text-orange-200 flex-shrink-0" />
              <span className="text-sm font-semibold text-white">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-gray-900 py-10 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:flex-row lg:gap-0 lg:items-center lg:justify-between">
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} SurfCoast. All rights reserved.
          </div>
          <div className="flex gap-6">
            {[
              { label: "About", to: "/About" },
              { label: "Privacy", to: "/PrivacyPolicy" },
              { label: "Terms", to: "/Terms" },
              { label: "Pricing", to: "/pricing" },
            ].map(({ label, to }) => (
              <Link key={label} to={to} className="text-sm text-gray-400 hover:text-orange-400 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}