import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Search, Briefcase, ShieldCheck, Star, ClipboardList, CheckCircle2 } from 'lucide-react';

const TRADES = [
  { value: '', label: 'Any trade / profession' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'plumber', label: 'Plumber' },
  { value: 'carpenter', label: 'Carpenter' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'painter', label: 'Painter' },
  { value: 'roofer', label: 'Roofer' },
  { value: 'landscaper', label: 'Landscaper' },
  { value: 'mason', label: 'Mason' },
  { value: 'handyman', label: 'Handyman' },
  { value: 'other', label: 'Other' },
];

export default function EnhancedHeroSection() {
  const [activeTab, setActiveTab] = useState('find');
  const [trade, setTrade] = useState('');
  const [location, setLocation] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsLoggedIn).catch(() => setIsLoggedIn(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (trade) params.set('trade', trade);
    if (location) params.set('location', location);
    navigate(`/Contractors?${params.toString()}`);
  };

  const handleGuestCTA = (path) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      base44.auth.redirectToLogin(`/${path.replace('/', '')}`);
    }
  };

  return (
    <section
      className="relative min-h-[600px] flex items-center overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(rgba(10,30,60,0.72), rgba(10,30,60,0.72)), url(https://media.base44.com/images/public/69b5d136d5baa9e2c5f01224/ba23d6474_generated_image.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-blue-300" />
              <span className="text-white text-sm font-medium">Verified &amp; Vetted Professionals</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Hire Verified Contractors.<br />
              <span className="text-blue-300">Direct. No Markups.</span>
            </h1>

            <p className="text-white/80 text-lg mb-6 max-w-lg">
              Skip the middlemen. Connect directly with identity-verified professionals — get a full Scope of Work, transparent pricing, and zero hidden fees.
              <span className="block mt-2 text-white/65 text-base">Free to browse · Sign up for a free 2-week trial to connect with contractors</span>
            </p>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'Identity-Verified Pros' },
                { icon: <Star className="w-3.5 h-3.5 text-yellow-400" />, label: '4.9 Avg Rating' },
                { icon: <ClipboardList className="w-3.5 h-3.5" />, label: 'Scope of Work Guarantee' },
              ].map(({ icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  {icon} {label}
                </span>
              ))}
            </div>

            {/* Bullet points */}
            <ul className="space-y-2 mb-8">
              {[
                'Every contractor is identity & license verified',
                'Receive a detailed Scope of Work before any payment',
                '12-hour average response time',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-white/85 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/Contractors"
                className="inline-flex items-center gap-2 bg-white text-slate-900 font-semibold px-6 py-3 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Browse Contractors →
              </Link>
              {isLoggedIn ? (
                <Link
                  to="/Dashboard"
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Go to Dashboard →
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => base44.auth.redirectToLogin()}
                    className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-lg transition-colors border border-white/30"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleGuestCTA('/CustomerSignup')}
                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    Get Free Quotes
                  </button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-10 pt-6 border-t border-white/20">
              {[
                { value: '2,500+', label: 'Verified Professionals' },
                { value: '$5M+', label: 'Work Completed' },
                { value: '15K+', label: 'Projects Booked' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-white/60 text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Search widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
            {/* Tabs */}
            <div className="flex rounded-xl overflow-hidden mb-6 bg-white/10">
              <button
                onClick={() => setActiveTab('find')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${activeTab === 'find' ? 'bg-slate-800 text-white' : 'text-white/70 hover:text-white'}`}
              >
                <Search className="w-4 h-4" /> Find a Pro
              </button>
              <button
                onClick={() => setActiveTab('post')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${activeTab === 'post' ? 'bg-slate-800 text-white' : 'text-white/70 hover:text-white'}`}
              >
                <Briefcase className="w-4 h-4" /> Post a Job
              </button>
            </div>

            {activeTab === 'find' ? (
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-1.5">WHAT DO YOU NEED?</label>
                  <select
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                    className="w-full bg-white text-slate-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {TRADES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-1.5">YOUR LOCATION</label>
                  <input
                    type="text"
                    placeholder="e.g. San Diego, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white text-slate-800 rounded-lg px-3 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Browse Contractors →
                </button>

                {/* Updated subtext */}
                <p className="text-center text-white/60 text-xs">
                  Free to browse · Sign up for a free 2-week trial to connect with contractors
                </p>

                {/* Updated trust bar */}
                <div className="flex justify-center gap-4 text-white/70 text-xs pt-1">
                  <span>🔒 Secure</span>
                  <span>✓ Verified Pros</span>
                  <span>⭐ 4.9 Avg Rating</span>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-white/80 text-sm">Post your job and get quotes from verified contractors in your area.</p>
                <button
                  onClick={() => handleGuestCTA('/PostJob')}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Post a Job →
                </button>
                <p className="text-center text-white/60 text-xs">
                  Free to browse · Sign up for a free 2-week trial to connect with contractors
                </p>
              </div>
            )}

            {/* Bottom CTA row — updated */}
            <div className="mt-5 pt-4 border-t border-white/20">
              <div className="flex gap-3">
                <Link
                  to="/ContractorSignup"
                  className="flex-1 text-center bg-white/15 hover:bg-white/25 border border-white/25 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Join as Contractor →
                </Link>
                <button
                  onClick={() => handleGuestCTA('/CustomerSignup')}
                  className="flex-1 text-center bg-white/15 hover:bg-white/25 border border-white/25 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Find Contractor →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}