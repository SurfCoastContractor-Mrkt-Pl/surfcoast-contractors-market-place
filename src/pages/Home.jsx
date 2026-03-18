import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import EnhancedHeroSection from '@/components/home/EnhancedHeroSection';
import IndustryCategories from '@/components/home/IndustryCategories';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Clock, Briefcase, ChevronRight, CheckCircle2, XCircle, ShieldCheck, CreditCard, GraduationCap } from 'lucide-react';

// ─── Trust bar ───────────────────────────────────────────────────────────────
function TrustBar() {
  return (
    <div className="bg-slate-800 border-b border-slate-700 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
          {[
            { icon: '✓', text: 'Free to browse all contractors' },
            { icon: '✓', text: 'Sign up for a free 2-week trial' },
            { icon: '✓', text: 'Verified contractors only' },
            { icon: '✓', text: 'Secure payments' },
          ].map(({ icon, text }) => (
            <span key={text} className="flex items-center gap-2 text-sm text-slate-200">
              <span>{icon}</span>
              <span>{text}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Social proof strip ───────────────────────────────────────────────────────
function SocialProof() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Trusted by Thousands</p>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Real people, real reviews, real results</h2>
        <div className="flex flex-wrap justify-center gap-8 mt-8 mb-12">
          {[
            { value: '4.9/5', label: 'Average Rating' },
            { value: '100%', label: 'Verified Profiles' },
            { value: '12 hrs', label: 'Avg Response Time' },
            { value: '2.5K+', label: 'Active Pros' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-extrabold text-slate-800">{value}</div>
              <div className="text-sm text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-left shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">BEFORE SURFCOAST</div>
            <ul className="space-y-3">
              {[
                'Unknown contractors, no verification',
                '3-4 week wait for quotes',
                'Overpriced agencies with no accountability',
                'No recourse if work is bad',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-green-200 p-6 text-left shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-4">WITH SURFCOAST</div>
            <ul className="space-y-3">
              {[
                'Verified, rated professionals',
                'Same-day quotes, often same-day work',
                'Transparent, fair pricing direct from professionals',
                'Dispute resolution, guarantees',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Trade categories ─────────────────────────────────────────────────────────
function TradeCategories() {
  const trades = [
    { label: 'Electricians', value: 'electrician', emoji: '⚡' },
    { label: 'Plumbers', value: 'plumber', emoji: '🔧' },
    { label: 'Carpenters', value: 'carpenter', emoji: '🪵' },
    { label: 'HVAC', value: 'hvac', emoji: '❄️' },
    { label: 'Masons', value: 'mason', emoji: '🧱' },
  ];
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Browse by Trade Specialty</h2>
          <p className="text-slate-500 mt-2">Find certified professionals in specific construction trades</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {trades.map(({ label, value, emoji }) => (
            <Link
              key={value}
              to={`/Contractors?trade=${value}`}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-5 py-2.5 rounded-full transition-colors text-sm"
            >
              <span>{emoji}</span> {label}
            </Link>
          ))}
        </div>
        <div className="text-center">
          <Link to="/Contractors?type=general" className="text-blue-600 hover:underline text-sm font-medium">
            View All Trades →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Contractor join section ──────────────────────────────────────────────────
function ContractorJoinSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 mb-6">
            <Briefcase className="w-4 h-4 text-blue-300" />
            <span className="text-blue-200 text-sm font-medium">For Contractors</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">Join as a Contractor</h2>
          <p className="text-slate-300 text-lg mb-8">
            Create your account to get verified, build your profile, and start getting jobs. Free 2-week trial included.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { icon: <ShieldCheck className="w-4 h-4" />, text: 'Identity verified' },
              { icon: <Star className="w-4 h-4" />, text: 'Build reviews' },
              { icon: <CreditCard className="w-4 h-4" />, text: 'Secure payouts' },
            ].map(({ icon, text }) => (
              <span key={text} className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm px-4 py-2 rounded-full">
                {icon} {text}
              </span>
            ))}
          </div>
          <Link
            to="/ContractorSignup"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-base"
          >
            Create Contractor Account →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Featured contractors ─────────────────────────────────────────────────────
function FeaturedContractors() {
  const { data: contractors = [] } = useQuery({
    queryKey: ['featured-contractors'],
    queryFn: () => base44.entities.Contractor.filter({ is_featured: true, account_locked: false }, '-rating', 6),
    staleTime: 5 * 60 * 1000,
  });

  if (!contractors.length) return null;

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Top-Rated Contractors</h2>
            <p className="text-slate-500 mt-1">Verified professionals ready to work</p>
          </div>
          <Link to="/Contractors" className="text-blue-600 hover:underline text-sm font-medium">
            View All →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contractors.map(c => (
            <Link
              key={c.id}
              to={`/ContractorProfile?id=${c.id}`}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0">
                  {c.photo_url
                    ? <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-lg font-bold text-slate-500">{c.name?.[0]}</div>
                  }
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{c.name}</div>
                  <div className="text-sm text-slate-500 capitalize">{c.trade_specialty || c.contractor_type}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {c.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.location}</span>}
                {c.years_experience && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.years_experience}y exp.</span>}
                {c.rating && <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" />{c.rating.toFixed(1)}</span>}
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/Contractors" className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
            View All Contractors <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Latest jobs ──────────────────────────────────────────────────────────────
function LatestJobs() {
  const { data: jobs = [] } = useQuery({
    queryKey: ['latest-jobs-home'],
    queryFn: () => base44.entities.Job.filter({ status: 'open' }, '-created_date', 3),
    staleTime: 5 * 60 * 1000,
  });

  if (!jobs.length) return null;

  const budgetLabel = (job) => {
    if (job.budget_min && job.budget_max) return `$${job.budget_min.toLocaleString()} - $${job.budget_max.toLocaleString()}`;
    if (job.budget_max) return `Up to $${job.budget_max.toLocaleString()}`;
    return job.budget_type === 'negotiable' ? 'Negotiable' : '';
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">Open Opportunities</p>
            <h2 className="text-2xl font-bold text-slate-900">Latest Job Postings</h2>
          </div>
          <Link to="/Jobs" className="text-blue-600 hover:underline text-sm font-medium">
            View All Jobs →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {jobs.map(job => (
            <Link
              key={job.id}
              to={`/JobDetails?id=${job.id}`}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="font-semibold text-slate-900 mb-1 truncate">{job.title}</div>
              <p className="text-slate-500 text-sm mb-3 line-clamp-2">{job.description}</p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {job.trade_needed && <span className="capitalize bg-slate-100 px-2 py-1 rounded-full">{job.trade_needed}</span>}
                {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
                {budgetLabel(job) && <span className="text-green-700 font-medium">{budgetLabel(job)}</span>}
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center">
          <Link to="/Jobs" className="text-blue-600 hover:underline text-sm font-medium">
            View All Jobs →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Homeschool educators callout ─────────────────────────────────────────────
function HomeschoolCallout() {
  return (
    <section className="py-12 bg-amber-50 border-y border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <GraduationCap className="w-10 h-10 text-amber-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Homeschool Educators Wanted!</h2>
        <p className="text-slate-600 max-w-xl mx-auto mb-5">
          Connect with thousands of U.S. families searching for qualified educators. Set your own curriculum, earn competitive rates, and make a real difference.
        </p>
        <Link
          to="/ContractorSignup"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          Join Now →
        </Link>
      </div>
    </section>
  );
}

// ─── Main Home page ───────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen">
      <TrustBar />
      <EnhancedHeroSection />
      <SocialProof />
      <TradeCategories />
      <IndustryCategories />
      <HomeschoolCallout />
      <FeaturedContractors />
      <LatestJobs />
      <ContractorJoinSection />
    </div>
  );
}