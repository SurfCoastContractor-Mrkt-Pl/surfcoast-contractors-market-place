import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, X, Loader2, Leaf, Tag } from 'lucide-react';
import PhotoGalleryUpload from '@/components/marketshop/PhotoGalleryUpload';

const CATEGORIES = [
  'Produce', 'Meat/Poultry', 'Dairy', 'Baked Goods', 'Prepared Foods',
  'Clothing', 'Jewelry', 'Home Decor', 'Art/Craft', 'Plants', 'Other'
];

const THEME_CONFIG = {
  farmers_market: {
    color: '#16a34a',
    bgLight: '#dcfce7',
    icon: Leaf,
    title: 'Set Up Your Market Booth',
    subtitle: 'Get discovered by local shoppers at farmers markets near you',
    buttonColor: 'bg-green-600 hover:bg-green-700',
    themeClass: 'from-green-50 to-green-100'
  },
  swap_meet: {
    color: '#d97706',
    bgLight: '#fef3c7',
    icon: Tag,
    title: 'Claim Your Swap Meet Space',
    subtitle: 'List your goods and build your buyer following at local swap meets',
    buttonColor: 'bg-amber-600 hover:bg-amber-700',
    themeClass: 'from-amber-50 to-amber-100'
  }
};

export default function MarketShopSignup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type');
  const canceled = searchParams.get('canceled') === 'true';

  const [step, setStep] = useState('form'); // form, account-link, loading, success
  const [linkedProfile, setLinkedProfile] = useState(null);
  const [showAccountLink, setShowAccountLink] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkSearching, setLinkSearching] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [dismissCanceled, setDismissCanceled] = useState(false);

  const [formData, setFormData] = useState({
    shop_name: '',
    owner_name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    zip: '',
    description: '',
    categories: [],
    instagram_url: '',
    facebook_url: '',
    tiktok_url: '',
    gallery_images: []
  });

  // If no type param, show type selection screen
  if (!type) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => navigate('/MarketDirectory')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Choose Your Market</h1>
            <p className="text-lg text-slate-600">Select the type of marketplace that fits your business</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Farmers Market Card */}
            <button
              onClick={() => navigate('/MarketShopSignup?type=farmers_market')}
              className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all p-8 text-left flex flex-col gap-4"
            >
              <div className="w-16 h-16 rounded-xl bg-green-200 flex items-center justify-center">
                <Leaf className="w-8 h-8 text-green-700" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-900 mb-2">Farmers Market Vendor</h2>
                <p className="text-green-800">Set up your market booth and start selling fresh produce, goods, and homemade products</p>
              </div>
              <div className="mt-2 text-sm text-green-700 font-semibold">
                Get Started →
              </div>
            </button>

            {/* Swap Meet Card */}
            <button
              onClick={() => navigate('/MarketShopSignup?type=swap_meet')}
              className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all p-8 text-left flex flex-col gap-4"
            >
              <div className="w-16 h-16 rounded-xl bg-amber-200 flex items-center justify-center">
                <Tag className="w-8 h-8 text-amber-700" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-amber-900 mb-2">Swap Meet Vendor</h2>
                <p className="text-amber-800">Claim your space, list your goods, and connect with buyers at your local swap meet</p>
              </div>
              <div className="mt-2 text-sm text-amber-700 font-semibold">
                Get Started →
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const theme = THEME_CONFIG[type];

  const handleFormChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    if (inputType === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        categories: checked
          ? [...prev.categories, value]
          : prev.categories.filter(c => c !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLinkAccount = async () => {
    if (!linkEmail.trim()) {
      setLinkError('Please enter an email');
      return;
    }
    setLinkSearching(true);
    setLinkError('');
    try {
      const [contractors, customers] = await Promise.all([
        base44.entities.Contractor.filter({ email: linkEmail.trim() }),
        base44.entities.CustomerProfile.filter({ email: linkEmail.trim() })
      ]);

      if (contractors && contractors.length > 0) {
        setLinkedProfile({ type: 'contractor', data: contractors[0] });
        setFormData(prev => ({ ...prev, email: linkEmail.trim() }));
        setShowAccountLink(false);
      } else if (customers && customers.length > 0) {
        setLinkedProfile({ type: 'customer', data: customers[0] });
        setFormData(prev => ({ ...prev, email: linkEmail.trim() }));
        setShowAccountLink(false);
      } else {
        setLinkError('No account found with this email');
      }
    } catch (err) {
      setLinkError('Error searching for account');
    }
    setLinkSearching(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      // Create MarketShop record
      const shopPayload = {
        shop_name: formData.shop_name,
        shop_type: type,
        email: formData.email,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        description: formData.description,
        categories: formData.categories,
        instagram_url: formData.instagram_url || undefined,
        facebook_url: formData.facebook_url || undefined,
        tiktok_url: formData.tiktok_url || undefined,
        gallery_images: formData.gallery_images.length > 0 ? formData.gallery_images : undefined,
        is_active: false
      };

      if (linkedProfile) {
        if (linkedProfile.type === 'contractor') {
          shopPayload.linked_contractor_id = linkedProfile.data.id;
        } else {
          shopPayload.linked_customer_profile_id = linkedProfile.data.id;
        }
      }

      const newShop = await base44.entities.MarketShop.create(shopPayload);

      // Call backend function to create subscription and get checkout URL
      const response = await base44.functions.invoke('createVendorSubscription', {
        shop_id: newShop.id,
        shop_name: formData.shop_name,
        owner_email: formData.email,
        owner_name: formData.owner_name,
        vendor_type: type
      });

      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Error setting up your listing. Please try again.');
      setSubmitLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.themeClass} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        {/* Canceled Banner */}
        {canceled && !dismissCanceled && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start justify-between">
            <div>
              <p className="text-sm text-amber-900 font-semibold">Payment was canceled</p>
              <p className="text-sm text-amber-700 mt-1">Your listing has not been activated yet. Complete payment to go live.</p>
            </div>
            <button
              onClick={() => setDismissCanceled(true)}
              className="text-amber-600 hover:text-amber-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => navigate('/MarketShopSignup')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 font-medium"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.bgLight }}>
              <theme.icon className="w-7 h-7" style={{ color: theme.color }} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{theme.title}</h1>
              <p className="text-slate-600 mt-1">{theme.subtitle}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Linked Account Info */}
            {linkedProfile && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-900">Account linked</p>
                  <p className="text-sm text-blue-800 mt-1">
                    {linkedProfile.data.full_name || linkedProfile.data.name} ({linkedProfile.data.email})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLinkedProfile(null);
                    setFormData(prev => ({ ...prev, email: '' }));
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Change
                </button>
              </div>
            )}

            {/* Shop Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Shop/Booth Name *</label>
              <Input
                type="text"
                name="shop_name"
                value={formData.shop_name}
                onChange={handleFormChange}
                placeholder="e.g., Green Valley Organics"
                required
              />
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Your Name *</label>
              <Input
                type="text"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleFormChange}
                placeholder="Your full name"
                required
              />
            </div>

            {/* Email */}
            {!linkedProfile && (
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Email *</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="your@email.com"
                  required
                />
              </div>
            )}

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Phone *</label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                placeholder="(555) 123-4567"
                required
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">City *</label>
                <Input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  placeholder="City"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">State *</label>
                <Input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleFormChange}
                  placeholder="CA"
                  maxLength="2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">ZIP *</label>
                <Input
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={handleFormChange}
                  placeholder="90210"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Tell shoppers what you sell and what makes your booth unique"
                required
                rows="4"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-offset-0 focus:border-transparent outline-none"
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">Categories</label>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={cat}
                      checked={formData.categories.includes(cat)}
                      onChange={handleFormChange}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Photo Gallery Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">Show off your booth & products (optional)</label>
              <PhotoGalleryUpload
                images={formData.gallery_images}
                onImagesChange={(images) => setFormData(prev => ({ ...prev, gallery_images: images }))}
                maxPhotos={6}
              />
            </div>

            {/* Social URLs */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Instagram URL (optional)</label>
              <Input
                type="url"
                name="instagram_url"
                value={formData.instagram_url}
                onChange={handleFormChange}
                placeholder="https://instagram.com/yourshop"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Facebook URL (optional)</label>
              <Input
                type="url"
                name="facebook_url"
                value={formData.facebook_url}
                onChange={handleFormChange}
                placeholder="https://facebook.com/yourshop"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">TikTok URL (optional)</label>
              <Input
                type="url"
                name="tiktok_url"
                value={formData.tiktok_url}
                onChange={handleFormChange}
                placeholder="https://tiktok.com/@yourshop"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitLoading}
              className={`w-full py-3 text-base font-semibold text-white ${theme.buttonColor}`}
            >
              {submitLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up your listing...
                </span>
              ) : (
                'Continue to Payment'
              )}
            </Button>
          </form>

          {/* Account Linking Section */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Already have a SurfCoast account?</h3>
            
            {!showAccountLink ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowAccountLink(true)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Yes — link my account
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  type="email"
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  placeholder="Enter your email address"
                />
                {linkError && <p className="text-sm text-red-600">{linkError}</p>}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleLinkAccount}
                    disabled={linkSearching}
                    className="flex-1"
                  >
                    {linkSearching ? 'Searching...' : 'Search & Link'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowAccountLink(false);
                      setLinkEmail('');
                      setLinkError('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}