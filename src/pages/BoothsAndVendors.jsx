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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">
              Booths & Vendors
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Discover amazing local vendors at farmers markets and swap meets. Choose how you'd like to browse.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="space-y-12">
          {/* Farmers Markets Section */}
          <SectionCard
            icon={Store}
            title="🌾 Farmers Markets"
            options={farmersMarketOptions}
          />

          {/* Swap Meets Section */}
          <SectionCard
            icon={Warehouse}
            title="♻️ Swap Meets"
            options={swapMeetOptions}
          />
        </div>

        {/* Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Market Locations</h3>
            <p className="text-sm text-blue-700">
              View aggregated vendor ratings and details about specific markets and venues.
            </p>
          </div>
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-2">🏪 Shop/Booth Browsing</h3>
            <p className="text-sm text-amber-700">
              Discover individual vendors and shops with their unique products and offerings.
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">⭐ Ratings & Reviews</h3>
            <p className="text-sm text-green-700">
              See real vendor feedback and market ratings to make informed choices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}