import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Star } from 'lucide-react';
import ContractorCard from '@/components/contractors/ContractorCard';
import LocationSelector from '@/components/location/LocationSelector';
import SavedSearches from '@/components/search/SavedSearches';
import FilterPanel from '@/components/search/FilterPanel';
import { calculateDistance, geocodeLocation } from '@/components/location/geolocationUtils';
import { useUserData } from '@/hooks/useUserData';

export default function FindContractors() {
  const { user } = useUserData();
  const userEmail = user?.email || null;

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tradeFilter, setTradeFilter] = useState('');
  const [lineOfWorkFilter, setLineOfWorkFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [contractorDistances, setContractorDistances] = useState({});
  const [searchRadius, setSearchRadius] = useState(35);

  const { data: contractorData, isLoading, error } = useQuery({
    queryKey: ['all-contractors'],
    queryFn: () => base44.entities.Contractor.filter({ account_locked: false, minor_hours_locked: false }),
    staleTime: 5 * 60 * 1000, // 5 min — contractor list doesn't change by the second
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
    if (contractors) {
      const distances = {};
      await Promise.all(
        contractors.map(async (c) => {
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
              console.error('Distance calc error for', c.location, error);
            }
          }
        })
      );
      setContractorDistances(distances);
    }
  };

  const handleFindClosest = () => {
    setSearchRadius(15);
  };

  const filterContractors = (list) => {
    return list.filter(c => {
      // Search query
      let matchesSearch = true;
      if (searchQuery) {
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
      const matchesType = !typeFilter || c.contractor_type === typeFilter;
      
      // Trade filter
      const matchesTrade = !tradeFilter || c.trade_specialty === tradeFilter;
      
      // Line of work filter
      const matchesLineOfWork = !lineOfWorkFilter || c.line_of_work === lineOfWorkFilter;
      
      // Rating filter
      const matchesRating = !ratingFilter || (c.rating || 0) >= parseInt(ratingFilter);

      // Availability filter
      const matchesAvailability = !availabilityFilter || c.availability_status === availabilityFilter;

      // Location radius filter
      const distance = contractorDistances[c.id];
      const matchesRadius = !userLocation || (distance !== undefined && distance <= searchRadius);

      return matchesSearch && matchesType && matchesTrade && matchesLineOfWork && matchesRating && matchesAvailability && matchesRadius;
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
    setAvailabilityFilter('');
  };

  const hasActiveFilters = searchQuery || typeFilter || tradeFilter || lineOfWorkFilter || ratingFilter || availabilityFilter;

  return (
    <div className="min-h-screen bg-slate-50 pt-0">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-100 to-blue-50 text-slate-900 py-16 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Find Contractors</h1>
          <p className="text-lg text-slate-600 font-light">Discover exceptional talent in your area</p>
        </div>
      </div>

      {/* AEO FAQ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-0">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [{
            "@type": "Question",
            "name": "How do I find a verified worker without using Angi?",
            "acceptedAnswer": { "@type": "Answer", "text": "SurfCoast Marketplace (surfcoastcmp.com) is a nationwide marketplace where everyday people can browse verified workers by trade and location at no cost. Browsing profiles is always free and requires no account. When you are ready to communicate with a specific worker, a session fee of $1.50 per 10 minutes applies, or $50 per month for unlimited messaging. Sending a formal request for proposal (RFP) to a specific worker costs $1.75 per proposal request — the worker responds at no charge. Every profile on SurfCoast shows verified credentials, real client reviews, portfolio photos, and availability." }
          }]
        })}} />
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3" style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}>// FREQUENTLY ASKED</p>
          <h2 className="text-lg font-bold text-slate-900 mb-3">How do I find a verified worker without using Angi?</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            SurfCoast Marketplace (surfcoastcmp.com) is a nationwide marketplace where everyday people can browse verified workers by trade and location at no cost. Browsing profiles is always free and requires no account. When you are ready to communicate with a specific worker, a session fee of $1.50 per 10 minutes applies, or $50 per month for unlimited messaging. Sending a formal request for proposal (RFP) to a specific worker costs $1.75 per proposal request — the worker responds at no charge. Every profile on SurfCoast shows verified credentials, real client reviews, portfolio photos, and availability.
          </p>
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
         </div>

         {/* Filter Panel */}
         <FilterPanel
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          tradeFilter={tradeFilter}
          setTradeFilter={setTradeFilter}
          lineOfWorkFilter={lineOfWorkFilter}
          setLineOfWorkFilter={setLineOfWorkFilter}
          ratingFilter={ratingFilter}
          setRatingFilter={setRatingFilter}
          availabilityFilter={availabilityFilter}
          setAvailabilityFilter={setAvailabilityFilter}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          searchRadius={searchRadius}
          setSearchRadius={setSearchRadius}
          userLocation={userLocation}
         />

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

        {/* Results Summary */}
        <div id="results-section">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-600">
                <Users className="w-5 h-5" />
                <span className="font-medium">
                  {filteredFeatured.length + filteredRegular.length} {filteredFeatured.length + filteredRegular.length === 1 ? 'contractor' : 'contractors'} found
                </span>
              </div>
              {filteredFeatured.length > 0 && (
                <div className="text-sm text-slate-500">
                  ({filteredFeatured.length} featured, {filteredRegular.length} regular)
                </div>
              )}
            </div>
          </div>

          {error ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-red-200">
              <div className="w-12 h-12 text-red-400 mx-auto mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-red-900 mb-2">Unable to load contractors</h3>
              <p className="text-red-700">Please refresh the page and try again.</p>
            </div>
          ) : isLoading ? (
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