import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, CheckCircle, ChevronRight, Briefcase, ArrowRight, UserCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { TRADE_BY_SLUG, TRADE_CATEGORIES } from '@/lib/tradeCategories';

// Update document title and meta description dynamically
function useSEOMeta(title, description) {
  useEffect(() => {
    if (title) document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    if (description) meta.setAttribute('content', description);
    return () => { document.title = 'SurfCoast Marketplace'; };
  }, [title, description]);
}

function ContractorCard({ contractor }) {
  return (
    <Link to={`/contractor/${contractor.id}`} className="block group">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-200">
        <div className="flex gap-4 items-start">
          {contractor.photo_url ? (
            <img src={contractor.photo_url} alt={contractor.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <UserCircle className="w-8 h-8 text-blue-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">{contractor.name}</h3>
            {contractor.location && (
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" /> {contractor.location}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2">
              {contractor.rating && (
                <span className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {contractor.rating.toFixed(1)}
                  {contractor.reviews_count ? <span className="text-slate-400 font-normal">({contractor.reviews_count})</span> : null}
                </span>
              )}
              {contractor.completed_jobs_count > 0 && (
                <span className="text-sm text-slate-500">{contractor.completed_jobs_count} jobs</span>
              )}
              {contractor.identity_verified && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            {contractor.bio && (
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">{contractor.bio}</p>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-400 flex-shrink-0 mt-1 transition-colors" />
        </div>
      </div>
    </Link>
  );
}

function EmptyCTA({ trade }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-2xl p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
        <Briefcase className="w-7 h-7 text-blue-600" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Be the First {trade.label} on SurfCoast</h3>
      <p className="text-slate-600 mb-6 max-w-md mx-auto">
        We're growing fast. Create your free contractor profile and start connecting with local clients who are already searching for your trade.
      </p>
      <Link
        to="/BecomeContractor"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
      >
        Create Your Free Profile <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default function TradeLanding() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const trade = TRADE_BY_SLUG[slug];

  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState('');

  useSEOMeta(trade?.title, trade?.metaDescription);

  useEffect(() => {
    if (!trade) return;
    setLoading(true);
    // Fetch contractors matching this trade
    base44.entities.Contractor.filter({
      trade_specialty: trade.tradeKey,
      available: true,
    }).then(results => {
      // Also try line_of_work match for general contractors
      if (trade.tradeKey === 'general') {
        base44.entities.Contractor.filter({ contractor_type: 'general', available: true })
          .then(generals => {
            const seen = new Set(results.map(c => c.id));
            const merged = [...results, ...generals.filter(c => !seen.has(c.id))];
            setContractors(merged.filter(c => !c.is_demo));
            setLoading(false);
          });
      } else {
        setContractors(results.filter(c => !c.is_demo));
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, [trade]);

  const filteredContractors = useMemo(() => {
    if (!locationFilter.trim()) return contractors;
    const q = locationFilter.toLowerCase();
    return contractors.filter(c => c.location?.toLowerCase().includes(q));
  }, [contractors, locationFilter]);

  if (!trade) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Trade Not Found</h1>
          <Link to="/FindContractors" className="text-blue-600 hover:underline">Browse all contractors →</Link>
        </div>
      </div>
    );
  }

  const relatedTrades = TRADE_CATEGORIES.filter(t => trade.relatedTrades?.includes(t.slug));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-blue-200 text-sm mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/FindContractors" className="hover:text-white transition-colors">Find Contractors</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">{trade.label}</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4">{trade.heroHeadline}</h1>
          <p className="text-blue-100 text-lg md:text-xl mb-8 max-w-2xl">{trade.heroSubline}</p>

          {/* Location search */}
          <div className="flex gap-3 max-w-xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by city or area..."
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-slate-400"
              />
            </div>
            {locationFilter && (
              <button
                onClick={() => setLocationFilter('')}
                className="px-4 py-3.5 rounded-xl bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Stats */}
          {!loading && (
            <p className="mt-4 text-blue-200 text-sm">
              {filteredContractors.length > 0
                ? `${filteredContractors.length} ${trade.label.toLowerCase()} available${locationFilter ? ` in "${locationFilter}"` : ''}`
                : contractors.length > 0
                  ? `No ${trade.label.toLowerCase()} found in "${locationFilter}" — try a different area`
                  : `Be the first ${trade.label.toLowerCase()} to join SurfCoast`}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Left: Contractor list */}
          <div className="lg:col-span-2 space-y-8">

            {/* Contractor cards */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                {locationFilter
                  ? `${trade.label} near "${locationFilter}"`
                  : `Available ${trade.label}`}
              </h2>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-1/3" />
                          <div className="h-3 bg-slate-200 rounded w-1/4" />
                          <div className="h-3 bg-slate-200 rounded w-2/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredContractors.length > 0 ? (
                <div className="space-y-3">
                  {filteredContractors.map(c => <ContractorCard key={c.id} contractor={c} />)}
                </div>
              ) : (
                <EmptyCTA trade={trade} />
              )}
            </section>

            {/* About / educational content */}
            <section className="bg-white border border-slate-200 rounded-2xl p-7">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Hiring a {trade.label.replace(/s$/, '')} — What You Need to Know</h2>
              <div className="text-slate-700 leading-relaxed space-y-4">
                {trade.about.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section className="bg-blue-50 border border-blue-100 rounded-2xl p-7">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Top Tips for Hiring a {trade.label.replace(/s$/, '')}</h2>
              <ul className="space-y-3">
                {trade.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">

            {/* CTA card */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6 text-center">
              <h3 className="font-bold text-slate-900 mb-2">Are you a {trade.label.replace(/s$/, '')}?</h3>
              <p className="text-sm text-slate-600 mb-4">Create your free profile and get discovered by local clients looking for your trade.</p>
              <Link
                to="/BecomeContractor"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors w-full justify-center"
              >
                Join Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Post a job card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
              <h3 className="font-bold text-slate-900 mb-2">Need Work Done?</h3>
              <p className="text-sm text-slate-600 mb-4">Post your job and let qualified {trade.label.toLowerCase()} come to you.</p>
              <Link
                to="/PostJob"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors w-full justify-center"
              >
                Post a Job <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* All trades */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900 mb-4">Browse All Trades</h3>
              <div className="space-y-1">
                {TRADE_CATEGORIES.map(t => (
                  <Link
                    key={t.slug}
                    to={`/contractors/${t.slug}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      t.slug === slug
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                    }`}
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Related trades */}
            {relatedTrades.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="font-bold text-slate-900 mb-3">Related Trades</h3>
                <div className="space-y-2">
                  {relatedTrades.map(t => (
                    <Link
                      key={t.slug}
                      to={`/contractors/${t.slug}`}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                    >
                      <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">{t.label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}