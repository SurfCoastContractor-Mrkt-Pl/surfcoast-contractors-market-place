import React, { useState, useCallback } from 'react';
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
import { Star, MapPin, Sliders, Calendar, MessageCircle, ChevronRight, Search, ExternalLink } from 'lucide-react';

const categoryLabels = {
  electronics: 'Electronics', tools: 'Tools', sports_equipment: 'Sports Equipment',
  books_media: 'Books & Media', home_decor: 'Home Decor', clothing_accessories: 'Clothing & Accessories',
  collectibles: 'Collectibles', handmade_crafts: 'Handmade Crafts', vintage_antiques: 'Vintage & Antiques',
  jewelry: 'Jewelry', misc: 'Miscellaneous', other: 'Other', fresh_produce: 'Fresh Produce',
  baked_goods: 'Baked Goods', dairy_eggs: 'Dairy & Eggs', meat_poultry_seafood: 'Meat & Seafood',
  plants_flowers: 'Plants & Flowers', honey_preserves: 'Honey & Preserves', prepared_foods: 'Prepared Foods',
  beverages: 'Beverages', art: 'Art', toys_games: 'Toys & Games', health_wellness: 'Health & Wellness',
};

const shopTypeLabel = (type) => {
  if (type === 'farmers_market') return '🌱 Farmers Market';
  if (type === 'swap_meet') return '🔄 Swap Meet';
  if (type === 'flea_market') return '🛍️ Flea Market';
  return '🏪 Market';
};

const getThisWeekendDates = () => {
  const today = new Date();
  const day = today.getDay();
  const daysUntilSat = day === 6 ? 0 : (6 - day + 7) % 7;
  const sat = new Date(today); sat.setDate(today.getDate() + daysUntilSat);
  const sun = new Date(sat); sun.setDate(sat.getDate() + 1);
  const fmt = (d) => d.toISOString().split('T')[0];
  return [fmt(sat), fmt(sun)];
};

export default function BoothsAndVendorsMap() {
  const [viewMode, setViewMode] = useState('list');
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

  const [googleResults, setGoogleResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchCenter, setSearchCenter] = useState(null);
  const [quickLocation, setQuickLocation] = useState('');

  const { data: dbVendors = [] } = useQuery({
    queryKey: ['activeMarketShops'],
    queryFn: () => base44.entities.MarketShop.filter({ is_active: true }, '-updated_date'),
  });

  const weekendDates = getThisWeekendDates();

  const handleQuickSearch = () => {
    if (!quickLocation.trim()) return;
    const newFilters = { ...filters, location: quickLocation.trim() };
    setFilters(newFilters);
    searchGooglePlaces(newFilters);
  };

  const searchGooglePlaces = useCallback(async (currentFilters) => {
    if (!currentFilters.location) {
      setSearchError('Please enter a location to search.');
      return;
    }
    setIsSearching(true);
    setSearchError('');
    setHasSearched(true);
    try {
      const res = await base44.functions.invoke('searchNearbyMarkets', {
        location: currentFilters.location,
        radiusMiles: currentFilters.radiusMiles || 15,
        marketType: currentFilters.marketType || 'all',
        thisWeekendOnly: currentFilters.thisWeekendOnly || false,
      });
      const data = res.data;
      setGoogleResults(data.results || []);
      if (data.center) setSearchCenter(data.center);
    } catch (err) {
      setSearchError('Could not search for markets. Please try again.');
      setGoogleResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const filteredDbVendors = dbVendors.filter(vendor => {
    if (filters.marketType !== 'all') {
      const t = vendor.shop_type;
      const active = vendor.market_types_active || [];
      if (t !== filters.marketType && t !== 'multiple' && !active.includes(filters.marketType)) return false;
    }
    if (filters.category !== 'all') {
      if (!vendor.categories || !vendor.categories.includes(filters.category)) return false;
    }
    if (filters.minRating > 0 && (vendor.average_rating || 0) < filters.minRating) return false;
    if (filters.availability?.length > 0) {
      if (!filters.availability.includes(vendor.availability_status || 'available')) return false;
    }
    if (filters.thisWeekendOnly) {
      const events = vendor.market_events || [];
      const hasEvent = events.some(e => e.date && weekendDates.some(wd => e.date.includes(wd)));
      const swap = vendor.swap_meet_next_weekend;
      if (!hasEvent && !(swap?.date && weekendDates.some(wd => swap.date.includes(wd)))) return false;
    }
    return true;
  });

  const filteredGoogleResults = googleResults.filter(v =>
    filters.minRating <= 0 || (v.average_rating || 0) >= filters.minRating
  );

  const dbShopNames = new Set(dbVendors.map(v => v.shop_name?.toLowerCase()));
  const uniqueGoogleResults = filteredGoogleResults.filter(g => !dbShopNames.has(g.shop_name?.toLowerCase()));
  const allResults = [...filteredDbVendors, ...uniqueGoogleResults];

  return (
    <div style={{ minHeight: '100vh', background: '#EBEBEC', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex' }}>
      <BookingRequestForm market={bookingVendor} isOpen={bookingOpen} onClose={() => { setBookingOpen(false); setBookingVendor(null); }} />
      <ReviewForm vendor={reviewVendor} isOpen={reviewOpen} onClose={() => { setReviewOpen(false); setReviewVendor(null); }} onSuccess={() => {}} />

      {filterPanelOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setFilterPanelOpen(false)} />}

      <VendorFilterPanel
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters);
          searchGooglePlaces(newFilters);
        }}
        onClose={() => setFilterPanelOpen(false)}
        isOpen={filterPanelOpen}
      />

      <div className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto w-full px-4 py-8">
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', fontWeight: 800, color: '#1A1A1B', margin: 0, fontStyle: 'italic' }}>
                Booths & Vendors
              </h1>
              <Button variant="outline" size="icon" onClick={() => setFilterPanelOpen(!filterPanelOpen)} className="lg:hidden">
                <Sliders className="w-5 h-5" />
              </Button>
            </div>
            <p style={{ color: '#555', fontSize: 14, fontStyle: 'italic' }}>
              Find farmers markets, swap meets & flea markets near you
            </p>
          </div>

          {!filters.location && !hasSearched && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 text-center shadow-sm">
              <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-700 font-semibold mb-1">Search for real markets near you</p>
              <p className="text-sm text-slate-400 mb-4">Enter your city, state or ZIP and click Search to find farmers markets, swap meets & flea markets</p>
              <div className="flex gap-2 max-w-sm mx-auto">
                <input
                  type="text"
                  placeholder="e.g. Hemet, CA or 92543"
                  value={quickLocation}
                  onChange={e => setQuickLocation(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleQuickSearch()}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <Button onClick={handleQuickSearch} disabled={!quickLocation.trim()}>
                  <Search className="w-4 h-4 mr-1" /> Search
                </Button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {['list', 'map'].map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)} style={{
                padding: '8px 16px', borderRadius: 8, fontWeight: 700, border: 'none', cursor: 'pointer',
                background: viewMode === mode ? '#1A1A1B' : '#fff',
                color: viewMode === mode ? '#fff' : '#555',
                fontStyle: 'italic', fontSize: 13,
              }}>
                {mode === 'list' ? '📋 List View' : '🗺️ Map View'}
              </button>
            ))}
          </div>

          {isSearching && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mr-3" />
              <span style={{ color: '#555', fontStyle: 'italic' }}>Searching for markets near {filters.location}...</span>
            </div>
          )}

          {searchError && !isSearching && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 text-sm">{searchError}</div>
          )}

          {!isSearching && viewMode === 'map' ? (
            <div className="relative z-0 h-96 md:h-[600px] rounded-lg overflow-hidden shadow-lg">
              <VendorMap vendors={allResults} selectedFilters={filters} onVendorSelect={setSelectedVendor} center={searchCenter} />
            </div>
          ) : !isSearching && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allResults.length > 0 ? allResults.map(vendor => (
                <VendorCard
                  key={vendor.id || vendor.google_place_id}
                  vendor={vendor}
                  onBook={() => { setBookingVendor(vendor); setBookingOpen(true); }}
                  onReview={() => { setReviewVendor(vendor); setReviewOpen(true); }}
                  categoryLabels={categoryLabels}
                  shopTypeLabel={shopTypeLabel}
                />
              )) : hasSearched ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-slate-500 text-lg font-medium">No markets found near "{filters.location}"</p>
                  <p className="text-slate-400 text-sm mt-1">Try expanding the radius or a different location</p>
                </div>
              ) : null}
            </div>
          )}

          {!isSearching && hasSearched && allResults.length > 0 && (
            <div style={{ marginTop: 24, fontSize: 13, color: '#555', fontStyle: 'italic' }} className="flex flex-wrap gap-3 items-center">
              <span>Found <strong>{allResults.length}</strong> markets</span>
              {filters.location && <span className="text-blue-600">📍 within {filters.radiusMiles || 15} mi of {filters.location}</span>}
              {filters.thisWeekendOnly && <span className="text-amber-700">📅 This weekend</span>}
              {filteredDbVendors.length > 0 && <span className="text-green-700">✓ {filteredDbVendors.length} registered on platform</span>}
              {uniqueGoogleResults.length > 0 && <span className="text-slate-500">+ {uniqueGoogleResults.length} from Google</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VendorCard({ vendor, onBook, onReview, categoryLabels, shopTypeLabel }) {
  const isGoogle = vendor.is_google_result;

  return (
    <div className="h-full">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        {vendor.banner_url && (
          <img src={vendor.banner_url} alt={vendor.shop_name} className="w-full h-40 object-cover" />
        )}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-slate-900 leading-tight">{vendor.shop_name}</h3>
            {isGoogle && <Badge variant="outline" className="text-xs shrink-0 text-slate-500 border-slate-300">Google</Badge>}
          </div>

          <div className="flex items-center gap-1 text-sm text-slate-500 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>{vendor.full_address || `${vendor.city || ''}, ${vendor.state || ''}`}</span>
          </div>

          {vendor.average_rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{vendor.average_rating.toFixed(1)}</span>
              {vendor.total_ratings > 0 && <span className="text-xs text-slate-400">({vendor.total_ratings.toLocaleString()})</span>}
            </div>
          )}

          <div className="flex flex-wrap gap-1 mb-3">
            <Badge variant="secondary" className="text-xs">{shopTypeLabel(vendor.shop_type)}</Badge>
            {vendor.verified_vendor && <Badge className="text-xs bg-green-100 text-green-800">✓ Verified</Badge>}
          </div>

          {vendor.description && !isGoogle && (
            <p className="text-sm text-slate-500 line-clamp-2 mb-3">{vendor.description}</p>
          )}

          {vendor.categories?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {vendor.categories.slice(0, 3).map(cat => (
                <Badge key={cat} variant="outline" className="text-xs">{categoryLabels[cat] || cat}</Badge>
              ))}
              {vendor.categories.length > 3 && <Badge variant="outline" className="text-xs">+{vendor.categories.length - 3}</Badge>}
            </div>
          )}

          <div className="mt-auto pt-3">
            {isGoogle ? (
              <a
                href={`https://www.google.com/maps/place/?q=place_id:${vendor.google_place_id}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
              >
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> View on Google Maps
                </Button>
              </a>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <Link to={`/vendor/${vendor.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <ChevronRight className="w-4 h-4 mr-1" /> View
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={onReview}>
                  <MessageCircle className="w-4 h-4 mr-1" /> Review
                </Button>
                <Button size="sm" onClick={onBook}>
                  <Calendar className="w-4 h-4 mr-1" /> Book
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}