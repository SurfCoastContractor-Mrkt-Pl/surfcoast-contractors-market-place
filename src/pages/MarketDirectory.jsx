import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Search, ShoppingBag, MapPin, Star, AlertTriangle, SlidersHorizontal, Store, Leaf, Tag, CheckCircle } from 'lucide-react';

const SHOP_TYPE_LABELS = {
  farmers_market: 'Farmers Market',
  swap_meet: 'Swap Meet',
  both: 'Both',
};

const SHOP_TYPE_COLORS = {
  farmers_market: 'bg-green-100 text-green-700',
  swap_meet: 'bg-purple-100 text-purple-700',
  both: 'bg-blue-100 text-blue-700',
};

const CATEGORIES = [
  'Produce', 'Baked Goods', 'Crafts', 'Clothing',
  'Electronics', 'Collectibles', 'Food & Beverage', 'Health & Wellness', 'Other'
];

function VendorCard({ shop, onClick }) {
  const cats = (shop.categories || []).slice(0, 3);
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-150 text-left p-5 flex flex-col gap-3 w-full"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm leading-tight">{shop.shop_name}</h3>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
              <MapPin className="w-3 h-3" />
              {[shop.city, shop.state].filter(Boolean).join(', ')}
            </div>
          </div>
        </div>
        {shop.shop_type && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${SHOP_TYPE_COLORS[shop.shop_type] || 'bg-slate-100 text-slate-600'}`}>
            {SHOP_TYPE_LABELS[shop.shop_type] || shop.shop_type}
          </span>
        )}
      </div>

      {shop.description && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{shop.description}</p>
      )}

      {cats.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {cats.map(cat => (
            <span key={cat} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{cat}</span>
          ))}
          {(shop.categories || []).length > 3 && (
            <span className="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">+{shop.categories.length - 3} more</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-1 mt-auto">
        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        <span className="text-xs text-slate-500">No reviews yet</span>
      </div>
    </button>
  );
}

export default function MarketDirectory() {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    base44.entities.MarketShop.filter({ is_active: true })
      .then(data => setShops(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return shops.filter(shop => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q || [shop.shop_name, shop.city, shop.state, shop.zip]
        .some(f => f?.toLowerCase().includes(q));
      const matchType = !typeFilter || shop.shop_type === typeFilter;
      const matchCategory = !categoryFilter || (shop.categories || []).includes(categoryFilter);
      return matchSearch && matchType && matchCategory;
    });
  }, [shops, search, typeFilter, categoryFilter]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">Farmers Markets & Swap Meets</h1>
          </div>
          <p className="text-slate-500 text-sm max-w-2xl">
            Browse local vendors near you. All vendors are independently operating — see our disclaimer below.
          </p>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Platform Disclaimer:</span> SurfCoast Marketplace is a connection platform only. We do not employ, endorse, or guarantee any vendor, product, or service. All users — vendors and customers alike — use this platform at their own risk. SurfCoast Marketplace, its administrators, partners, and affiliates are not responsible for any damages, injuries, illness, or death arising from any transaction or interaction. Customers are solely responsible for vetting vendors and making their own informed decisions.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by city, state, zip, or shop name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Type filter */}
          <select
            className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="farmers_market">Farmers Market</option>
            <option value="swap_meet">Swap Meet</option>
            <option value="both">Both</option>
          </select>

          {/* Category filter */}
          <select
            className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-xs text-slate-400 mt-3">
            {filtered.length} vendor{filtered.length !== 1 ? 's' : ''} found
            {(search || typeFilter || categoryFilter) ? ' matching your filters' : ''}
          </p>
        )}
      </div>

      {/* Vendor Signup Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-5">Are you a vendor? Get listed for free.</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Farmers Market Card */}
          <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col gap-4">
           <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
               <Leaf className="w-6 h-6 text-green-700" strokeWidth={1.5} />
             </div>
              <div>
                <h3 className="font-bold text-green-900 text-lg">Farmers Market Vendor</h3>
              </div>
            </div>
            
            <p className="text-sm text-green-800">
              Set up your market booth and start selling fresh produce, goods, and homemade products
            </p>
            
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" strokeWidth={1.5} /> List your products</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" strokeWidth={1.5} /> Show your market location & schedule</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" strokeWidth={1.5} /> Get discovered by local shoppers</li>
            </ul>
            
            <button
              onClick={() => navigate('/MarketShopSignup?type=farmers_market')}
              className="mt-auto px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-sm w-full"
            >
              Set Up My Market Booth →
            </button>
          </div>

          {/* Swap Meet Card */}
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col gap-4">
           <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
               <Tag className="w-6 h-6 text-amber-700" strokeWidth={1.5} />
             </div>
              <div>
                <h3 className="font-bold text-amber-900 text-lg">Swap Meet Vendor</h3>
              </div>
            </div>
            
            <p className="text-sm text-amber-800">
              Claim your space, list your goods, and connect with buyers at your local swap meet
            </p>
            
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" strokeWidth={1.5} /> Advertise your space</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" strokeWidth={1.5} /> List what you're selling</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" strokeWidth={1.5} /> Build your buyer following</li>
            </ul>
            
            <button
              onClick={() => navigate('/MarketShopSignup?type=swap_meet')}
              className="mt-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors text-sm w-full"
            >
              Claim My Space →
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse h-44" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Store className="w-12 h-12 text-slate-400 mx-auto mb-4" strokeWidth={1.5} />
            <p className="font-medium text-slate-500">No vendors found</p>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(shop => (
              <VendorCard
                key={shop.id}
                shop={shop}
                onClick={() => navigate(`/MarketShopProfile/${shop.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}