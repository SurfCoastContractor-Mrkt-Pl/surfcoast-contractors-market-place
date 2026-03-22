import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Store, MapPin, Grid3x3, Warehouse, Star, Search, Filter, Loader2 } from 'lucide-react';

const BrowseOption = ({ icon: Icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="group relative bg-white rounded-xl border-2 border-slate-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-300 text-left"
  >
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
      </div>
      <div className="text-2xl group-hover:translate-x-1 transition-transform">→</div>
    </div>
  </button>
);

const SectionCard = ({ icon: Icon, title, options }) => (
  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-lg bg-white border-2 border-slate-300">
        <Icon className="w-6 h-6 text-slate-700" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    </div>
    <div className="space-y-4">
      {options.map((option, idx) => (
        <BrowseOption key={idx} {...option} />
      ))}
    </div>
  </div>
);

const VendorCard = ({ shop }) => {
  const rating = shop.average_rating ? parseFloat(shop.average_rating).toFixed(1) : 'N/A';
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Logo/Banner */}
      <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
        {shop.logo_url && (
          <img src={shop.logo_url} alt={shop.shop_name} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 line-clamp-2 mb-1">{shop.shop_name}</h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-600">
            {shop.city}, {shop.state?.toUpperCase()}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-slate-900">{rating}</span>
          </div>
        </div>

        {/* Categories */}
        {shop.categories?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {shop.categories.slice(0, 2).map(cat => (
              <span key={cat} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                {cat.replace(/_/g, ' ')}
              </span>
            ))}
            {shop.categories.length > 2 && (
              <span className="text-xs text-slate-500 px-2 py-1">+{shop.categories.length - 2}</span>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4">{shop.description}</p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className={`text-xs font-semibold px-2 py-1 rounded ${
            shop.subscription_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {shop.subscription_status === 'active' ? '✓ Active' : 'Limited'}
          </span>
          <button
            onClick={() => window.location.href = `/shop/${shop.id}`}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
          >
            View →
          </button>
        </div>
      </div>
    </div>
  );
};

export default function BoothsAndVendors() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    marketType: 'all',
    location: 'all',
    category: 'all',
    subscriptionStatus: 'all',
    minRating: 0,
  });

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const allShops = await base44.entities.MarketShop.list('', 1000);
        const activeShops = allShops.filter(s => s.is_active !== false);
        setShops(activeShops);
      } catch (err) {
        console.error('Error fetching shops:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  // Get unique values for filters
  const marketTypes = ['farmers_market', 'swap_meet', 'both'];
  const locations = [...new Set(shops.map(s => `${s.city}, ${s.state}`))].sort();
  const allCategories = [...new Set(shops.flatMap(s => s.categories || []))].sort();

  // Filter shops
  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMarketType = filters.marketType === 'all' || shop.shop_type === filters.marketType;
    const matchesLocation = filters.location === 'all' || 
      `${shop.city}, ${shop.state}` === filters.location;
    const matchesCategory = filters.category === 'all' || 
      (shop.categories && shop.categories.includes(filters.category));
    const matchesSubscription = filters.subscriptionStatus === 'all' || 
      shop.subscription_status === filters.subscriptionStatus;
    const matchesRating = !shop.average_rating || 
      parseFloat(shop.average_rating) >= filters.minRating;

    return matchesSearch && matchesMarketType && matchesLocation && 
      matchesCategory && matchesSubscription && matchesRating;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1488459716781-6f3ee109e5e4?w=1200&h=800&fit=crop)',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Booths & Vendors
            </h1>
            <p className="text-slate-600">
              Browse {filteredShops.length} {filteredShops.length === 1 ? 'vendor' : 'vendors'} across farmers markets and swap meets
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search vendors by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Market Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Market Type</label>
                <select
                  value={filters.marketType}
                  onChange={(e) => setFilters({...filters, marketType: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="all">All Markets</option>
                  <option value="farmers_market">Farmers Markets</option>
                  <option value="swap_meet">Swap Meets</option>
                  <option value="both">Both</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="all">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="all">All Categories</option>
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              {/* Subscription Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Status</label>
                <select
                  value={filters.subscriptionStatus}
                  onChange={(e) => setFilters({...filters, subscriptionStatus: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="all">All Vendors</option>
                  <option value="active">Active Subscription</option>
                  <option value="inactive">Limited Listing</option>
                </select>
              </div>

              {/* Min Rating */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Min Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="0">All Ratings</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>
            </div>
          </div>
      </div>

        {/* Vendor Grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {filteredShops.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-12 text-center">
              <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No vendors match your filters</p>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredShops.map(shop => (
                <VendorCard key={shop.id} shop={shop} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}