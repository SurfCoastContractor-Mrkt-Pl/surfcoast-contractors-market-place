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

const T = {
  bg: "#1A1A1B",
  card: "#252525",
  dark: "#1A1A1B",
  muted: "#999",
  border: "#404040",
  amber: "#5C3500",
  amberBg: "#F0E0C0",
  amberTint: "#FBF5EC",
  shadow: "3px 3px 0px #5C3500",
};

const mono = { fontFamily: "monospace", fontWeight: 700, fontStyle: "italic" };

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
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: T.dark, borderBottom: `1px solid ${T.border}`, padding: "32px 16px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.1em" }}>// BROWSE JOBS</div>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.75rem)", fontWeight: 800, color: "#fff", lineHeight: 1.12, marginBottom: 8 }}>
            Job Listings
          </h1>
          <p style={{ fontSize: 15, color: T.muted, marginBottom: 24, fontWeight: 700, fontStyle: "italic" }}>
            {isContractor ? 'Find your next construction project' : 'Post a job or browse listings'}
          </p>
          {!isContractor && (
            <Link to={createPageUrl('PostJob')} style={{ textDecoration: "none" }}>
              <Button size="lg" style={{ background: "#5C3500", color: "#fff", borderRadius: 6, padding: "11px 26px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Plus className="w-5 h-5" />
                Post a Job
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* Location Selector */}
        <div style={{ background: T.card, borderRadius: 10, border: `0.5px solid ${T.border}`, boxShadow: T.shadow, padding: "24px", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <MapPin className="w-5 h-5" style={{ color: T.muted }} />
            <span style={{ ...mono, fontSize: 10, color: T.muted, letterSpacing: "0.06em" }}>YOUR LOCATION</span>
          </div>
          <LocationSelector onLocationChange={handleLocationChange} />
          
          {userLocation && (
            <div style={{ marginTop: 24 }}>
              <div style={{ background: "rgba(92, 53, 0, 0.15)", border: `0.5px solid ${T.border}`, borderRadius: 8, padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>
                    Search Radius: <span style={{ color: "#F0A040" }}>{searchRadius} mi</span>
                  </label>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#F0A040" }}
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
        <div style={{ background: T.card, borderRadius: 10, border: `0.5px solid ${T.border}`, boxShadow: T.shadow, padding: "24px", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Filter className="w-5 h-5" style={{ color: T.muted }} />
            <span style={{ ...mono, fontSize: 10, color: T.muted, letterSpacing: "0.06em" }}>FILTERS</span>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 16 }}>
            <div style={{ position: "relative" }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: T.muted }} />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: "rgba(0,0,0,0.3)", border: `0.5px solid ${T.border}`, color: "#fff", paddingLeft: 40, borderRadius: 6, fontSize: 14 }}
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger style={{ background: "rgba(0,0,0,0.3)", border: `0.5px solid ${T.border}`, color: "#fff", borderRadius: 6 }}>
                <SelectValue placeholder="Contractor Type" />
              </SelectTrigger>
              <SelectContent style={{ background: T.card, border: `0.5px solid ${T.border}` }}>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="trade_specific">Trade Specific</SelectItem>
                <SelectItem value="general">General Contractor</SelectItem>
                <SelectItem value="either">Either</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={tradeFilter} onValueChange={setTradeFilter}>
              <SelectTrigger style={{ background: "rgba(0,0,0,0.3)", border: `0.5px solid ${T.border}`, color: "#fff", borderRadius: 6 }}>
                <SelectValue placeholder="Trade Specialty" />
              </SelectTrigger>
              <SelectContent style={{ background: T.card, border: `0.5px solid ${T.border}` }}>
                <SelectItem value="all">All Trades</SelectItem>
                {trades.map(trade => (
                  <SelectItem key={trade.id} value={trade.id}>{trade.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger style={{ background: "rgba(0,0,0,0.3)", border: `0.5px solid ${T.border}`, color: "#fff", borderRadius: 6 }}>
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent style={{ background: T.card, border: `0.5px solid ${T.border}` }}>
                <SelectItem value="all">All Urgencies</SelectItem>
                <SelectItem value="urgent">🔥 Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {hasActiveFilters && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, paddingTop: 16, borderTop: `0.5px solid ${T.border}`, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: T.muted }}>Active filters:</span>
              {searchQuery && (
                <div style={{ ...mono, fontSize: 10, background: "rgba(92, 53, 0, 0.15)", border: `0.5px solid ${T.border}`, color: "#F0A040", borderRadius: 4, padding: "3px 8px", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  Search: {searchQuery}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </div>
              )}
              {typeFilter && typeFilter !== 'all' && (
                <div style={{ ...mono, fontSize: 10, background: "rgba(92, 53, 0, 0.15)", border: `0.5px solid ${T.border}`, color: "#F0A040", borderRadius: 4, padding: "3px 8px", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {typeFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setTypeFilter('')} />
                </div>
              )}
              {tradeFilter && tradeFilter !== 'all' && (
                <div style={{ ...mono, fontSize: 10, background: "rgba(92, 53, 0, 0.15)", border: `0.5px solid ${T.border}`, color: "#F0A040", borderRadius: 4, padding: "3px 8px", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {trades.find(t => t.id === tradeFilter)?.name}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setTradeFilter('')} />
                </div>
              )}
              {urgencyFilter && urgencyFilter !== 'all' && (
                <div style={{ ...mono, fontSize: 10, background: "rgba(92, 53, 0, 0.15)", border: `0.5px solid ${T.border}`, color: "#F0A040", borderRadius: 4, padding: "3px 8px", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {urgencyFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setUrgencyFilter('')} />
                </div>
              )}
              <button onClick={clearFilters} style={{ background: "transparent", border: "none", color: "#F0A040", cursor: "pointer", ...mono, fontSize: 10 }}>
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Apply Filters Button */}
        <div style={{ marginBottom: 32 }}>
          <Button 
            onClick={applyFilters}
            style={{ width: "100%", height: 48, background: "#5C3500", color: "#fff", fontWeight: 700, fontSize: 16, borderRadius: 6, border: "none", cursor: "pointer", ...mono }}
          >
            Apply Filters
          </Button>
        </div>

        {/* Results */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <Briefcase className="w-5 h-5" style={{ color: T.muted }} />
          <span style={{ fontSize: 14, color: T.muted }}>{filteredJobs.length} jobs found</span>
        </div>

        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: 200, background: T.card, borderRadius: 10, border: `0.5px solid ${T.border}`, animation: "pulse 2s" }} />
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {filteredJobs.map(job => (
              <div key={job.id} style={{ position: "relative" }}>
                {userLocation && jobDistances[job.id] !== undefined && (
                  <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10, background: "#F0A040", color: "#1A1A1B", padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, ...mono }}>
                    {jobDistances[job.id].toFixed(1)} mi
                  </div>
                )}
                <JobCard job={job} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "48px 24px", background: T.card, borderRadius: 10, border: `0.5px solid ${T.border}` }}>
            <Briefcase className="w-12 h-12" style={{ color: T.muted, margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>No jobs found</h3>
            <p style={{ fontSize: 14, color: T.muted, marginBottom: 16 }}>Try adjusting your filters or check back later</p>
            <Button variant="outline" onClick={clearFilters} size="sm" style={{ borderColor: T.border, color: "#fff" }}>Clear Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}