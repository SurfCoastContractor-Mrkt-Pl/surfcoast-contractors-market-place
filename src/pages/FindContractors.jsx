import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { createPageUrl } from '@/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Users, MapPin, Star, X } from 'lucide-react';
import ContractorCard from '@/components/contractors/ContractorCard';
import LocationSelector from '@/components/location/LocationSelector';
import SavedSearches from '@/components/search/SavedSearches';
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

export default function FindContractors() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tradeFilter, setTradeFilter] = useState('');
  const [lineOfWorkFilter, setLineOfWorkFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [contractorDistances, setContractorDistances] = useState({});
  const [searchRadius, setSearchRadius] = useState(35);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setUserEmail(user?.email || null);
      } catch {
        setUserEmail(null);
      }
    };
    loadUser();
  }, []);

  const { data: contractorData, isLoading } = useQuery({
    queryKey: ['all-contractors'],
    queryFn: () => base44.entities.Contractor.filter({ account_locked: false, minor_hours_locked: false }),
  });

  const contractors = contractorData;

  // Separate featured contractors
  const { featured, regular } = useMemo(() => {
    if (!contractors) return { featured: [], regular: [] };
    return {
      featured: contractors.filter(c => c.is_featured && c.available).sort((a, b) => (b.rating || 0) - (a.rating || 0)),
      regular: contractors.filter(c => !c.is_featured).sort((a, b) => (b.rating || 0) - (a.rating || 0)),
    };
  }, [contractors]);

  const handleLocationChange = async (location) => {
    setUserLocation(location);
    setIsSearching(false); // Clear search flag when location changes
    if (contractors) {
      const distances = {};
      for (const c of contractors) {
        if (c.location) {
          try {
            const contractorCoords = await geocodeLocation(c.location);
            if (contractorCoords) {
              const dist = calculateDistance(
                location.lat,
                location.lon,
                contractorCoords.lat,
                contractorCoords.lon
              );
              distances[c.id] = dist;
            } else {
              // If geocoding fails, set a very high distance so contractor still shows but not near top
              distances[c.id] = 999;
            }
          } catch (error) {
            console.error('Distance calc error for', c.location, error);
            distances[c.id] = 999;
          }
        }
      }
      setContractorDistances(distances);
    }
  };

  const handleFindClosest = () => {
    setSearchRadius(15);
    setIsSearching(true);
  };

  const filterContractors = (list) => {
    return list.filter(c => {
      // Search query
      let matchesSearch = !searchQuery;
      if (searchQuery && !matchesSearch) {
        const query = searchQuery.toLowerCase();
        const searchFields = [
          c.name?.toLowerCase() || '',
          c.location?.toLowerCase() || '',
          c.bio?.toLowerCase() || '',
          c.trade_specialty?.toLowerCase() || '',
          c.line_of_work?.toLowerCase() || ''
        ].join(' ');
        matchesSearch = searchFields.includes(query);
      }

      // Type filter
      const matchesType = !typeFilter || typeFilter === 'all' || c.contractor_type === typeFilter;
      
      // Trade filter
      const matchesTrade = !tradeFilter || tradeFilter === 'all' || c.trade_specialty === tradeFilter;
      
      // Line of work filter
      const matchesLineOfWork = !lineOfWorkFilter || lineOfWorkFilter === 'all' || c.line_of_work === lineOfWorkFilter;
      
      // Rating filter
      const matchesRating = !ratingFilter || (c.rating || 0) >= parseInt(ratingFilter);

      // Location radius filter
      const distance = contractorDistances[c.id];
      const matchesRadius = !userLocation || (distance === undefined || distance <= searchRadius);

      return matchesSearch && matchesType && matchesTrade && matchesLineOfWork && matchesRating && matchesRadius;
    });
  };

  const filteredFeatured = filterContractors(featured);
  const filteredRegular = filterContractors(regular);

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('');
    setTradeFilter('');
    setLineOfWorkFilter('');
    setRatingFilter('');
  };

  const hasActiveFilters = searchQuery || typeFilter || tradeFilter || lineOfWorkFilter || ratingFilter;

  return (
    <div className="min-h-screen bg-slate-50 pt-0">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-100 to-blue-50 text-slate-900 py-16 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Find Contractors</h1>
          <p className="text-lg text-slate-600 font-light">Discover exceptional talent in your area</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         {/* Saved Searches */}
         {userEmail && (
           <div className="mb-8">
             <SavedSearches 
               userEmail={userEmail}
               userType="customer"
               onLoadSearch={(search) => {
                 setSearchQuery(search.query || '');
                 if (search.filters) {
                   if (search.filters.trades) setTradeFilter(search.filters.trades[0] || '');
                   if (search.filters.minRating) setRatingFilter(search.filters.minRating?.toString() || '');
                   if (search.filters.radius) setSearchRadius(search.filters.radius);
                 }
               }}
             />
           </div>
         )}

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

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Types</SelectItem>
                <SelectItem value="trade_specific">Trade Specific</SelectItem>
                <SelectItem value="general">General Contractor</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tradeFilter} onValueChange={setTradeFilter} disabled={typeFilter === 'general'}>
              <SelectTrigger>
                <SelectValue placeholder="Trade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Trades</SelectItem>
                {trades.map(trade => (
                  <SelectItem key={trade.id} value={trade.id}>{trade.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={lineOfWorkFilter} onValueChange={setLineOfWorkFilter} disabled={typeFilter === 'trade_specific'}>
              <SelectTrigger>
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Services</SelectItem>
                <SelectItem value="freelance_writer">Freelance Writer</SelectItem>
                <SelectItem value="freelance_designer">Freelance Designer</SelectItem>
                <SelectItem value="freelance_developer">Freelance Developer</SelectItem>
                <SelectItem value="consultant">Consultant</SelectItem>
                <SelectItem value="virtual_assistant">Virtual Assistant</SelectItem>
                <SelectItem value="handyman">Handyman</SelectItem>
                <SelectItem value="appliance_repair">Appliance Repair</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Ratings</SelectItem>
                <SelectItem value="5">⭐⭐⭐⭐⭐ 5.0</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ 4.0+</SelectItem>
                <SelectItem value="3">⭐⭐⭐ 3.0+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 flex-wrap">
              <span className="text-sm text-slate-500">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  {searchQuery}
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
              {ratingFilter && (
                <Badge variant="secondary" className="gap-1">
                  {ratingFilter}+ rating
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setRatingFilter('')} />
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

        {/* Featured Contractors */}
        {filteredFeatured.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h2 className="text-lg font-semibold text-slate-900">Featured Contractors</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeatured.map(contractor => (
                <div key={contractor.id} className="relative">
                  {userLocation && contractorDistances[contractor.id] !== undefined && (
                    <div className="absolute top-3 right-3 z-10 bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                      {contractorDistances[contractor.id].toFixed(1)} mi
                    </div>
                  )}
                  <div className="absolute top-3 left-3 z-10 flex gap-2">
                    {contractor.identity_verified && (
                      <div className="bg-dcfce7 text-166534 border-radius-6 px-2 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-md">
                        ✅ Verified
                      </div>
                    )}
                    {contractor.is_featured && (
                      <div className="bg-fef3c7 text-92400e border-radius-6 px-2 py-1 text-xs font-bold bg-amber-100 text-amber-900 rounded-md">
                        ⭐ Featured
                      </div>
                    )}
                  </div>
                  <ContractorCard contractor={contractor} featured />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Contractors */}
        <div id="results-section">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="w-5 h-5" />
              <span>{filteredRegular.length} contractors found</span>
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-white rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredRegular.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRegular.map(contractor => (
                <div key={contractor.id} className="relative">
                  {userLocation && contractorDistances[contractor.id] !== undefined && (
                    <div className="absolute top-3 right-3 z-10 bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                      {contractorDistances[contractor.id].toFixed(1)} mi
                    </div>
                  )}
                  <div className="absolute top-3 left-3 z-10 flex gap-2">
                    {contractor.identity_verified && (
                      <div className="bg-emerald-100 text-emerald-800 rounded-md px-2 py-1 text-xs font-bold">
                        ✅ Verified
                      </div>
                    )}
                    {contractor.is_featured && (
                      <div className="bg-amber-100 text-amber-900 rounded-md px-2 py-1 text-xs font-bold">
                        ⭐ Featured
                      </div>
                    )}
                  </div>
                  <ContractorCard contractor={contractor} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No contractors found</h3>
              <p className="text-slate-600 mb-4">Try adjusting your filters</p>
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}