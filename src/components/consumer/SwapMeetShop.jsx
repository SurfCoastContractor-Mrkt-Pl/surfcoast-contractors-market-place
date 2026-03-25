import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, ChevronRight, ChevronLeft, X, Tag } from 'lucide-react';
import MarketListingBrowser from './MarketListingBrowser';

const CATEGORY_LABELS = {
  electronics: '📱 Electronics',
  tools: '🔧 Tools',
  sports_equipment: '⚽ Sports Equipment',
  books_media: '📚 Books & Media',
  home_decor: '🏠 Home Decor',
  clothing_accessories: '👗 Clothing & Accessories',
  collectibles: '🏆 Collectibles',
  handmade_crafts: '🎨 Handmade Crafts',
  vintage_antiques: '🕰️ Vintage & Antiques',
  jewelry: '💍 Jewelry',
  misc: '📦 Misc',
  other: 'Other',
};

export default function SwapMeetShop() {
  const [search, setSearch] = useState('');
  const [selectedShop, setSelectedShop] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['swap-meet-shops'],
    queryFn: () => base44.entities.MarketShop.filter({ is_active: true, status: 'active', shop_type: 'swap_meet' }),
  });

  const { data: bothShops = [] } = useQuery({
    queryKey: ['both-type-shops-sm'],
    queryFn: () => base44.entities.MarketShop.filter({ is_active: true, status: 'active', shop_type: 'both' }),
  });

  const allShops = useMemo(() => [...shops, ...bothShops], [shops, bothShops]);

  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['market-listings-sm', selectedShop?.id],
    queryFn: () => base44.entities.MarketListing.filter({ shop_id: selectedShop.id, status: 'active' }),
    enabled: !!selectedShop,
  });

  const filteredShops = useMemo(() => {
    return allShops.filter(shop =>
      !search ||
      shop.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
      shop.city?.toLowerCase().includes(search.toLowerCase()) ||
      shop.products_summary?.toLowerCase().includes(search.toLowerCase())
    );
  }, [allShops, search]);

  const filteredListings = useMemo(() => {
    if (categoryFilter === 'all') return listings;
    return listings.filter(l => l.category === categoryFilter);
  }, [listings, categoryFilter]);

  const listingCategories = useMemo(() => {
    return [...new Set(listings.map(l => l.category).filter(Boolean))];
  }, [listings]);

  if (selectedShop) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => { setSelectedShop(null); setCategoryFilter('all'); }}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            All Booths
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">{selectedShop.shop_name}</h2>
            <p className="text-sm text-slate-500">{selectedShop.city}, {selectedShop.state} · 🏷️ Swap Meet</p>
          </div>
        </div>

        {selectedShop.banner_url && (
          <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-100">
            <img src={selectedShop.banner_url} alt={selectedShop.shop_name} className="w-full h-full object-cover" />
          </div>
        )}

        {selectedShop.description && (
          <p className="text-slate-600 text-sm">{selectedShop.description}</p>
        )}

        {listingCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${categoryFilter === 'all' ? 'bg-orange-600 text-white border-orange-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              All
            </button>
            {listingCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${categoryFilter === cat ? 'bg-orange-600 text-white border-orange-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>
        )}

        {listingsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredListings.map(listing => (
              <MarketListingBrowser key={listing.id} listing={listing} shopName={selectedShop.shop_name} shopId={selectedShop.id} />
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center">
            <Tag className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No active listings in this booth right now.</p>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-orange-600 to-amber-500 p-6 sm:p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🏷️</span>
          <h2 className="text-2xl sm:text-3xl font-bold">Swap Meet</h2>
        </div>
        <p className="text-orange-100 text-sm sm:text-base max-w-xl">
          Unique finds, vintage treasures, handmade crafts, and great deals from local booths.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search booths by name or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filteredShops.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShops.map(shop => (
            <button
              key={shop.id}
              onClick={() => setSelectedShop(shop)}
              className="text-left bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-orange-300 transition-all group"
            >
              {shop.banner_url ? (
                <div className="h-32 bg-slate-100 overflow-hidden">
                  <img src={shop.banner_url} alt={shop.shop_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center">
                  <span className="text-4xl">🏷️</span>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{shop.shop_name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{shop.city}, {shop.state}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5 group-hover:text-orange-500 transition-colors" />
                </div>
                {shop.average_rating > 0 && (
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-200 mt-2">
                    ⭐ {shop.average_rating.toFixed(1)}
                  </Badge>
                )}
                {shop.products_summary && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{shop.products_summary}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <span className="text-4xl block mb-3">🏷️</span>
          <p className="text-slate-500">No swap meet booths found. Check back soon!</p>
        </Card>
      )}
    </div>
  );
}