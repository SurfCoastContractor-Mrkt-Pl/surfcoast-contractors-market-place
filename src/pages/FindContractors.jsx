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
    queryFn: () => base44.entities.Contractor.filter({ account_locked: false, minor_hours_locked: false, is_demo: false }),
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
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#EBEBEC" }}>
      {/* Ticker */}
      <div style={{ background: "#1A1A1B", padding: "6px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: 11, color: "#e0e0e0" }}>// FIND ENTREPRENEURS · DISCOVER BY TRADE & LOCATION</span>
        <span style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: 11, color: "#ffffff" }}>California · Nationwide</span>
      </div>
      {/* Header */}
      <div style={{ background: "#ECECED", padding: "44px 24px 32px", borderBottom: "1px solid #D0D0D2" }}>
        <div className="max-w-7xl mx-auto">
          <div style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: 11, color: "#333", marginBottom: 10, letterSpacing: "0.06em" }}>// SEARCH THE MARKETPLACE</div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: "#1A1A1B", marginBottom: 8, lineHeight: 1.1 }}>Find Entrepreneurs</h1>
          <p style={{ fontSize: 15, color: "#333", fontStyle: "italic", fontWeight: 700 }}>Discover exceptional specialists in your area</p>
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
        <div style={{ background: "#fff", border: "0.5px solid #D0D0D2", borderRadius: 10, boxShadow: "3px 3px 0px #5C3500", padding: "20px 24px", marginBottom: 20 }}>
          <p style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: 10, color: "#333", marginBottom: 10, letterSpacing: "0.06em" }}>// FREQUENTLY ASKED</p>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1A1A1B", marginBottom: 8 }}>How do I find a verified worker without using Angi?</h2>
          <p style={{ fontSize: 13, color: "#333", lineHeight: 1.65, fontStyle: "italic", fontWeight: 700 }}>
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
         <div style={{ background: "#fff", border: "0.5px solid #D0D0D2", borderRadius: 10, boxShadow: "3px 3px 0px #5C3500", padding: "20px 24px", marginBottom: 20 }}>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5" style={{ color: "#5C3500" }} />
            <span style={{ fontWeight: 700, color: "#1A1A1B", fontStyle: "italic" }}>Your Location</span>
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
              <Star className="w-5 h-5" style={{ color: "#5C3500", fill: "#5C3500" }} />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1A1A1B", fontStyle: "italic" }}>Featured Specialists</h2>
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
                      <div className={`border-radius-6 px-2 py-1 text-xs font-bold rounded-md ${contractor.license_status === 'inactive' ? 'bg-yellow-100 text-yellow-800' : 'bg-emerald-100 text-emerald-800'}`}>
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Users className="w-5 h-5" style={{ color: "#5C3500" }} />
              <span style={{ fontWeight: 700, fontStyle: "italic", color: "#1A1A1B" }}>
                {filteredFeatured.length + filteredRegular.length} {filteredFeatured.length + filteredRegular.length === 1 ? 'entrepreneur' : 'entrepreneurs'} found
              </span>
              {filteredFeatured.length > 0 && (
                <span style={{ fontSize: 12, color: "#333", fontStyle: "italic" }}>
                  ({filteredFeatured.length} featured, {filteredRegular.length} regular)
                </span>
              )}
            </div>
          </div>

          {error ? (
            <div style={{ textAlign: "center", padding: "48px 24px", background: "#fff", borderRadius: 10, border: "0.5px solid #D0D0D2", boxShadow: "3px 3px 0px #5C3500" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1B", marginBottom: 8 }}>Unable to load entrepreneurs</h3>
              <p style={{ color: "#333" }}>Please refresh the page and try again.</p>
            </div>
          ) : isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ height: 240, background: "#fff", borderRadius: 10, border: "0.5px solid #D0D0D2", animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          ) : filteredRegular.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRegular.map(contractor => (
                <div key={contractor.id} className="relative">
                  {userLocation && contractorDistances[contractor.id] !== undefined && (
                    <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded text-xs font-bold" style={{ background: "#F0E0C0", color: "#5C3500", border: "0.5px solid #D9B88A" }}>
                      {contractorDistances[contractor.id].toFixed(1)} mi
                    </div>
                  )}
                  <div className="absolute top-3 left-3 z-10 flex gap-2">
                    {contractor.identity_verified && (
                      <div className={`rounded-md px-2 py-1 text-xs font-bold ${contractor.license_status === 'inactive' ? 'bg-yellow-100 text-yellow-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        ✅ Verified
                      </div>
                    )}
                    {contractor.is_featured && (
                      <div className="rounded-md px-2 py-1 text-xs font-bold" style={{ background: "#F0E0C0", color: "#5C3500" }}>
                        ⭐ Featured
                      </div>
                    )}
                  </div>
                  <ContractorCard contractor={contractor} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 24px", background: "#fff", borderRadius: 10, border: "0.5px solid #D0D0D2", boxShadow: "3px 3px 0px #5C3500" }}>
              <Users className="w-12 h-12 mx-auto mb-4" style={{ color: "#D0D0D2" }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1B", marginBottom: 8 }}>No entrepreneurs found</h3>
              <p style={{ color: "#333", marginBottom: 16 }}>Try adjusting your filters</p>
              <button onClick={clearFilters} style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: 12, background: "transparent", border: "1px solid #D0D0D2", borderRadius: 5, padding: "6px 14px", color: "#1A1A1B", cursor: "pointer" }}>Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}