import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, Package, MapPin, Star, Settings, Store, Camera, ExternalLink } from 'lucide-react';
import ProfileSwitcher from '@/components/dashboard/ProfileSwitcher';
import MarketShopListings from '@/components/marketshop/MarketShopListings';
import MarketShopMarkets from '@/components/marketshop/MarketShopMarkets';
import MarketShopReviews from '@/components/marketshop/MarketShopReviews';
import MarketShopSettings from '@/components/marketshop/MarketShopSettings';
import ShareYourListing from '@/components/marketshop/ShareYourListing';
import PhotoGalleryManager from '@/components/marketshop/PhotoGalleryManager';
import MarketShopSchedule from '@/components/marketshop/MarketShopSchedule';
import MarketShopSubscription from '@/components/marketshop/MarketShopSubscription';
import MarketShopInquiries from '@/components/marketshop/MarketShopInquiries';
import ImageCropUploader from '@/components/marketshop/ImageCropUploader';

const TABS = [
  { key: 'listings', label: 'Listings', icon: Package },
  { key: 'markets', label: 'Markets', icon: MapPin },
  { key: 'reviews', label: 'Reviews', icon: Star },
  { key: 'settings', label: 'Settings', icon: Settings },
];

const STATUS_STYLES = {
  active: 'bg-green-500/20 text-green-300 border border-green-500/30',
  pending: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  suspended: 'bg-red-500/20 text-red-300 border border-red-500/30',
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
  const [editingBanner, setEditingBanner] = useState(false);
  const [editingLogo, setEditingLogo] = useState(false);

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
        setProfiles({ customer: customers?.length > 0, contractor: contractors?.length > 0, marketshop: true });
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Store className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No MarketShop Found</h2>
          <p className="text-slate-400 mb-6">You haven't set up a MarketShop profile yet.</p>
          <button onClick={() => navigate('/MarketShopSignup')} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-500 transition-colors">
            Create MarketShop
          </button>
        </div>
      </div>
    );
  }

  const status = getShopStatus(shop);
  const shopTypeLabel = shop.shop_type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Profile Switcher */}
      <div className="relative z-20">
        <ProfileSwitcher
          activeProfile="marketshop"
          primaryType={profiles.contractor ? 'contractor' : 'customer'}
          hasMarketShop={true}
        />
      </div>

      {/* ─── Hero / Banner ─── */}
      <div className="relative">
        {/* Cover Banner */}
        <div className="relative w-full h-48 sm:h-64 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden group">
          {shop.banner_url ? (
            <img src={shop.banner_url} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-slate-600 text-sm">No cover photo — click the camera icon to upload</p>
            </div>
          )}
          {/* Dark overlay gradient at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          {/* Banner edit button */}
          <button
            onClick={() => setEditingBanner(true)}
            className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 hover:bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 transition-all"
          >
            <Camera className="w-3.5 h-3.5" /> Edit Cover
          </button>
        </div>

        {/* Profile Photo + Shop Info — overlaid at bottom of banner */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-14 sm:-mt-16 flex items-end gap-4 pb-4">
            {/* Profile photo */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-slate-950 overflow-hidden bg-slate-800 shadow-xl">
                {shop.logo_url ? (
                  <img src={shop.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="w-10 h-10 text-slate-600" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <button
                onClick={() => setEditingLogo(true)}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-950 transition-colors"
                title="Edit profile photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Shop name + meta */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">{shop.shop_name}</h1>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${STATUS_STYLES[status]}`}>
                  {status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                {[shop.city, shop.state].filter(Boolean).length > 0 && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {[shop.city, shop.state].filter(Boolean).join(', ')}
                  </span>
                )}
                {shopTypeLabel && (
                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-xs border border-slate-700">{shopTypeLabel}</span>
                )}
                {shop.custom_slug && (
                  <a
                    href={`/shop/${shop.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" /> View Public Page
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tab Bar ─── */}
      <div className="border-b border-slate-800 sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Tab Content ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">

        {/* Main Tab Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7">
          {activeTab === 'listings' && <MarketShopListings />}
          {activeTab === 'markets' && <MarketShopMarkets shop={shop} onUpdate={handleUpdate} />}
          {activeTab === 'reviews' && (
            shop.subscription_status === 'active' ? (
              <MarketShopReviews shop={shop} />
            ) : (
              <div className="text-center py-12">
                <Star className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">Reviews are only available with an active subscription.</p>
                <button onClick={() => setActiveTab('settings')} className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors">
                  Upgrade Now →
                </button>
              </div>
            )
          )}
          {activeTab === 'settings' && <MarketShopSettings shop={shop} onUpdate={handleUpdate} />}
        </div>

        {/* Secondary Panels */}
        <SectionPanel title="Market Schedule">
          <MarketShopSchedule shop={shop} onUpdate={handleUpdate} />
        </SectionPanel>

        <SectionPanel title="Photo Gallery">
          <PhotoGalleryManager shop={shop} onUpdate={handleUpdate} />
        </SectionPanel>

        <SectionPanel title="Inquiries">
          <MarketShopInquiries shop={shop} />
        </SectionPanel>

        <SectionPanel title="Subscription">
          <MarketShopSubscription shop={shop} />
        </SectionPanel>

        <SectionPanel title="Share Your Listing">
          <ShareYourListing shop={shop} />
        </SectionPanel>
      </div>

      {/* ─── Banner Crop Modal ─── */}
      {editingBanner && (
        <CropModal
          label="Cover Banner"
          currentUrl={shop.banner_url}
          aspectRatio={4}
          shape="rect"
          hint="Wide landscape photo (4:1). Drag & zoom to crop."
          onSave={async (url) => { await handleUpdate({ banner_url: url }); setEditingBanner(false); }}
          onClose={() => setEditingBanner(false)}
        />
      )}

      {/* ─── Logo Crop Modal ─── */}
      {editingLogo && (
        <CropModal
          label="Profile / Booth Photo"
          currentUrl={shop.logo_url}
          aspectRatio={1}
          shape="circle"
          hint="Square booth or logo photo. Drag & zoom to crop."
          onSave={async (url) => { await handleUpdate({ logo_url: url }); setEditingLogo(false); }}
          onClose={() => setEditingLogo(false)}
        />
      )}
    </div>
  );
}

function SectionPanel({ title, children }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="px-5 sm:px-7 py-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="p-5 sm:p-7">
        {children}
      </div>
    </div>
  );
}

// Wraps ImageCropUploader in a full-screen dark modal overlay
function CropModal({ label, currentUrl, aspectRatio, shape, hint, onSave, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-7 w-full max-w-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Edit {label}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">✕ Cancel</button>
        </div>
        <ImageCropUploader
          label={label}
          currentUrl={currentUrl}
          aspectRatio={aspectRatio}
          shape={shape}
          hint={hint}
          onSave={onSave}
        />
      </div>
    </div>
  );
}