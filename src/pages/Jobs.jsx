import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData, useUserProfiles } from '@/hooks/useUserData';
import { Card } from '@/components/ui/card';
import { createPageUrl } from '@/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Briefcase, X, Plus, MapPin } from 'lucide-react';
import JobCard from '@/components/jobs/JobCard';
import LocationSelector from '@/components/location/LocationSelector';
import { calculateDistance, geocodeLocation } from '@/components/location/geolocationUtils';

// Theme configuration matching Home page
const T = {
  bg: "#EBEBEC",
  card: "#fff",
  dark: "#1A1A1B",
  sub: "#1A1A1B",
  muted: "#333",
  border: "#D0D0D2",
  orange: "#FF8C00",
  orangeBg: "#FFF5E6",
  orangeTint: "#FFE8CC",
  peachy: "#FFA341",
  orangeBorder: "#FFB366",
  amber: "#FF8C00",
  shadow: "3px 3px 0px #FF8C00",
  goldGlow: "3px 3px 0px #FF8C00, 0 0 18px 4px rgba(255, 140, 0, 0.35)",
  goldGlowSm: "0 0 14px 3px rgba(255, 140, 0, 0.3)",
};

const cardStyle = {
  background: T.card,
  border: `0.5px solid ${T.border}`,
  borderRadius: 10,
  boxShadow: T.shadow,
  transition: "box-shadow 0.2s ease",
};

const hoverGlow = {
  onMouseEnter: (e) => { e.currentTarget.style.boxShadow = T.goldGlow; },
  onMouseLeave: (e) => { e.currentTarget.style.boxShadow = T.shadow; },
};

const hoverGlowSm = {
  onMouseEnter: (e) => { e.currentTarget.style.boxShadow = T.goldGlowSm; },
  onMouseLeave: (e) => { e.currentTarget.style.boxShadow = "none"; },
};

const mono = { fontFamily: "monospace", fontWeight: 700, fontStyle: "italic" };

const trades = [
  { id: 'electrician', name: 'Electrician' },
  { id: 'plumber', name: 'Plumber' },
  { id: 'carpenter', name: 'Carpenter' },
  { id: 'hvac', name: 'HVAC Technician' },
  { id: 'mason', name: 'Mason' },
  { id: 'roofer', name: 'Roofer' },
  { id: 'painter', name: 'Painter' },
  { id: 'welder', name: 'Welder' },
  { id: 'tiler', name: 'Tiler' },
  { id: 'landscaper', name: 'Landscaper' },
  { id: 'other', name: 'Other' },
];

export default function Jobs() {
  const navigate = useNavigate();
  const { user } = useUserData();
  const userEmail = user?.email || null;
  const { isContractor } = useUserProfiles(userEmail);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tradeFilter, setTradeFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [jobDistances, setJobDistances] = useState({});
  const [searchRadius, setSearchRadius] = useState(35);
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState('');
  const [activeTradeFilter, setActiveTradeFilter] = useState('');
  const [activeUrgencyFilter, setActiveUrgencyFilter] = useState('');

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs', 'open'],
    queryFn: () => base44.entities.Job.filter({ status: 'open' }, '-created_date'),
    staleTime: 3 * 60 * 1000, // 3 min — jobs are more dynamic but don't need instant refresh
  });



  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter(job => {

      // Fuzzy matching - includes query in title, location, or description
      let matchesSearch = !activeSearchQuery;
      if (activeSearchQuery && !matchesSearch) {
        const query = activeSearchQuery.toLowerCase();
        const searchFields = [
          job.title?.toLowerCase() || '',
          job.location?.toLowerCase() || '',
          job.description?.toLowerCase() || ''
        ].join(' ');
        matchesSearch = searchFields.includes(query);
      }
      
      const matchesType = !activeTypeFilter || 
        activeTypeFilter === 'all' ||
        job.contractor_type_needed === activeTypeFilter;
      
      const matchesTrade = !activeTradeFilter || 
        activeTradeFilter === 'all' ||
        job.trade_needed === activeTradeFilter;
      
      const matchesUrgency = !activeUrgencyFilter || 
        activeUrgencyFilter === 'all' ||
        job.urgency === activeUrgencyFilter;

      // Show jobs with calculated distance OR those still being calculated
      const distance = jobDistances[job.id];
      const matchesRadius = !userLocation || (distance !== undefined && distance <= searchRadius);
      
      return matchesSearch && matchesType && matchesTrade && matchesUrgency && matchesRadius;
    });
  }, [jobs, activeSearchQuery, activeTypeFilter, activeTradeFilter, activeUrgencyFilter, userLocation, jobDistances, searchRadius]);

  const handleLocationChange = async (location) => {
    setUserLocation(location);
    if (jobs) {
      const distances = {};
      await Promise.all(
        jobs.map(async (j) => {
          if (j.location) {
            try {
              const jobCoords = await geocodeLocation(j.location);
              if (jobCoords) {
                const dist = calculateDistance(
                  location.lat,
                  location.lon,
                  jobCoords.lat,
                  jobCoords.lon
                );
                distances[j.id] = dist;
              }
            } catch (error) {
              console.error('Distance calc error for', j.location, error);
            }
          }
        })
      );
      setJobDistances(distances);
    }
  };

  const handleFindClosest = () => {
    setSearchRadius(15);
  };

  const applyFilters = () => {
    const hasAny = searchQuery || typeFilter || tradeFilter || urgencyFilter;
    if (!hasAny && !userLocation) {
      showToast('No filters selected — showing all available jobs.', 'info');
      setActiveSearchQuery('');
      setActiveTypeFilter('');
      setActiveTradeFilter('');
      setActiveUrgencyFilter('');
      return;
    }
    setActiveSearchQuery(searchQuery);
    setActiveTypeFilter(typeFilter);
    setActiveTradeFilter(tradeFilter);
    setActiveUrgencyFilter(urgencyFilter);

    // Compute preview count to show in toast
    const total = jobs?.length ?? 0;
    if (total === 0) {
      showToast('No jobs are currently posted. Check back soon!', 'warn');
      return;
    }
    // Defer toast until after state update settles
    setTimeout(() => {
      // Can't access updated filteredJobs here, so give a helpful hint based on inputs
      if (userLocation) {
        showToast(`Filters applied — showing jobs within ${searchRadius} mi of your location.`, 'success');
      } else {
        showToast('Filters applied — scroll down to see results.', 'success');
      }
    }, 50);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('');
    setTradeFilter('');
    setUrgencyFilter('');
    setActiveSearchQuery('');
    setActiveTypeFilter('');
    setActiveTradeFilter('');
    setActiveUrgencyFilter('');
  };

  const hasActiveFilters = activeSearchQuery || activeTypeFilter || activeTradeFilter || activeUrgencyFilter;
  const [filterToast, setFilterToast] = useState(null);

  const showToast = (msg, type = 'info') => {
    setFilterToast({ msg, type });
    setTimeout(() => setFilterToast(null), 4000);
  };

  const clearOneFilter = (type) => {
    if (type === 'search') { setSearchQuery(''); setActiveSearchQuery(''); }
    if (type === 'type') { setTypeFilter(''); setActiveTypeFilter(''); }
    if (type === 'trade') { setTradeFilter(''); setActiveTradeFilter(''); }
    if (type === 'urgency') { setUrgencyFilter(''); setActiveUrgencyFilter(''); }
  };

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh", background: T.bg }}>
      {/* Header */}
      <div style={{ background: T.bg, padding: "32px 16px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 14, letterSpacing: "0.06em" }}>// BROWSE AVAILABLE JOBS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.75rem)", fontWeight: 800, color: T.dark, marginBottom: 8, fontStyle: "italic" }}>
                Find your next <span style={{ color: T.amber }}>project</span>
              </h1>
              <p style={{ fontSize: 15, color: T.dark, lineHeight: 1.65, fontWeight: 700, fontStyle: "italic" }}>
                {isContractor ? 'Respond to jobs for free. Pay 18% only when the job closes.' : 'Post a job or browse available listings'}
              </p>
            </div>
            {!isContractor && (
              <Link to={createPageUrl('PostJob')} style={{ textDecoration: "none", display: "inline-block" }}>
                <button aria-label="Post a new job" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 6, background: T.orangeBg, border: `1px solid ${T.orangeBorder}`, color: T.orange, fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", ...mono, cursor: "pointer" }}>
                  <Plus className="w-5 h-5" aria-hidden="true" />
                  Post a Job
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
        {/* Location Selector */}
        <div style={{ ...cardStyle, padding: 20, marginBottom: 20 }} {...hoverGlow}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
            <MapPin className="w-5 h-5" style={{ color: T.muted }} aria-hidden="true" />
            <span style={{ fontWeight: 700, color: T.dark, fontSize: 14, fontStyle: "italic" }}>Your Location</span>
          </div>
          <LocationSelector onLocationChange={handleLocationChange} />
          
          {userLocation && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
              <div style={{ padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: T.dark, fontStyle: "italic" }}>
                    Search Radius: <span style={{ color: T.orange, fontFamily: "monospace", fontWeight: 700 }}>{searchRadius} mi</span>
                  </label>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  style={{ width: "100%", accentColor: T.amber }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.muted, marginTop: 8 }}>
                  <span>5 mi</span>
                  <span>100 mi</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div style={{ ...cardStyle, padding: 20, marginBottom: 20 }} {...hoverGlow}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
            <Filter className="w-5 h-5" style={{ color: T.muted }} aria-hidden="true" />
            <span style={{ fontWeight: 700, color: T.dark, fontSize: 14, fontStyle: "italic" }}>Filters</span>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
            {/* Search input */}
            <div style={{ position: "relative" }}>
              <Search className="w-5 h-5" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.muted }} aria-hidden="true" />
              <input
                type="text"
                placeholder="Search jobs..."
                aria-label="Search jobs by title, location, or description"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", paddingLeft: 32, paddingRight: 10, paddingTop: 8, paddingBottom: 8, border: `0.5px solid ${T.border}`, borderRadius: 6, fontSize: 13, color: T.dark, background: "#fafafa" }}
              />
            </div>
            
            {/* Type Filter */}
            <select
              aria-label="Filter by contractor type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ padding: "8px 10px", border: `0.5px solid ${T.border}`, borderRadius: 6, fontSize: 13, color: T.dark, background: "#fafafa", cursor: "pointer" }}
            >
              <option value="">Contractor Type</option>
              <option value="all">All Types</option>
              <option value="trade_specific">Trade Specific</option>
              <option value="general">General Contractor</option>
              <option value="either">Either</option>
            </select>
            
            {/* Trade Filter */}
            <select
              aria-label="Filter by trade specialty"
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
              style={{ padding: "8px 10px", border: `0.5px solid ${T.border}`, borderRadius: 6, fontSize: 13, color: T.dark, background: "#fafafa", cursor: "pointer" }}
            >
              <option value="">Trade Specialty</option>
              <option value="all">All Trades</option>
              {trades.map(trade => (
                <option key={trade.id} value={trade.id}>{trade.name}</option>
              ))}
            </select>
            
            {/* Urgency Filter */}
            <select
              aria-label="Filter by job urgency"
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              style={{ padding: "8px 10px", border: `0.5px solid ${T.border}`, borderRadius: 6, fontSize: 13, color: T.dark, background: "#fafafa", cursor: "pointer" }}
            >
              <option value="">Urgency</option>
              <option value="all">All Urgencies</option>
              <option value="urgent">🔥 Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          {hasActiveFilters && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 12, color: T.muted, fontStyle: "italic" }}>Active filters:</span>
              {activeSearchQuery && (
                <div style={{ display: "inline-flex", alignItems: "center", ...mono, fontSize: 11, background: T.orangeTint, border: `0.5px solid ${T.orangeBorder}`, color: T.orange, borderRadius: 4, padding: "4px 8px" }}>
                  {activeSearchQuery}
                  <button aria-label={`Remove search filter`} onClick={() => clearOneFilter('search')} style={{ background: "none", border: "none", color: T.orange, cursor: "pointer", fontSize: 16, lineHeight: 1, marginLeft: 6, padding: 0 }}>×</button>
                </div>
              )}
              {activeTypeFilter && activeTypeFilter !== 'all' && (
                <div style={{ display: "inline-flex", alignItems: "center", ...mono, fontSize: 11, background: T.orangeTint, border: `0.5px solid ${T.orangeBorder}`, color: T.orange, borderRadius: 4, padding: "4px 8px" }}>
                  {activeTypeFilter}
                  <button aria-label={`Remove type filter`} onClick={() => clearOneFilter('type')} style={{ background: "none", border: "none", color: T.orange, cursor: "pointer", fontSize: 16, lineHeight: 1, marginLeft: 6, padding: 0 }}>×</button>
                </div>
              )}
              {activeTradeFilter && activeTradeFilter !== 'all' && (
                <div style={{ display: "inline-flex", alignItems: "center", ...mono, fontSize: 11, background: T.orangeTint, border: `0.5px solid ${T.orangeBorder}`, color: T.orange, borderRadius: 4, padding: "4px 8px" }}>
                  {trades.find(t => t.id === activeTradeFilter)?.name}
                  <button aria-label={`Remove trade filter`} onClick={() => clearOneFilter('trade')} style={{ background: "none", border: "none", color: T.orange, cursor: "pointer", fontSize: 16, lineHeight: 1, marginLeft: 6, padding: 0 }}>×</button>
                </div>
              )}
              {activeUrgencyFilter && activeUrgencyFilter !== 'all' && (
                <div style={{ display: "inline-flex", alignItems: "center", ...mono, fontSize: 11, background: T.orangeTint, border: `0.5px solid ${T.orangeBorder}`, color: T.orange, borderRadius: 4, padding: "4px 8px" }}>
                  {activeUrgencyFilter}
                  <button aria-label={`Remove urgency filter`} onClick={() => clearOneFilter('urgency')} style={{ background: "none", border: "none", color: T.orange, cursor: "pointer", fontSize: 16, lineHeight: 1, marginLeft: 6, padding: 0 }}>×</button>
                </div>
              )}
              <button onClick={clearFilters} style={{ ...mono, fontSize: 11, background: "transparent", border: "none", color: T.amber, cursor: "pointer", marginLeft: 4 }}>Clear all →</button>
            </div>
          )}
        </div>

        {/* Filter Toast Notification */}
        {filterToast && (
          <div style={{
            marginBottom: 12,
            padding: "12px 18px",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            fontWeight: 700,
            fontStyle: "italic",
            fontFamily: "monospace",
            background: filterToast.type === 'success' ? '#f0fdf4' : filterToast.type === 'warn' ? '#fff7ed' : '#eff6ff',
            border: `1px solid ${filterToast.type === 'success' ? '#86efac' : filterToast.type === 'warn' ? '#fdba74' : '#93c5fd'}`,
            color: filterToast.type === 'success' ? '#166534' : filterToast.type === 'warn' ? '#9a3412' : '#1e40af',
            animation: "fadeIn 0.2s ease",
          }}>
            <span style={{ fontSize: 16 }}>
              {filterToast.type === 'success' ? '✓' : filterToast.type === 'warn' ? '⚠️' : 'ℹ️'}
            </span>
            {filterToast.msg}
            <button onClick={() => setFilterToast(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "inherit", padding: 0, lineHeight: 1 }}>×</button>
          </div>
        )}

        {/* Apply Filters Button */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={applyFilters}
            style={{ width: "100%", padding: "11px 18px", borderRadius: 8, background: T.peachy, color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontStyle: "italic", ...mono, boxShadow: T.shadow, transition: "box-shadow 0.2s ease" }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = T.goldGlow; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = T.shadow; }}
          >
            Apply Filters
          </button>
        </div>

        {/* Results Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
          <Briefcase className="w-5 h-5" style={{ color: T.muted }} aria-hidden="true" />
          <span style={{ fontSize: 14, color: T.dark, fontWeight: 700, fontStyle: "italic" }}>{filteredJobs.length} jobs found</span>
        </div>

        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: 200, background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 10, animation: "pulse 2s infinite" }} />
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {filteredJobs.map(job => (
              <div key={job.id} style={{ position: "relative" }}>
                {userLocation && jobDistances[job.id] !== undefined && (
                  <div aria-label={`Distance: ${jobDistances[job.id].toFixed(1)} miles`} style={{ position: "absolute", top: 12, right: 12, zIndex: 10, background: T.orange, color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, ...mono }}>
                    {jobDistances[job.id].toFixed(1)} mi
                  </div>
                )}
                <JobCard job={job} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px", background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 10, boxShadow: T.shadow }}>
            <Briefcase className="w-12 h-12" style={{ color: "#ccc", margin: "0 auto 16px" }} aria-hidden="true" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: T.dark, marginBottom: 8, fontStyle: "italic" }}>No jobs found</h3>
            <p style={{ fontSize: 13, color: T.muted, marginBottom: 16, fontStyle: "italic" }}>Try adjusting your filters or check back later</p>
            <button onClick={clearFilters} style={{ ...mono, fontSize: 11, background: "transparent", border: `0.5px solid ${T.border}`, borderRadius: 5, padding: "7px 14px", color: T.dark, cursor: "pointer" }}>Clear Filters →</button>
          </div>
        )}
      </div>
    </div>
  );
}