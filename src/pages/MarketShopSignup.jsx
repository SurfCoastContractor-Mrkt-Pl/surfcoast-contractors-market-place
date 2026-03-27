import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, X, Loader2, Leaf, Tag, CheckCircle } from 'lucide-react';
import PhotoGalleryUpload from '@/components/marketshop/PhotoGalleryUpload';
import MarketShopPaymentModelSelector from '@/components/marketshop/MarketShopPaymentModelSelector';
import { useRequiredFieldValidation } from '@/hooks/useRequiredFieldValidation';
import FormFieldWrapper from '@/components/forms/FormFieldWrapper';

const CATEGORIES_FARMERS_MARKET = [
  'Produce', 'Meat/Poultry', 'Dairy', 'Baked Goods', 'Prepared Foods',
  'Clothing', 'Jewelry', 'Home Decor', 'Art/Craft', 'Plants', 'Other'
];

const CATEGORIES_SWAP_MEET = [
  'Electronics', 'Tools', 'Sports Equipment', 'Books & Media', 'Home Decor',
  'Clothing & Accessories', 'Collectibles', 'Handmade Crafts', 'Vintage & Antiques', 'Jewelry', 'Misc', 'Other'
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

  const [linkedProfile, setLinkedProfile] = useState(null);
  const [autoLinkChecked, setAutoLinkChecked] = useState(false);
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
  const [createdShop, setCreatedShop] = useState(null);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);

  const requiredFields = ['shop_name', 'owner_name', 'email', 'phone', 'city', 'state', 'zip', 'description'];
  const { isFieldInvalid, markFieldTouched, touched } = useRequiredFieldValidation(formData, requiredFields);

  // MUST be before any conditional returns (Rules of Hooks)
  // Auto-populate from logged-in user on mount
  useEffect(() => {
    const autoLink = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) { setAutoLinkChecked(true); return; }

        const [contractors, customers] = await Promise.all([
          base44.entities.Contractor.filter({ email: user.email }).catch(() => []),
          base44.entities.CustomerProfile.filter({ email: user.email }).catch(() => []),
        ]);

        if (contractors && contractors.length > 0) {
          applyProfile('contractor', contractors[0]);
        } else if (customers && customers.length > 0) {
          applyProfile('customer', customers[0]);
        }
      } catch {
        // Not logged in or error — no auto-fill
      } finally {
        setAutoLinkChecked(true);
      }
    };
    autoLink();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const applyProfile = (profileType, p) => {
    const locationParts = p.location ? p.location.split(',').map(s => s.trim()) : [];
    setLinkedProfile({ type: profileType, data: p });
    setFormData(prev => ({
      ...prev,
      email: p.email || prev.email,
      owner_name: (profileType === 'contractor' ? p.name : p.full_name) || prev.owner_name,
      phone: p.phone || prev.phone,
      city: locationParts[0] || prev.city,
      state: locationParts[1] || prev.state,
    }));
  };

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
            <p className="text-lg text-slate-500 mb-2 font-medium">Welcome to the Marketplace</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Pick Your Market</h1>
            <p className="text-lg text-slate-600">Select the type of marketplace that fits your business</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl mx-auto">
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
              <div className="mt-2 text-sm text-green-700 font-semibold">Get Started →</div>
            </button>

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
              <div className="mt-2 text-sm text-amber-700 font-semibold">Get Started →</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const theme = THEME_CONFIG[type];
  const CATEGORIES = type === 'swap_meet' ? CATEGORIES_SWAP_MEET : CATEGORIES_FARMERS_MARKET;

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
    // Mark field as touched when user changes it
    if (requiredFields.includes(name)) {
      markFieldTouched(name);
    }
  };

  const handleLinkAccount = async () => {
    if (!linkEmail.trim()) { setLinkError('Please enter an email'); return; }
    setLinkSearching(true);
    setLinkError('');
    try {
      const [contractors, customers] = await Promise.all([
        base44.entities.Contractor.filter({ email: linkEmail.trim() }),
        base44.entities.CustomerProfile.filter({ email: linkEmail.trim() })
      ]);

      if (contractors && contractors.length > 0) {
        applyProfile('contractor', contractors[0]);
        setShowAccountLink(false);
      } else if (customers && customers.length > 0) {
        applyProfile('customer', customers[0]);
        setShowAccountLink(false);
      } else {
        setLinkError('No account found with this email');
      }
    } catch {
      setLinkError('Error searching for account');
    }
    setLinkSearching(false);
  };

  const handleUnlink = () => {
    setLinkedProfile(null);
    setFormData(prev => ({
      ...prev,
      email: '',
      owner_name: '',
      phone: '',
      city: '',
      state: '',
    }));
  };

  const isFormValid = () => {
    // If linked account, button is enabled (shop_name validation handled by HTML required attr)
    if (linkedProfile) {
      return true;
    }
    // If no linked account, all required fields must be filled
    return !!(
      formData.shop_name.trim() &&
      formData.owner_name.trim() &&
      formData.email.trim() &&
      formData.phone.trim() &&
      formData.city.trim() &&
      formData.state.trim() &&
      formData.zip.trim() &&
      formData.description.trim()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      // Validate that user doesn't already have max accounts
      const validationRes = await base44.functions.invoke('validateMarketShopCreation', {
        email: formData.email,
        shop_type: type
      });

      if (!validationRes.data.allowed) {
        alert(validationRes.data.reason);
        setSubmitLoading(false);
        return;
      }

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
      setCreatedShop(newShop);
      setShowPaymentSelector(true);
      setSubmitLoading(false);
    } catch (err) {
      console.error('Submission error:', err);
      alert('Error setting up your listing. Please try again.');
      setSubmitLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.themeClass} py-8 px-4`}>
      {showPaymentSelector && createdShop && (
        <MarketShopPaymentModelSelector
          shopId={createdShop.id}
          shopName={createdShop.shop_name}
          ownerEmail={formData.email}
          ownerName={formData.owner_name}
          shopType={type}
          onClose={() => {
            setShowPaymentSelector(false);
            setCreatedShop(null);
          }}
        />
      )}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Canceled Banner */}
        {canceled && !dismissCanceled && (
          <div className="mb-4 sm:mb-6 bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 flex items-start justify-between gap-2">
            <div>
              <p className="text-xs sm:text-sm text-amber-900 font-semibold">Payment was canceled</p>
              <p className="text-xs sm:text-sm text-amber-700 mt-1">Your listing has not been activated yet. Complete payment to go live.</p>
            </div>
            <button onClick={() => setDismissCanceled(true)} className="text-amber-600 hover:text-amber-700 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => navigate('/MarketShopSignup')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 sm:mb-8 font-medium text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {/* Card */}
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.bgLight }}>
              <theme.icon className="w-6 sm:w-7 h-6 sm:h-7" style={{ color: theme.color }} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{theme.title}</h1>
              <p className="text-xs sm:text-base text-slate-600 mt-1">{theme.subtitle}</p>
            </div>
          </div>

          {/* Account Linking — shown at TOP before form fields */}
          {!linkedProfile && autoLinkChecked && (
            <div className="mb-6 pb-6 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">Already have a SurfCoast account?</h3>
              <p className="text-sm text-slate-500 mb-3">Link your account to auto-fill your information.</p>
              {!showAccountLink ? (
                <button
                  type="button"
                  onClick={() => setShowAccountLink(true)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors text-sm"
                >
                  Yes — link my existing account
                </button>
              ) : (
                <div className="space-y-3">
                  <Input
                    type="email"
                    value={linkEmail}
                    onChange={(e) => setLinkEmail(e.target.value)}
                    placeholder="Enter your account email address"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleLinkAccount())}
                  />
                  {linkError && <p className="text-sm text-red-600">{linkError}</p>}
                  <div className="flex gap-2">
                    <Button type="button" onClick={handleLinkAccount} disabled={linkSearching} className="flex-1">
                      {linkSearching ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Searching...</> : 'Find & Link Account'}
                    </Button>
                    <Button type="button" onClick={() => { setShowAccountLink(false); setLinkEmail(''); setLinkError(''); }} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Linked Account Banner */}
          {linkedProfile && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-900">Account linked — info pre-filled below</p>
                  <p className="text-sm text-green-700 mt-0.5">
                    {linkedProfile.data.full_name || linkedProfile.data.name} · {linkedProfile.data.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleUnlink}
                className="text-green-600 hover:text-green-800 font-medium text-xs flex-shrink-0"
              >
                Unlink
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Shop Name */}
            <FormFieldWrapper
              label="Shop/Booth Name"
              required={true}
              isInvalid={isFieldInvalid('shop_name')}
            >
              <Input
                type="text"
                name="shop_name"
                value={formData.shop_name}
                onChange={handleFormChange}
                onBlur={() => markFieldTouched('shop_name')}
                placeholder="e.g., Green Valley Organics"
                className={isFieldInvalid('shop_name') ? 'border-red-500' : ''}
              />
            </FormFieldWrapper>

            {/* Owner Name */}
            <FormFieldWrapper
              label="Your Name"
              required={true}
              isInvalid={isFieldInvalid('owner_name')}
            >
              <Input
                type="text"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleFormChange}
                onBlur={() => markFieldTouched('owner_name')}
                placeholder="Your full name"
                className={isFieldInvalid('owner_name') ? 'border-red-500' : ''}
              />
            </FormFieldWrapper>

            {/* Email */}
            <FormFieldWrapper
              label="Email"
              required={true}
              isInvalid={isFieldInvalid('email')}
            >
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                onBlur={() => markFieldTouched('email')}
                placeholder="your@email.com"
                className={isFieldInvalid('email') ? 'border-red-500' : ''}
              />
            </FormFieldWrapper>

            {/* Phone */}
            <FormFieldWrapper
              label="Phone"
              required={true}
              isInvalid={isFieldInvalid('phone')}
            >
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                onBlur={() => markFieldTouched('phone')}
                placeholder="(555) 123-4567"
                className={isFieldInvalid('phone') ? 'border-red-500' : ''}
              />
            </FormFieldWrapper>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormFieldWrapper
                label="City"
                required={true}
                isInvalid={isFieldInvalid('city')}
              >
                <Input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  onBlur={() => markFieldTouched('city')}
                  placeholder="City"
                  className={isFieldInvalid('city') ? 'border-red-500' : ''}
                />
              </FormFieldWrapper>
              <FormFieldWrapper
                label="State"
                required={true}
                isInvalid={isFieldInvalid('state')}
              >
                <Input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleFormChange}
                  onBlur={() => markFieldTouched('state')}
                  placeholder="CA"
                  maxLength="2"
                  className={isFieldInvalid('state') ? 'border-red-500' : ''}
                />
              </FormFieldWrapper>
              <FormFieldWrapper
                label="ZIP"
                required={true}
                isInvalid={isFieldInvalid('zip')}
              >
                <Input
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={handleFormChange}
                  onBlur={() => markFieldTouched('zip')}
                  placeholder="90210"
                  className={isFieldInvalid('zip') ? 'border-red-500' : ''}
                />
              </FormFieldWrapper>
            </div>

            {/* Description */}
            <FormFieldWrapper
              label="Description"
              required={true}
              isInvalid={isFieldInvalid('description')}
            >
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                onBlur={() => markFieldTouched('description')}
                placeholder="Tell shoppers what you sell and what makes your booth unique"
                rows="4"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-offset-0 focus:border-transparent outline-none ${isFieldInvalid('description') ? 'border-red-500' : 'border-slate-300'}`}
              />
            </FormFieldWrapper>

            {/* Categories */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2 sm:mb-3">Categories</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
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
              <Input type="url" name="instagram_url" value={formData.instagram_url} onChange={handleFormChange} placeholder="https://instagram.com/yourshop" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Facebook URL (optional)</label>
              <Input type="url" name="facebook_url" value={formData.facebook_url} onChange={handleFormChange} placeholder="https://facebook.com/yourshop" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">TikTok URL (optional)</label>
              <Input type="url" name="tiktok_url" value={formData.tiktok_url} onChange={handleFormChange} placeholder="https://tiktok.com/@yourshop" />
            </div>

            {/* Fee Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <strong>5% platform facilitation fee</strong> applies to transactions processed through SurfCoast Marketplace. This covers payment processing and platform maintenance. Example: a $100 sale pays out $95 to you. See <a href="/Terms" style={{color:"#92400e", fontWeight:600}}>Terms of Service</a> for full details.
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitLoading || !isFormValid()}
              className={`w-full py-2 sm:py-3 text-sm sm:text-base font-semibold text-white min-h-[44px] ${theme.buttonColor}`}
            >
              {submitLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up...
                </span>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}