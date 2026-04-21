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

        const [contractors, consumers] = await Promise.all([
          base44.entities.Contractor.filter({ email: user.email }).catch(() => []),
          base44.entities.CustomerProfile.filter({ email: user.email }).catch(() => []),
        ]);

        if (contractors && contractors.length > 0) {
          applyProfile('contractor', contractors[0]);
        } else if (consumers && consumers.length > 0) {
          applyProfile('consumer', consumers[0]);
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
  const T = { bg: "#EBEBEC", card: "#fff", dark: "#1A1A1B", muted: "#333", border: "#D0D0D2", amber: "#5C3500", amberBg: "#F0E0C0", amberTint: "#FBF5EC", shadow: "3px 3px 0px #5C3500" };
  const mono = { fontFamily: "monospace", fontWeight: 700, fontStyle: "italic" };

  if (!type) {
    return (
      <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh", background: T.bg }}>
        {/* Ticker */}
        <div style={{ background: T.dark, padding: "6px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
          <span style={{ ...mono, fontSize: 11, color: "#e0e0e0" }}>// MARKET SHOP · OPEN YOUR BOOTH OR SPACE</span>
          <span style={{ ...mono, fontSize: 11, color: "#ffffff" }}>California · Nationwide</span>
        </div>

        <div style={{ maxWidth: 960, margin: "0 auto", padding: "52px 24px" }}>
          <button
            onClick={() => navigate('/MarketDirectory')}
            style={{ ...mono, fontSize: 11, color: T.muted, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 28, padding: 0 }}
          >
            <ChevronLeft style={{ width: 13, height: 13 }} /> Back to Directory
          </button>

          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.1em" }}>// PICK YOUR MARKET TYPE</div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: T.dark, marginBottom: 10, lineHeight: 1.1 }}>Open Your Market Booth</h1>
          <p style={{ fontSize: 15, color: T.muted, marginBottom: 40, fontStyle: "italic" }}>Select the type of marketplace that fits your business.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 700 }}>
            <button
              onClick={() => navigate('/MarketShopSignup?type=farmers_market')}
              style={{ background: T.card, border: `0.5px solid ${T.border}`, borderTop: `3px solid #16a34a`, borderRadius: 10, boxShadow: T.shadow, padding: 28, textAlign: "left", cursor: "pointer", transition: "box-shadow 0.2s ease" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `3px 3px 0px #5C3500, 0 0 18px 4px rgba(255,180,0,0.25)`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = T.shadow}
            >
              <div style={{ width: 44, height: 44, borderRadius: 8, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Leaf style={{ width: 22, height: 22, color: "#16a34a" }} strokeWidth={1.5} />
              </div>
              <div style={{ ...mono, fontSize: 10, color: T.muted, marginBottom: 8, letterSpacing: "0.06em" }}>// FARMERS MARKET</div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: T.dark, marginBottom: 8 }}>Farmers Market Vendor</h2>
              <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.65, fontStyle: "italic", marginBottom: 16 }}>
                Set up your market booth and start selling fresh produce, goods, and homemade products.
              </p>
              <span style={{ ...mono, fontSize: 11, color: T.amber }}>Get Started →</span>
            </button>

            <button
              onClick={() => navigate('/MarketShopSignup?type=swap_meet')}
              style={{ background: T.card, border: `0.5px solid ${T.border}`, borderTop: `3px solid ${T.amber}`, borderRadius: 10, boxShadow: T.shadow, padding: 28, textAlign: "left", cursor: "pointer", transition: "box-shadow 0.2s ease" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `3px 3px 0px #5C3500, 0 0 18px 4px rgba(255,180,0,0.25)`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = T.shadow}
            >
              <div style={{ width: 44, height: 44, borderRadius: 8, background: T.amberTint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Tag style={{ width: 22, height: 22, color: T.amber }} strokeWidth={1.5} />
              </div>
              <div style={{ ...mono, fontSize: 10, color: T.muted, marginBottom: 8, letterSpacing: "0.06em" }}>// SWAP MEET</div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: T.dark, marginBottom: 8 }}>Swap Meet Vendor</h2>
              <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.65, fontStyle: "italic", marginBottom: 16 }}>
                Claim your space, list your goods, and connect with buyers at your local swap meet.
              </p>
              <span style={{ ...mono, fontSize: 11, color: T.amber }}>Get Started →</span>
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
      // Track journey start when email is entered
      if (name === 'email' && value.includes('@')) {
        const shopType = type === 'swap_meet' ? 'swap_meet_vendor' : 'farmers_market_vendor';
        base44.functions.invoke('trackSignupJourney', {
          email: value,
          signup_type: shopType,
          event: 'started',
          step: 1,
          step_name: 'Booth Registration Form',
          extra_data: { total_steps: 1, shop_type: type },
        }).catch(() => {});
      }
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
      const [contractors, consumers] = await Promise.all([
        base44.entities.Contractor.filter({ email: linkEmail.trim() }),
        base44.entities.CustomerProfile.filter({ email: linkEmail.trim() })
      ]);

      if (contractors && contractors.length > 0) {
        applyProfile('contractor', contractors[0]);
        setShowAccountLink(false);
      } else if (consumers && consumers.length > 0) {
        applyProfile('consumer', consumers[0]);
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
        owner_name: formData.owner_name,
        owner_phone: formData.phone,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        description: formData.description,
        categories: formData.categories,
        instagram_url: formData.instagram_url || undefined,
        facebook_url: formData.facebook_url || undefined,
        tiktok_url: formData.tiktok_url || undefined,
        gallery_images: formData.gallery_images.length > 0 ? formData.gallery_images : undefined,
        status: 'pending',
        is_active: false
      };

      if (linkedProfile) {
        if (linkedProfile.type === 'contractor') {
          shopPayload.linked_contractor_id = linkedProfile.data.id;
        } else {
          shopPayload.linked_consumer_profile_id = linkedProfile.data.id;
        }
      }

      const newShop = await base44.entities.MarketShop.create(shopPayload);
      setCreatedShop(newShop);
      setShowPaymentSelector(true);
      setSubmitLoading(false);

      // Track journey completion
      const shopSignupType = type === 'swap_meet' ? 'swap_meet_vendor' : 'farmers_market_vendor';
      const allFields = ['shop_name', 'owner_name', 'email', 'phone', 'city', 'state', 'zip', 'description'];
      const filled = allFields.filter(f => !!formData[f]?.trim());
      base44.functions.invoke('trackSignupJourney', {
        email: formData.email,
        signup_type: shopSignupType,
        event: 'profile_created',
        step: 1,
        step_name: 'Completed',
        fields_completed: filled,
        fields_missing: [],
        extra_data: {
          total_steps: 1,
          name: formData.owner_name,
          phone: formData.phone,
          location: `${formData.city}, ${formData.state}`,
          shop_name: formData.shop_name,
          shop_type: type,
        },
      }).catch(() => {});
    } catch (err) {
      console.error('Submission error:', err);
      alert('Error setting up your listing. Please try again.');
      setSubmitLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#EBEBEC" }}>
      {/* Ticker */}
      <div style={{ background: "#1A1A1B", padding: "6px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: 11, color: "#e0e0e0" }}>// MARKET SHOP · {type === 'swap_meet' ? 'SWAP MEET' : 'FARMERS MARKET'} SIGNUP</span>
        <span style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: 11, color: "#ffffff" }}>California · Nationwide</span>
      </div>
    <div style={{ padding: "16px 0 32px" }}>
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
          style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: 11, color: "#555", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 20, padding: 0 }}
        >
          <ChevronLeft style={{ width: 13, height: 13 }} /> Back
        </button>

        {/* Card */}
        <div style={{ background: "#fff", border: "0.5px solid #D0D0D2", borderRadius: 10, boxShadow: "3px 3px 0px #5C3500", padding: "28px 24px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #D0D0D2" }}>
            <div style={{ width: 48, height: 48, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: theme.bgLight }}>
              <theme.icon style={{ width: 24, height: 24, color: theme.color }} strokeWidth={1.5} />
            </div>
            <div>
              <h1 style={{ fontSize: "clamp(1.2rem, 3vw, 1.6rem)", fontWeight: 800, color: "#1A1A1B", margin: 0, fontStyle: "italic" }}>{theme.title}</h1>
              <p style={{ color: "#555", margin: "4px 0 0", fontSize: 13, fontStyle: "italic" }}>{theme.subtitle}</p>
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
            <div style={{ background: "#FBF5EC", border: "0.5px solid #D9B88A", borderRadius: 8, padding: "14px 16px", fontSize: 13, color: "#5C3500", fontStyle: "italic" }}>
              <strong>5% platform facilitation fee</strong> applies to transactions processed through SurfCoast Marketplace. Example: a $100 sale pays out $95 to you. See <a href="/Terms" style={{ color: "#5C3500", fontWeight: 700 }}>Terms of Service</a> for full details.
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
    </div>
  );
}