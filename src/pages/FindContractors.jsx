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
  const [ratingFilter, setRatingFilter] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [contractorDistances, setContractorDistances] = useState({});
  const [searchRadius, setSearchRadius] = useState(35);
  const [userEmail, setUserEmail] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

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

  const { data: contractors, isLoading } = useQuery({
    queryKey: ['all-contractors'],
    queryFn: () => base44.entities.Contractor.filter({ account_locked: false, minor_hours_locked: false }),
  });

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
            }
          } catch (error) {
            console.error('Distance calc error:', error);
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
      const matchesSearch = !searchQuery ||
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.bio?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = !typeFilter || typeFilter === 'all' || c.contractor_type === typeFilter;
      const matchesTrade = !tradeFilter || tradeFilter === 'all' || c.trade_specialty === tradeFilter;
      const matchesRating = !ratingFilter || (c.rating || 0) >= parseInt(ratingFilter);

      const distance = contractorDistances[c.id];
      const matchesRadius = !userLocation || (distance !== undefined && distance <= searchRadius);

      return matchesSearch && matchesType && matchesTrade && matchesRating && matchesRadius;
    });
  };

  const filteredFeatured = filterContractors(featured);
  const filteredRegular = filterContractors(regular);

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('');
    setTradeFilter('');
    setRatingFilter('');
  };

  const hasActiveFilters = searchQuery || typeFilter || tradeFilter || ratingFilter;

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
                <Button 
                  onClick={() => setIsSearching(true)}
                  className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-slate-900"
                >
                  Search
                </Button>
              </div>
              <Button 
                onClick={handleFindClosest}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Find Closest Contractors (15 mi)
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-slate-700">Filters</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <SelectValue placeholder="Contractor Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="trade_specific">Trade Specific</SelectItem>
                <SelectItem value="general">General Contractor</SelectItem>
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

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Minimum Rating" />
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
                  <ContractorCard contractor={contractor} featured />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Contractors */}
        <div>
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