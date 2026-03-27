import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Loader2, Package, MapPin, Star, Settings, Store, BarChart3, MessageCircle } from 'lucide-react';
import MarketBoothMetrics from '@/components/marketshop/MarketBoothMetrics';
import MarketShopListings from '@/components/marketshop/MarketShopListings';
import MarketShopMarkets from '@/components/marketshop/MarketShopMarkets';
import MarketShopReviews from '@/components/marketshop/MarketShopReviews';
import MarketShopSettings from '@/components/marketshop/MarketShopSettings';
import ShareYourListing from '@/components/marketshop/ShareYourListing';
import PhotoGalleryManager from '@/components/marketshop/PhotoGalleryManager';
import MarketShopSchedule from '@/components/marketshop/MarketShopSchedule';
import MarketShopSubscription from '@/components/marketshop/MarketShopSubscription';
import StripeConnectSetup from '@/components/marketshop/StripeConnectSetup';
import MarketShopInquiries from '@/components/marketshop/MarketShopInquiries';
import LogoUploadWidget from '@/components/marketshop/LogoUploadWidget';
import LocationRatingForm from '@/components/locations/LocationRatingForm';
import LocationRatingDisplay from '@/components/locations/LocationRatingDisplay';
import VendorAnalyticsDashboard from '@/components/marketshop/VendorAnalyticsDashboard';
import VendorMessagingInbox from '@/components/marketshop/VendorMessagingInbox';
import CRMSyncPanel from '@/components/crm/CRMSyncPanel';

const TABS = [
  { key: 'listings', label: 'My Listings', icon: Package },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'messages', label: 'Messages', icon: MessageCircle },
  { key: 'markets', label: 'My Markets', icon: MapPin },
  { key: 'schedule', label: 'Schedule', icon: MapPin },
  { key: 'gallery', label: 'Gallery', icon: Package },
  { key: 'reviews', label: 'Reviews', icon: Star },
  { key: 'ratings', label: 'Location Ratings', icon: BarChart3 },
  { key: 'subscription', label: 'Subscription', icon: Star },
  { key: 'settings', label: 'Settings', icon: Settings },
];

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700 border border-green-200',
  pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  inactive: 'bg-slate-100 text-slate-600 border border-slate-200',
  suspended: 'bg-red-100 text-red-700 border border-red-200',
};

const STATUS_LABELS = {
  active: 'Active',
  pending: 'Pending Setup',
  inactive: 'No Active Plan',
  suspended: 'Suspended by Admin',
};

function getShopStatus(shop) {
  if (!shop) return 'pending';
  if (shop.is_active === false) return 'suspended';
  if (shop.subscription_status === 'active') return 'active';
  if (shop.subscription_status && shop.subscription_status !== 'active') return 'inactive';
  if (shop.waiver_accepted_at) return 'active';
  return 'pending';
}

export default function MarketShopDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useRequireAuth('/MarketShopDashboard');
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [activeTab, setActiveTab] = useState('listings');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    const load = async () => {
      try {
        const shops = await base44.entities.MarketShop.filter({ email: user.email });
        setShop(shops?.[0] || null);
      } catch (err) {
        console.error(err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, authLoading, navigate]);

  const handleUpdate = async (data) => {
    if (!shop?.id) return;
    await base44.entities.MarketShop.update(shop.id, data);
    setShop(prev => ({ ...prev, ...data }));
  };

  if (authLoading || loading) {
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
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dashboard</p>
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
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[status]}`}>
                {STATUS_LABELS[status] || status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white/65 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/30 shadow-lg p-4 sm:p-6 lg:p-8 relative z-10">
          {activeTab === 'listings' && <MarketShopListings shopId={shop.id} />}
          {activeTab === 'analytics' && <VendorAnalyticsDashboard shopId={shop.id} />}
          {activeTab === 'messages' && <VendorMessagingInbox shopId={shop.id} vendorEmail={shop.email} />}
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
          {activeTab === 'ratings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Rate Your Market Locations</h3>
                <p className="text-sm text-slate-600 mb-6">
                  Help other vendors find quality locations by rating your swap meet and farmer market venues.
                </p>
                <LocationRatingForm
                  location={{ location_name: shop.shop_name, city: shop.city, state: shop.state, location_type: shop.shop_type }}
                  onSave={() => window.location.reload()}
                />
              </div>
            </div>
          )}
          {activeTab === 'schedule' && <MarketShopSchedule shop={shop} onUpdate={handleUpdate} />}
          {activeTab === 'gallery' && <PhotoGalleryManager shop={shop} onUpdate={handleUpdate} />}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <MarketShopInquiries shop={shop} />
              <MarketShopSubscription shop={shop} />
              <StripeConnectSetup shop={shop} />
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">CRM Integration</h2>
                <CRMSyncPanel connectorName="-build as needed" userType="marketshop" />
              </div>
              <ShareYourListing shop={shop} />
            </div>
          )}
          {activeTab === 'settings' && <MarketShopSettings shop={shop} onUpdate={handleUpdate} />}
        </div>
      </div>
      </div>
    </div>
  );
}