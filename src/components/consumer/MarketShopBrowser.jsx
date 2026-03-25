import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Store, ChevronRight, ChevronLeft, X, ShoppingBag } from 'lucide-react';
import MarketListingBrowser from './MarketListingBrowser';

const MARKET_TYPE_LABELS = {
  farmers_market: '🌽 Farmers Market',
  swap_meet: '🏷️ Swap Meet',
  both: '🌽🏷️ Both',
};

const CATEGORY_LABELS = {
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  herbs: 'Herbs',
  dairy: 'Dairy',
  meat: 'Meat',
  baked: 'Baked Goods',
  preserves: 'Preserves',
  crafts: 'Crafts',
  flowers: 'Flowers',
  other: 'Other',
};

export default function MarketShopBrowser({ lockedType = null }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(lockedType || 'all');
  const [selectedShop, setSelectedShop] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: shops = [], isLoading: shopsLoading } = useQuery({
    queryKey: ['active-market-shops-consumer'],
    queryFn: () => base44.entities.MarketShop.filter({ is_active: true, status: 'active' }),
  });

  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['market-listings-consumer', selectedShop?.id],
    queryFn: () =>
      base44.entities.MarketListing.filter({ shop_id: selectedShop.id, status: 'active' }),
    enabled: !!selectedShop,
  });

  const filteredShops = useMemo(() => {
    return shops.filter(shop => {
      const matchesSearch =
        !search ||
        shop.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
        shop.city?.toLowerCase().includes(search.toLowerCase()) ||
        shop.products_summary?.toLowerCase().includes(search.toLowerCase());
      const matchesType =
        typeFilter === 'all' || shop.shop_type === typeFilter || shop.shop_type === 'both';
      return matchesSearch && matchesType;
    });
  }, [shops, search, typeFilter]);

  const filteredListings = useMemo(() => {
    if (categoryFilter === 'all') return listings;
    return listings.filter(l => l.category === categoryFilter);
  }, [listings, categoryFilter]);

  const listingCategories = useMemo(() => {
    const cats = [...new Set(listings.map(l => l.category).filter(Boolean))];
    return cats;
  }, [listings]);

  // --- Shop Detail View ---
  if (selectedShop) {
    return (
      <div className="space-y-6">
        {/* Back + Shop Header */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => { setSelectedShop(null); setCategoryFilter('all'); }}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            All Shops
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">{selectedShop.shop_name}</h2>
            <p className="text-sm text-slate-500">{selectedShop.city}, {selectedShop.state} · {MARKET_TYPE_LABELS[selectedShop.shop_type]}</p>
          </div>
        </div>

        {/* Banner */}
        {selectedShop.banner_url && (
          <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-100">
            <img src={selectedShop.banner_url} alt={selectedShop.shop_name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Description */}
        {selectedShop.description && (
          <p className="text-slate-600 text-sm">{selectedShop.description}</p>
        )}

        {/* Category Filter */}
        {listingCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${categoryFilter === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              All
            </button>
            {listingCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${categoryFilter === cat ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>
        )}

        {/* Listings Grid */}
        {listingsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredListings.map(listing => (
              <MarketListingBrowser
                key={listing.id}
                listing={listing}
                shopName={selectedShop.shop_name}
                shopId={selectedShop.id}
              />
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center">
            <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No active listings in this shop right now.</p>
          </Card>
        )}
      </div>
    );
  }

  // --- Shop List View ---
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search shops by name or city..."
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
        {!lockedType && (
          <div className="flex gap-2">
            {['all', 'farmers_market', 'swap_meet'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap ${typeFilter === t ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {t === 'all' ? 'All' : t === 'farmers_market' ? '🌽 Farmers Market' : '🏷️ Swap Meet'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Shops Grid */}
      {shopsLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filteredShops.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShops.map(shop => (
            <button
              key={shop.id}
              onClick={() => setSelectedShop(shop)}
              className="text-left bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all group"
            >
              {shop.banner_url ? (
                <div className="h-32 bg-slate-100 overflow-hidden">
                  <img src={shop.banner_url} alt={shop.shop_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <Store className="w-10 h-10 text-slate-400" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{shop.shop_name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{shop.city}, {shop.state}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5 group-hover:text-blue-500 transition-colors" />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    {MARKET_TYPE_LABELS[shop.shop_type]}
                  </Badge>
                  {shop.average_rating > 0 && (
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
                      ⭐ {shop.average_rating.toFixed(1)}
                    </Badge>
                  )}
                </div>
                {shop.products_summary && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{shop.products_summary}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <Store className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No shops found. Try adjusting your filters.</p>
        </Card>
      )}
    </div>
  );
}