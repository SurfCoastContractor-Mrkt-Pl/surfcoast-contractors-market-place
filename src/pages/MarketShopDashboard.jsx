import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, Package, MapPin, Star, Settings, Store, AlertTriangle } from 'lucide-react';
import MarketBoothMetrics from '@/components/marketshop/MarketBoothMetrics';
import MarketShopListings from '@/components/marketshop/MarketShopListings';
import MarketShopMarkets from '@/components/marketshop/MarketShopMarkets';
import MarketShopReviews from '@/components/marketshop/MarketShopReviews';
import MarketShopSettings from '@/components/marketshop/MarketShopSettings';
import ShareYourListing from '@/components/marketshop/ShareYourListing';
import PhotoGalleryManager from '@/components/marketshop/PhotoGalleryManager';
import MarketShopSchedule from '@/components/marketshop/MarketShopSchedule';
import MarketShopSubscription from '@/components/marketshop/MarketShopSubscription';
import MarketShopInquiries from '@/components/marketshop/MarketShopInquiries';
import LogoUploadWidget from '@/components/marketshop/LogoUploadWidget';

const TABS = [
  { key: 'listings', label: 'My Listings', icon: Package },
  { key: 'markets', label: 'My Markets', icon: MapPin },
  { key: 'reviews', label: 'Reviews', icon: Star },
  { key: 'settings', label: 'Settings', icon: Settings },
];

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700 border border-green-200',
  pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  suspended: 'bg-red-100 text-red-700 border border-red-200',
};

function getShopStatus(shop) {
  if (!shop) return 'pending';
  if (shop.is_active === false) return 'suspended';
  if (shop.waiver_accepted_at) return 'active';
  return 'pending';
}

export default function MarketShopDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [profiles, setProfiles] = useState({ customer: false, contractor: false, marketshop: true });
  const [activeTab, setActiveTab] = useState('listings');

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) { navigate('/'); return; }

        const [shops, contractors, customers] = await Promise.all([
          base44.entities.MarketShop.filter({ email: user.email }),
          base44.entities.Contractor.filter({ email: user.email }),
          base44.entities.CustomerProfile.filter({ email: user.email }),
        ]);

        setShop(shops?.[0] || null);
        setProfiles({
          customer: customers?.length > 0,
          contractor: contractors?.length > 0,
          marketshop: true,
        });
      } catch (err) {
        console.error(err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleUpdate = async (data) => {
    if (!shop?.id) return;
    await base44.entities.MarketShop.update(shop.id, data);
    setShop(prev => ({ ...prev, ...data }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No MarketShop Found</h2>
          <p className="text-slate-500 mb-4">You haven't set up a MarketShop profile yet.</p>
          <button
            onClick={() => navigate('/MarketShopSignup')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Create MarketShop
          </button>
        </div>
      </div>
    );
  }

  const status = getShopStatus(shop);

  return (
    <div className="min-h-screen bg-slate-50" style={{
      backgroundImage: 'url(https://media.base44.com/images/public/69a61a047827463e7cdbc1eb/a3bd7c581_StockCake-Farmers_Market_Display-1240764-standard.jpg)',
      backgroundAttachment: 'fixed',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative">

      {/* Tabs bar — sits flush at the very top, styled to blend with the site nav */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center overflow-x-auto scrollbar-hide">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === key
                    ? 'border-slate-800 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shop Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Metrics */}
            <div className="hidden sm:flex items-center flex-1">
              <MarketBoothMetrics shop={shop} />
            </div>
            {/* Right: Logo Widget + Shop Name + Status + Location + Type */}
            <div className="flex flex-col items-center gap-3">
              <LogoUploadWidget shop={shop} onUpdate={handleUpdate} />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 text-center">{shop.shop_name}</h1>
              <div className="flex flex-row flex-wrap items-center justify-center gap-2">
                {(shop.city || shop.state) && (
                  <span className="text-sm text-slate-500">
                    {[shop.city, shop.state].filter(Boolean).map((s, i) => i === 0 ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s.toUpperCase()).join(', ')}
                  </span>
                )}
                {shop.shop_type && (
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full capitalize ${
                    status === 'pending' || status === 'suspended'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-green-100 text-green-600'
                  }`}>
                    <Store className="w-3 h-3" />
                    {shop.shop_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                )}
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[status]}`}>
                {status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white/65 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/30 shadow-lg p-4 sm:p-6 lg:p-8 relative z-10">
          {activeTab === 'listings' && <MarketShopListings shopId={shop.id} />}
          {activeTab === 'markets' && <MarketShopMarkets shop={shop} onUpdate={handleUpdate} />}
          {activeTab === 'reviews' && (
            shop.subscription_status === 'active' ? (
              <MarketShopReviews shop={shop} />
            ) : (
              <div className="text-center py-12">
                <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-4">Reviews are only available with an active subscription.</p>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Upgrade Now →
                </button>
              </div>
            )
          )}
          {activeTab === 'settings' && <MarketShopSettings shop={shop} onUpdate={handleUpdate} />}
        </div>
      </div>

      {/* Market Schedule Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        <div className="bg-white/65 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/30 shadow-lg p-4 sm:p-6 lg:p-8">
          <MarketShopSchedule shop={shop} onUpdate={handleUpdate} />
        </div>
      </div>

      {/* Photo Gallery Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        <div className="bg-white/65 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/30 shadow-lg p-4 sm:p-6 lg:p-8">
          <PhotoGalleryManager shop={shop} onUpdate={handleUpdate} />
        </div>
      </div>

      {/* Inquiries Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
        <div className="bg-white/65 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/30 shadow-lg p-4 sm:p-6 lg:p-8">
          <MarketShopInquiries shop={shop} />
        </div>
      </div>

      {/* Subscription Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
        <div className="bg-white/65 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/30 shadow-lg p-4 sm:p-6 lg:p-8">
          <MarketShopSubscription shop={shop} />
        </div>
      </div>

      {/* Share Your Listing Section - Bottom */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 relative z-10">
        <div className="bg-white/65 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/30 shadow-lg p-4 sm:p-6 lg:p-8">
          <ShareYourListing shop={shop} />
        </div>
      </div>
      </div>
    </div>
  );
}