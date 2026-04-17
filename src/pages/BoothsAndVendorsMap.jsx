import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import VendorMap from '@/components/vendor/VendorMap';
import VendorFilterPanel from '@/components/vendor/VendorFilterPanel';
import BookingRequestForm from '@/components/booking/BookingRequestForm';
import ReviewForm from '@/components/reviews/ReviewForm';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Sliders, Calendar, MessageCircle, ChevronRight } from 'lucide-react';

const PRODUCT_CATEGORIES = [
  'electronics', 'tools', 'sports_equipment', 'books_media', 'home_decor',
  'clothing_accessories', 'collectibles', 'handmade_crafts', 'vintage_antiques',
  'jewelry', 'misc', 'other'
];

const categoryLabels = {
  electronics: 'Electronics',
  tools: 'Tools',
  sports_equipment: 'Sports Equipment',
  books_media: 'Books & Media',
  home_decor: 'Home Decor',
  clothing_accessories: 'Clothing & Accessories',
  collectibles: 'Collectibles',
  handmade_crafts: 'Handmade Crafts',
  vintage_antiques: 'Vintage & Antiques',
  jewelry: 'Jewelry',
  misc: 'Miscellaneous',
  other: 'Other'
};

export default function BoothsAndVendorsMap() {
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [bookingVendor, setBookingVendor] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [reviewVendor, setReviewVendor] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [filters, setFilters] = useState({
    marketType: 'all',
    location: '',
    category: 'all',
    minRating: 0,
    availability: [],
    thisWeekendOnly: false,
    radiusMiles: 15,
  });
  const [locationCoords, setLocationCoords] = useState(null);

  // Geocode location when filters change
  useEffect(() => {
    if (!filters.location) {
      setLocationCoords(null);
      return;
    }
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(filters.location)}&key=${apiKey}`)
      .then(r => r.json())
      .then(data => {
        if (data.results && data.results[0]) {
          const { lat, lng } = data.results[0].geometry.location;
          setLocationCoords({ lat, lng });
        } else {
          setLocationCoords(null);
        }
      })
      .catch(() => setLocationCoords(null));
  }, [filters.location]);

  // Haversine distance in miles
  const getDistanceMiles = (lat1, lng1, lat2, lng2) => {
    const R = 3958.8;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  // Get this weekend's Sat+Sun date strings (YYYY-MM-DD)
  const getThisWeekendDates = () => {
    const today = new Date();
    const day = today.getDay(); // 0=Sun,6=Sat
    const daysUntilSat = (6 - day + 7) % 7 || 7;
    const sat = new Date(today); sat.setDate(today.getDate() + (day === 6 ? 0 : daysUntilSat));
    const sun = new Date(sat); sun.setDate(sat.getDate() + 1);
    const fmt = (d) => d.toISOString().split('T')[0];
    return [fmt(sat), fmt(sun)];
  };

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['activeMarketShops'],
    queryFn: async () => {
      const result = await base44.entities.MarketShop.filter(
        { is_active: true },
        '-updated_date'
      );
      return result;
    }
  });

  const weekendDates = getThisWeekendDates();

  const filteredVendors = vendors.filter(vendor => {
    // Market type filter — includes flea_market and multiple
    if (filters.marketType !== 'all') {
      const t = vendor.shop_type;
      const active = vendor.market_types_active || [];
      const match =
        t === filters.marketType ||
        t === 'multiple' ||
        active.includes(filters.marketType);
      if (!match) return false;
    }

    // Distance filter — if we have geocoded coords, filter by radius
    if (locationCoords && vendor.latitude && vendor.longitude) {
      const dist = getDistanceMiles(locationCoords.lat, locationCoords.lng, vendor.latitude, vendor.longitude);
      if (dist > (filters.radiusMiles || 15)) return false;
    } else if (filters.location && !locationCoords) {
      // Fallback to text match while geocoding
      const locationMatch = `${vendor.city}, ${vendor.state} ${vendor.zip}`.toLowerCase()
        .includes(filters.location.toLowerCase());
      if (!locationMatch) return false;
    }

    // Category filter
    if (filters.category !== 'all') {
      if (!vendor.categories || !vendor.categories.includes(filters.category)) return false;
    }

    // Rating filter
    if (filters.minRating > 0) {
      if ((vendor.average_rating || 0) < filters.minRating) return false;
    }

    // Availability filter
    if (filters.availability && filters.availability.length > 0) {
      const status = vendor.availability_status || 'available';
      if (!filters.availability.includes(status)) return false;
    }

    // This weekend filter — vendor must have a market_event on Sat or Sun
    if (filters.thisWeekendOnly) {
      const events = vendor.market_events || [];
      const hasWeekendEvent = events.some(e => {
        if (!e.date) return false;
        return weekendDates.some(wd => e.date.includes(wd));
      });
      // Also check swap_meet_next_weekend
      const swapWeekend = vendor.swap_meet_next_weekend;
      const swapHasWeekend = swapWeekend?.date && weekendDates.some(wd => swapWeekend.date.includes(wd));
      if (!hasWeekendEvent && !swapHasWeekend) return false;
    }

    return true;
  });

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
    shadow: "3px 3px 0px #5C3500",
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif", display: "flex" }}>
      {/* Booking Modal */}
      <BookingRequestForm
        market={bookingVendor}
        isOpen={bookingOpen}
        onClose={() => {
          setBookingOpen(false);
          setBookingVendor(null);
        }}
      />

      {/* Review Modal */}
      <ReviewForm
        vendor={reviewVendor}
        isOpen={reviewOpen}
        onClose={() => {
          setReviewOpen(false);
          setReviewVendor(null);
        }}
        onSuccess={() => {
          // Refresh reviews
        }}
      />

      {/* Overlay for mobile filter panel */}
      {filterPanelOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setFilterPanelOpen(false)}
        />
      )}

      {/* Filter Panel */}
      <VendorFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => setFilterPanelOpen(false)}
        isOpen={filterPanelOpen}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto w-full px-4 py-8">
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", fontWeight: 800, color: T.dark, margin: 0, fontStyle: "italic" }}>Booths & Vendors</h1>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFilterPanelOpen(!filterPanelOpen)}
                className="lg:hidden"
              >
                <Sliders className="w-5 h-5" />
              </Button>
            </div>
            <p style={{ color: T.muted, fontSize: 14, fontStyle: "italic" }}>Browse farmers markets and swap meets near you</p>
          </div>

        {/* View Toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <button
            onClick={() => setViewMode('map')}
            style={{ padding: "8px 16px", borderRadius: 8, fontWeight: 700, border: "none", cursor: "pointer", background: viewMode === 'map' ? T.dark : T.card, color: viewMode === 'map' ? "#fff" : T.muted, borderBottom: viewMode === 'map' ? `3px solid ${T.amber}` : "1px solid " + T.border, fontStyle: "italic", fontSize: 13 }}
          >
            🗺️ Map View
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{ padding: "8px 16px", borderRadius: 8, fontWeight: 700, border: "none", cursor: "pointer", background: viewMode === 'list' ? T.dark : T.card, color: viewMode === 'list' ? "#fff" : T.muted, borderBottom: viewMode === 'list' ? `3px solid ${T.amber}` : "1px solid " + T.border, fontStyle: "italic", fontSize: 13 }}
          >
            📋 List View
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 384 }}>
            <div style={{ color: T.muted, fontSize: 14, fontStyle: "italic" }}>Loading vendors...</div>
          </div>
        ) : viewMode === 'map' ? (
          <div className="relative z-0 h-96 md:h-[600px] rounded-lg overflow-hidden shadow-lg">
            <VendorMap
              vendors={filteredVendors}
              selectedFilters={filters}
              onVendorSelect={setSelectedVendor}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.length > 0 ? (
              filteredVendors.map(vendor => (
                <Link to={`/vendor/${vendor.id}`} key={vendor.id}>
                <Card
                   className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                 >
                  {vendor.banner_url && (
                    <img src={vendor.banner_url} alt={vendor.shop_name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 mb-2">{vendor.shop_name}</h3>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      {vendor.city}, {vendor.state}
                    </div>

                    {vendor.average_rating && (
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{vendor.average_rating.toFixed(1)}</span>
                        <span className="text-xs text-slate-500">({vendor.total_ratings || 0})</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {vendor.shop_type === 'farmers_market' ? '🌱 Farmers Market' : vendor.shop_type === 'swap_meet' ? '🔄 Swap Meet' : '🛍️ Both'}
                      </Badge>
                      {vendor.verified_vendor && (
                        <Badge className="text-xs">✓ Verified</Badge>
                      )}
                    </div>

                    {vendor.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">{vendor.description}</p>
                    )}

                    {vendor.categories && vendor.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {vendor.categories.slice(0, 3).map(cat => (
                          <Badge key={cat} variant="outline" className="text-xs">
                            {categoryLabels[cat]}
                          </Badge>
                        ))}
                        {vendor.categories.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{vendor.categories.length - 3}</Badge>
                        )}
                      </div>
                    )}



                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <ChevronRight className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                       onClick={(e) => {
                         e.preventDefault();
                         setReviewVendor(vendor);
                         setReviewOpen(true);
                       }}
                       variant="outline"
                       size="sm"
                      >
                       <MessageCircle className="w-4 h-4 mr-1" />
                       Review
                      </Button>
                      <Button
                       onClick={(e) => {
                         e.preventDefault();
                         setBookingVendor(vendor);
                         setBookingOpen(true);
                       }}
                       size="sm"
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Book
                      </Button>
                    </div>
                    </div>
                    </Card>
                    </Link>
                    ))
                    ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-600">No vendors found matching your filters</p>
              </div>
            )}
          </div>
        )}

        {/* Results Count */}
        <div style={{ marginTop: 24, fontSize: 13, color: T.muted, fontStyle: "italic" }}>
          Showing {filteredVendors.length} of {vendors.length} vendors
          {filters.thisWeekendOnly && (
            <span className="ml-2 text-amber-700 font-medium">📅 This weekend ({weekendDates[0]} – {weekendDates[1]})</span>
          )}
          {filters.location && locationCoords && (
            <span className="ml-2 text-blue-600">📍 within {filters.radiusMiles || 15} mi of {filters.location}</span>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}