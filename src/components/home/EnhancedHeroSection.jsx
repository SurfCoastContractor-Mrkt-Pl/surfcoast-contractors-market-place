import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Search, Briefcase, ChevronRight } from 'lucide-react';

const TRADE_OPTIONS = [
  'Electrician', 'Plumber', 'Carpenter', 'HVAC', 'Painter',
  'Roofer', 'Landscaper', 'Mason', 'Handyman', 'Other'
];

export default function EnhancedHeroSection() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('find'); // 'find' | 'post'
  const [trade, setTrade] = useState('');
  const [location, setLocation] = useState('');

  const handleFind = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (trade) params.set('trade', trade);
    if (location) params.set('location', location);
    navigate(`${createPageUrl('FindContractors')}?${params.toString()}`);
  };

  const handlePost = (e) => {
    e.preventDefault();
    navigate(createPageUrl('QuickJobPost'));
  };

  return (
    <div className="pt-20 pb-16 border-b border-slate-200/50 relative" style={{backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a61a047827463e7cdbc1eb/9f9e7efe6_Capture.PNG)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
      <div className="absolute inset-0" style={{backgroundColor: 'rgba(0, 0, 0, 0.55)'}}></div>
      <div className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Value Proposition */}
          <div>
            <div className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6" style={{backgroundColor: 'white', color: '#1E5A96'}}>
              ✓ Verified & Vetted Professionals
            </div>
            
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              Hire Verified Contractors.<br />
              <span style={{color: '#60A5FA'}}>Direct. No Markups.</span>
            </h1>

            <p className="text-lg text-slate-100 mb-6 font-light leading-relaxed">
              Skip the middlemen. Connect directly with identity-verified professionals — get a full Scope of Work, transparent pricing, and zero hidden fees.
            </p>

            {/* Trust Bar */}
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                '🔒 Identity-Verified Pros',
                '⭐ 4.9 Avg Rating',
                '📋 Scope of Work Guarantee',
                '💳 No Subscription Required',
              ].map(item => (
                <span key={item} className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/15 text-white border border-white/20">
                  {item}
                </span>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="space-y-2.5 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white">Every contractor is identity & license verified</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white">Receive a detailed Scope of Work before any payment</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white">12-hour average response time</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl('FindContractors')}>
                <Button size="lg" className="text-white font-semibold w-full sm:w-auto" style={{backgroundColor: '#1E5A96'}}>
                  Browse Contractors <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl('CustomerSignup')}>
                <Button size="lg" className="font-semibold w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100">
                  Get Free Quotes
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-10 pt-8 border-t border-white/20">
              <p className="text-sm text-white/70 mb-3 font-medium">TRUSTED BY HOMEOWNERS &amp; BUSINESSES</p>
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-2xl font-bold text-white">2,500+</p>
                  <p className="text-sm text-white/70">Verified Professionals</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">$5M+</p>
                  <p className="text-sm text-white/70">Work Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">15K+</p>
                  <p className="text-sm text-white/70">Projects Booked</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Tab Toggle */}
            <div className="grid grid-cols-2 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('find')}
                className={`py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'find' ? 'text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                style={activeTab === 'find' ? {backgroundColor: '#1E5A96'} : {}}
              >
                <Search className="w-4 h-4" /> Find a Pro
              </button>
              <button
                onClick={() => setActiveTab('post')}
                className={`py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'post' ? 'text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                style={activeTab === 'post' ? {backgroundColor: '#1E5A96'} : {}}
              >
                <Briefcase className="w-4 h-4" /> Post a Job
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'find' ? (
                <form onSubmit={handleFind} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">What do you need?</label>
                    <select
                      value={trade}
                      onChange={e => setTrade(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{'--tw-ring-color': '#1E5A96'}}
                    >
                      <option value="">Any trade / profession</option>
                      {TRADE_OPTIONS.map(t => <option key={t} value={t.toLowerCase()}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Your location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. San Diego, CA"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:border-transparent placeholder-slate-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                    style={{backgroundColor: '#1E5A96'}}
                  >
                    Search Free <ChevronRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-xs text-slate-400">Free to browse · No credit card required</p>
                </form>
              ) : (
                <form onSubmit={handlePost} className="space-y-4">
                  <div className="rounded-lg p-4 space-y-3" style={{backgroundColor: 'rgba(30, 90, 150, 0.05)'}}>
                    {['Request quotes — get a Scope of Work & Estimate', 'Compare pricing & reviews side-by-side', 'Hire with confidence — all verified'].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="w-full text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                    style={{backgroundColor: '#1E5A96'}}
                  >
                    Post My Project <ChevronRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-xs text-slate-400">Free to post · Get quotes within 24 hours</p>
                </form>
              )}
            </div>

            {/* Bottom trust strip */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100">
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                <span>🔒 Secure</span>
                <span>✓ Verified Pros</span>
                <span>⭐ 4.9 Avg Rating</span>
              </div>
            </div>

            {/* Signup Options */}
            <div className="px-6 py-5 border-t border-slate-100 space-y-3">
              <p className="text-xs text-slate-500 text-center font-medium">Don't have an account?</p>
              <div className="grid grid-cols-2 gap-2">
                <Link to={createPageUrl('ContractorSignup')}>
                  <Button className="w-full text-sm h-9 font-semibold text-white hover:opacity-90" style={{backgroundColor: '#1E5A96'}}>
                    Join as Contractor →
                  </Button>
                </Link>
                <Link to={createPageUrl('CustomerSignup')}>
                  <Button className="w-full text-sm h-9 font-semibold" variant="outline" style={{color: '#1E5A96', borderColor: '#1E5A96'}}>
                    Find Contractor →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}