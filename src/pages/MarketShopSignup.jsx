import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft } from 'lucide-react';

const SHOP_TYPES = [
  { value: 'farmers_market', label: 'Farmers Market Vendor' },
  { value: 'swap_meet', label: 'Swap Meet Vendor' },
  { value: 'food_vendor', label: 'Food Vendor' },
  { value: 'artisan_craft', label: 'Artisan/Craft' },
  { value: 'other', label: 'Other' }
];

const CATEGORIES = [
  'Produce', 'Meat/Poultry', 'Dairy', 'Baked Goods', 'Prepared Foods',
  'Clothing', 'Jewelry', 'Home Decor', 'Art/Craft', 'Plants', 'Other'
];

export default function MarketShopSignup() {
  const [step, setStep] = useState('account-check'); // account-check, link, or form
  const [accountChoice, setAccountChoice] = useState(null);
  const [linkedProfile, setLinkedProfile] = useState(null);
  const [email, setEmail] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [formData, setFormData] = useState({
    shop_name: '',
    shop_type: '',
    description: '',
    city: '',
    state: '',
    zip: '',
    instagram_url: '',
    website_url: '',
    categories: [],
    email: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleAccountChoice = (choice) => {
    setAccountChoice(choice);
    if (choice === 'no') {
      setStep('form');
      setFormData(prev => ({ ...prev, email: '' }));
    } else {
      setStep('link');
    }
  };

  const handleSearchProfile = async () => {
    if (!email.trim()) {
      setSearchError('Please enter an email');
      return;
    }
    setSearchLoading(true);
    setSearchError('');
    try {
      const contractors = await base44.entities.Contractor.filter({ email: email.trim() });
      const customers = await base44.entities.CustomerProfile.filter({ email: email.trim() });

      if (contractors && contractors.length > 0) {
        setLinkedProfile({ type: 'contractor', data: contractors[0], email: email.trim() });
        setFormData(prev => ({ ...prev, email: email.trim() }));
        setStep('form');
      } else if (customers && customers.length > 0) {
        setLinkedProfile({ type: 'customer', data: customers[0], email: email.trim() });
        setFormData(prev => ({ ...prev, email: email.trim() }));
        setStep('form');
      } else {
        setSearchError('No SurfCoast account found with this email');
      }
    } catch (err) {
      setSearchError('Error searching for account');
    }
    setSearchLoading(false);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const shopData = {
        shop_name: formData.shop_name,
        shop_type: formData.shop_type,
        description: formData.description,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        categories: formData.categories,
        email: linkedProfile ? linkedProfile.email : formData.email,
        is_active: false
      };

      await base44.entities.MarketShop.create(shopData);
      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      alert('Error creating shop. Please try again.');
    }
    setSubmitLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-3 text-slate-900">Shop Submitted!</h2>
          <p className="text-slate-600 mb-6">
            Thank you for registering your shop. Our team will review your submission and get back to you within 2-3 business days.
          </p>
          <Button onClick={() => window.location.href = '/'} className="w-full">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => {
            if (step === 'form' || step === 'link') {
              setStep('account-check');
              setAccountChoice(null);
              setLinkedProfile(null);
              setSearchError('');
            } else {
              window.location.href = '/';
            }
          }}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2 text-slate-900">Vendor Registration</h1>
          <p className="text-slate-600 mb-8">Join SurfCoast Marketplace as a market vendor</p>

          {step === 'account-check' && (
            <div>
              <h2 className="text-lg font-semibold mb-6 text-slate-800">Do you already have a SurfCoast account?</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => handleAccountChoice('yes')}
                  className="flex-1 py-6 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                >
                  Yes, link my account
                </Button>
                <Button
                  onClick={() => handleAccountChoice('no')}
                  variant="outline"
                  className="flex-1 py-6 text-base font-semibold"
                >
                  No, I'm new here
                </Button>
              </div>
            </div>
          )}

          {step === 'link' && (
            <div>
              <h2 className="text-lg font-semibold mb-6 text-slate-800">Link Your Account</h2>
              <p className="text-slate-600 mb-4">Enter the email address for your SurfCoast account</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full"
                  />
                </div>
                {searchError && <p className="text-sm text-red-600">{searchError}</p>}
                {linkedProfile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      <span className="font-semibold">Found:</span> {linkedProfile.data.full_name || linkedProfile.data.name}
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleSearchProfile}
                  disabled={searchLoading}
                  className="w-full"
                >
                  {searchLoading ? 'Searching...' : 'Search & Link Account'}
                </Button>
                {linkedProfile && (
                  <Button
                    onClick={() => setStep('form')}
                    variant="outline"
                    className="w-full"
                  >
                    Continue with this account
                  </Button>
                )}
              </div>
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {linkedProfile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    Account linked: <span className="font-semibold">{linkedProfile.email}</span>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Shop Name *</label>
                <Input
                  type="text"
                  name="shop_name"
                  value={formData.shop_name}
                  onChange={handleFormChange}
                  placeholder="Your vendor shop name"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Shop Type *</label>
                <select
                  name="shop_type"
                  value={formData.shop_type}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select shop type</option>
                  {SHOP_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Tell us about your shop and what you offer"
                  required
                  rows="4"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">City *</label>
                  <Input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    placeholder="City"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">State *</label>
                  <Input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleFormChange}
                    placeholder="CA"
                    maxLength="2"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ZIP *</label>
                  <Input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleFormChange}
                    placeholder="90210"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Categories</label>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="categories"
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Instagram URL (optional)</label>
                <Input
                  type="url"
                  name="instagram_url"
                  value={formData.instagram_url}
                  onChange={handleFormChange}
                  placeholder="https://instagram.com/yourshop"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Website URL (optional)</label>
                <Input
                  type="url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleFormChange}
                  placeholder="https://yourwebsite.com"
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                disabled={submitLoading}
                className="w-full py-3 text-base font-semibold"
              >
                {submitLoading ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}