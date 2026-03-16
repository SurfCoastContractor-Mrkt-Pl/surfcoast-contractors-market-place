import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
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

export default function Jobs() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(null);
  const [isContractor, setIsContractor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tradeFilter, setTradeFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [jobDistances, setJobDistances] = useState({});
  const [searchRadius, setSearchRadius] = useState(35);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState('');
  const [activeTradeFilter, setActiveTradeFilter] = useState('');
  const [activeUrgencyFilter, setActiveUrgencyFilter] = useState('');

  // Check if user is a contractor
  useEffect(() => {
    const checkUserType = async () => {
      const user = await base44.auth.me();
      if (user) {
        setUserEmail(user.email);
        const contractors = await base44.entities.Contractor.filter({ email: user.email });
        setIsContractor(contractors && contractors.length > 0);
      } else {
        setIsContractor(false);
      }
    };
    checkUserType();
  }, []);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.filter({ status: 'open' }, '-created_date'),
  });

  // Fetch all work_scheduled payments to know which job IDs are closed
  const { data: scheduledPayments } = useQuery({
    queryKey: ['scheduled-payments'],
    queryFn: () => base44.entities.Payment.filter({ status: 'work_scheduled' }),
  });

  const scheduledJobIds = useMemo(() => {
    if (!scheduledPayments) return new Set();
    return new Set(scheduledPayments.map(p => p.contractor_id).filter(Boolean));
  }, [scheduledPayments]);

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    // Exclude jobs that have been marked as work scheduled
    
    return jobs.filter(job => {
      if (scheduledJobIds.has(job.id)) return false;

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
      const matchesRadius = !userLocation || (distance === undefined || distance <= searchRadius);
      
      return matchesSearch && matchesType && matchesTrade && matchesUrgency && matchesRadius;
    });
  }, [jobs, scheduledJobIds, activeSearchQuery, activeTypeFilter, activeTradeFilter, activeUrgencyFilter, userLocation, jobDistances, searchRadius]);

  const handleLocationChange = async (location) => {
    setUserLocation(location);
    setIsSearching(false); // Clear search flag when location changes
    if (jobs) {
      const distances = {};
      for (const j of jobs) {
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
            } else {
              distances[j.id] = 999;
            }
          } catch (error) {
            console.error('Distance calc error for', j.location, error);
            distances[j.id] = 999;
          }
        }
      }
      setJobDistances(distances);
    }
  };

  const handleFindClosest = () => {
    setSearchRadius(15);
    setIsSearching(true);
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

  if (isContractor === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-100 to-blue-50 text-slate-900 py-16 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Job Listings</h1>
              <p className="text-lg text-slate-600">
               {isContractor ? 'Find your next construction project' : 'Post a job or browse listings'}
              </p>
            </div>
            {!isContractor && (
              <Link to={createPageUrl('PostJob')}>
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                  <Plus className="w-5 h-5 mr-2" />
                  Post a Job
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Location Selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-slate-700">Your Location</span>
          </div>
          <LocationSelector onLocationChange={handleLocationChange} />
          
          {userLocation && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-slate-700">
                    Search Radius: <span className="text-amber-600 font-semibold">{searchRadius} miles</span>
                  </label>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>5 mi</span>
                  <span>100 mi</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-slate-700">Filters</span>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Contractor Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="trade_specific">Trade Specific</SelectItem>
                <SelectItem value="general">General Contractor</SelectItem>
                <SelectItem value="either">Either</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={tradeFilter} onValueChange={setTradeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trade Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trades</SelectItem>
                {trades.map(trade => (
                  <SelectItem key={trade.id} value={trade.id}>{trade.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgencies</SelectItem>
                <SelectItem value="urgent">🔥 Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 flex-wrap">
              <span className="text-sm text-slate-500">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </Badge>
              )}
              {typeFilter && typeFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {typeFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setTypeFilter('')} />
                </Badge>
              )}
              {tradeFilter && tradeFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {trades.find(t => t.id === tradeFilter)?.name}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setTradeFilter('')} />
                </Badge>
              )}
              {urgencyFilter && urgencyFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {urgencyFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setUrgencyFilter('')} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-amber-600">
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Enter Button */}
        <div className="mb-8">
          <Button 
            onClick={applyFilters}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg"
          >
            Enter
          </Button>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-slate-600">
            <Briefcase className="w-5 h-5" />
            <span>{filteredJobs.length} jobs found</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredJobs.map(job => (
              <div key={job.id} className="relative">
                {userLocation && jobDistances[job.id] !== undefined && (
                  <div className="absolute top-3 right-3 z-10 bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                    {jobDistances[job.id].toFixed(1)} mi
                  </div>
                )}
                <JobCard job={job} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No jobs found</h3>
            <p className="text-slate-600 mb-4">Try adjusting your filters or check back later</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}