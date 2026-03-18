import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, Package, MapPin, Star, Settings } from 'lucide-react';
import ProfileSwitcher from '@/components/dashboard/ProfileSwitcher';
import MarketShopListings from '@/components/marketshop/MarketShopListings';
import MarketShopMarkets from '@/components/marketshop/MarketShopMarkets';
import MarketShopReviews from '@/components/marketshop/MarketShopReviews';
import MarketShopSettings from '@/components/marketshop/MarketShopSettings';
import ShareYourListing from '@/components/marketshop/ShareYourListing';
import PhotoGalleryManager from '@/components/marketshop/PhotoGalleryManager';

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
    const updated = await base44.entities.MarketShop.update(shop.id, data);
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
          <div className="text-5xl mb-4">🛍️</div>
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
    <div className="min-h-screen bg-slate-50">
      {/* Profile Switcher */}
      <ProfileSwitcher
        activeProfile="marketshop"
        primaryType={profiles.contractor ? 'contractor' : 'customer'}
        hasMarketShop={true}
      />

      {/* Shop Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-2xl flex-shrink-0">
              🛍️
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800">{shop.shop_name}</h1>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[status]}`}>
                  {status}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {[shop.city, shop.state].filter(Boolean).join(', ')}
                {shop.shop_type && (
                  <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">
                    {shop.shop_type.replace('_', ' ')}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 border-b border-slate-200 -mb-px overflow-x-auto">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Share Your Listing Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ShareYourListing shop={shop} />
      </div>

      {/* Subscription Warning */}
      {shop.subscription_status !== 'active' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <div className="text-xl flex-shrink-0">⚠️</div>
            <div>
              <h3 className="font-semibold text-amber-900">Subscription Inactive</h3>
              <p className="text-sm text-amber-800 mt-1">Your MarketShop subscription is not active. Upgrade your subscription to access full features.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {activeTab === 'listings' && <MarketShopListings />}
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
    </div>
  );
}