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
  shadow: "3px 3px 0px #FF8C00",
};

const cardStyle = {
  background: T.card,
  border: `0.5px solid ${T.border}`,
  borderRadius: 10,
  boxShadow: T.shadow,
  transition: "box-shadow 0.2s ease",
};

const goldGlow = "3px 3px 0px #FF8C00, 0 0 18px 4px rgba(255, 140, 0, 0.35)";
const goldGlowSm = "0 0 14px 3px rgba(255, 140, 0, 0.3)";

const hoverGlow = {
  onMouseEnter: (e) => { e.currentTarget.style.boxShadow = goldGlow; },
  onMouseLeave: (e) => { e.currentTarget.style.boxShadow = T.shadow; },
};

const hoverGlowSm = {
  onMouseEnter: (e) => { e.currentTarget.style.boxShadow = goldGlowSm; },
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
    setActiveSearchQuery(searchQuery);
    setActiveTypeFilter(typeFilter);
    setActiveTradeFilter(tradeFilter);
    setActiveUrgencyFilter(urgencyFilter);
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
                <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 6, background: T.orangeBg, border: `1px solid #FFB366`, color: T.orange, fontWeight: 700, fontSize: 13, ...mono, cursor: "pointer" }}>
                  <Plus className="w-5 h-5" />
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
            <MapPin className="w-5 h-5" style={{ color: T.muted }} />
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
            <Filter className="w-5 h-5" style={{ color: T.muted }} />
            <span style={{ fontWeight: 700, color: T.dark, fontSize: 14, fontStyle: "italic" }}>Filters</span>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
            {/* Search input */}
            <div style={{ position: "relative" }}>
              <Search className="w-4 h-4" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", paddingLeft: 32, paddingRight: 10, paddingTop: 8, paddingBottom: 8, border: `0.5px solid ${T.border}`, borderRadius: 6, fontSize: 13, color: T.dark, background: "#fafafa" }}
              />
            </div>
            
            {/* Type Filter */}
            <select
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
              {searchQuery && (
                <span style={{ display: "inline-block", ...mono, fontSize: 11, background: T.orangeTint, border: `0.5px solid #FFB366`, color: T.orange, borderRadius: 4, padding: "4px 8px" }}>
                  {searchQuery} <span style={{ cursor: "pointer", marginLeft: 4 }} onClick={() => setSearchQuery('')}>×</span>
                </span>
              )}
              {typeFilter && typeFilter !== 'all' && (
                <span style={{ display: "inline-block", ...mono, fontSize: 11, background: T.orangeTint, border: `0.5px solid #FFB366`, color: T.orange, borderRadius: 4, padding: "4px 8px" }}>
                  {typeFilter} <span style={{ cursor: "pointer", marginLeft: 4 }} onClick={() => setTypeFilter('')}>×</span>
                </span>
              )}
              {tradeFilter && tradeFilter !== 'all' && (
                <span style={{ display: "inline-block", ...mono, fontSize: 11, background: T.orangeTint, border: `0.5px solid #FFB366`, color: T.orange, borderRadius: 4, padding: "4px 8px" }}>
                  {trades.find(t => t.id === tradeFilter)?.name} <span style={{ cursor: "pointer", marginLeft: 4 }} onClick={() => setTradeFilter('')}>×</span>
                </span>
              )}
              {urgencyFilter && urgencyFilter !== 'all' && (
                <span style={{ display: "inline-block", ...mono, fontSize: 11, background: T.orangeTint, border: `0.5px solid #FFB366`, color: T.orange, borderRadius: 4, padding: "4px 8px" }}>
                  {urgencyFilter} <span style={{ cursor: "pointer", marginLeft: 4 }} onClick={() => setUrgencyFilter('')}>×</span>
                </span>
              )}
              <button onClick={clearFilters} style={{ ...mono, fontSize: 11, background: "transparent", border: "none", color: T.amber, cursor: "pointer", marginLeft: 4 }}>Clear all →</button>
            </div>
          )}
        </div>

        {/* Apply Filters Button */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={applyFilters}
            style={{ width: "100%", padding: "11px 18px", borderRadius: 8, background: "#FFA341", color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontStyle: "italic", ...mono, boxShadow: "3px 3px 0px #FFA341", transition: "box-shadow 0.2s ease" }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = goldGlow; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = T.shadow; }}
          >
            Apply Filters
          </button>
        </div>

        {/* Results Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
          <Briefcase className="w-5 h-5" style={{ color: T.muted }} />
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
                  <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10, background: T.orange, color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, ...mono }}>
                    {jobDistances[job.id].toFixed(1)} mi
                  </div>
                )}
                <JobCard job={job} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px", background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 10, boxShadow: T.shadow }}>
            <Briefcase className="w-12 h-12" style={{ color: "#ccc", margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: T.dark, marginBottom: 8, fontStyle: "italic" }}>No jobs found</h3>
            <p style={{ fontSize: 13, color: T.muted, marginBottom: 16, fontStyle: "italic" }}>Try adjusting your filters or check back later</p>
            <button onClick={clearFilters} style={{ ...mono, fontSize: 11, background: "transparent", border: `0.5px solid ${T.border}`, borderRadius: 5, padding: "7px 14px", color: T.dark, cursor: "pointer" }}>Clear Filters →</button>
          </div>
        )}
      </div>
    </div>
  );
}