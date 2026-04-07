import React, { useState, useEffect, useMemo } from 'react';
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
    availability: []
  });

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

  const filteredVendors = vendors.filter(vendor => {
    if (filters.marketType !== 'all') {
      const marketMatch = filters.marketType === 'farmers_market'
        ? vendor.shop_type === 'farmers_market' || vendor.shop_type === 'both'
        : vendor.shop_type === 'swap_meet' || vendor.shop_type === 'both';
      if (!marketMatch) return false;
    }

    if (filters.location) {
      const locationMatch = `${vendor.city}, ${vendor.state}`.toLowerCase()
        .includes(filters.location.toLowerCase());
      if (!locationMatch) return false;
    }

    if (filters.category !== 'all') {
      if (!vendor.categories || !vendor.categories.includes(filters.category)) return false;
    }

    if (filters.minRating > 0) {
      if ((vendor.average_rating || 0) < filters.minRating) return false;
    }

    if (filters.availability && filters.availability.length > 0) {
      const status = vendor.availability_status || 'available';
      if (!filters.availability.includes(status)) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex">
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-4xl font-bold text-slate-900">Booths & Vendors</h1>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFilterPanelOpen(!filterPanelOpen)}
                className="lg:hidden"
              >
                <Sliders className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-slate-600">Browse farmers markets and swap meets near you</p>
          </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'map'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            🗺️ Map View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            📋 List View
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-slate-600">Loading vendors...</div>
          </div>
        ) : viewMode === 'map' ? (
          <div className="h-96 md:h-[600px] rounded-lg overflow-hidden shadow-lg">
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
        <div className="mt-6 text-sm text-slate-600">
          Showing {filteredVendors.length} of {vendors.length} vendors
        </div>
        </div>
      </div>
    </div>
  );
}