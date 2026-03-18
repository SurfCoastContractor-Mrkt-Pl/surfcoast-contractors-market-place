import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingBag, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

const CATEGORIES = [
  'Produce', 'Baked Goods', 'Crafts', 'Clothing',
  'Electronics', 'Collectibles', 'Food & Beverage', 'Health & Wellness', 'Other'
];

const PAYMENT_METHODS = ['Cash', 'Venmo', 'Zelle', 'Card', 'Other'];

const SHOP_TYPES = [
  { value: 'farmers_market', label: 'Farmers Market' },
  { value: 'swap_meet', label: 'Swap Meet' },
  { value: 'both', label: 'Both' },
];

const WAIVER_ITEMS = [
  {
    key: 'federal',
    label: 'Federal Compliance',
    text: 'I confirm I am aware of and will comply with all applicable federal laws governing the sale of goods and services, including but not limited to FTC regulations, FDA food safety rules, and consumer protection laws.',
  },
  {
    key: 'state',
    label: 'State Compliance',
    text: 'I confirm I am aware of and will comply with all state laws applicable to my location, including sales tax collection, cottage food laws, resale permits, and any state-specific vendor licensing requirements.',
  },
  {
    key: 'local',
    label: 'Local Permits & Regulations',
    text: 'I confirm I hold or will obtain all required local permits, business licenses, health permits, and any event-specific vendor approvals required by my city, county, or market operator.',
  },
  {
    key: 'platform_terms',
    label: 'Platform Terms',
    text: 'I agree to SurfCoast Marketplace\'s Terms of Service and understand that this platform is a connection tool only and does not employ, endorse, or guarantee any vendor, product, or service listed herein.',
  },
  {
    key: 'liability',
    label: 'Liability Waiver',
    text: 'I understand and agree that SurfCoast Marketplace, its administrators, partners, and affiliates are NOT responsible for any damages, injuries, illness, sickness, or death arising from any product, service, or interaction facilitated through this platform. I waive any and all claims against SurfCoast Marketplace to the fullest extent permitted by law.',
  },
  {
    key: 'no_responsibility',
    label: 'No Platform Responsibility',
    text: 'I acknowledge that customers and guests using this platform are solely responsible for researching, vetting, and making their own decisions regarding vendors, products, and services. SurfCoast Marketplace makes no warranties, express or implied, regarding any vendor or listing.',
  },
];

// ── Step 1: Shop Info ──────────────────────────────────────────────────────
function ShopInfoStep({ form, onChange }) {
  const toggle = (field, value) => {
    const current = form[field] || [];
    onChange(field, current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Shop Name *</label>
        <input
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.shop_name}
          onChange={e => onChange('shop_name', e.target.value)}
          placeholder="e.g. Sunshine Farm Stand"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Shop Type *</label>
        <div className="flex flex-wrap gap-2">
          {SHOP_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange('shop_type', value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                form.shop_type === value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.city}
            onChange={e => onChange('city', e.target.value)}
            placeholder="City"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">State *</label>
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.state}
            onChange={e => onChange('state', e.target.value)}
            placeholder="CA"
            maxLength={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">ZIP *</label>
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.zip}
            onChange={e => onChange('zip', e.target.value)}
            placeholder="92101"
            maxLength={10}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Shop Description</label>
        <textarea
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
          value={form.description}
          onChange={e => onChange('description', e.target.value)}
          placeholder="Tell customers about your shop…"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Categories (select all that apply)</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => toggle('categories', cat)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                (form.categories || []).includes(cat)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Products / Services Summary</label>
        <textarea
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
          value={form.products_summary}
          onChange={e => onChange('products_summary', e.target.value)}
          placeholder="Briefly describe what you sell or offer…"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Payment Methods Accepted</label>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map(method => (
            <button
              key={method}
              type="button"
              onClick={() => toggle('payment_methods', method)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                (form.payment_methods || []).includes(method)
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-green-400'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Waiver ─────────────────────────────────────────────────────────
function WaiverStep({ checked, onToggle }) {
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 font-medium">
        All boxes must be checked to proceed.
      </div>
      {WAIVER_ITEMS.map(({ key, label, text }) => (
        <label
          key={key}
          className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            checked[key] ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                checked[key] ? 'bg-blue-600 border-blue-600' : 'border-slate-400'
              }`}
            >
              {checked[key] && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-800 mb-1">{label}</p>
            <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
          </div>
          <input
            type="checkbox"
            className="sr-only"
            checked={!!checked[key]}
            onChange={() => onToggle(key)}
          />
        </label>
      ))}
      <p className="text-xs italic text-slate-500 pt-1">
        By completing registration, you electronically sign and agree to all terms above. This agreement is legally binding and timestamped with your IP address.
      </p>
    </div>
  );
}

// ── Step 3: Confirmation ───────────────────────────────────────────────────
function ConfirmationStep() {
  const navigate = useNavigate();
  return (
    <div className="text-center py-8 space-y-6">
      <div className="text-7xl">🎉</div>
      <div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Your MarketShop is live!</h3>
        <p className="text-slate-600 max-w-sm mx-auto">
          You can now switch between your profiles from your Account dashboard.
        </p>
      </div>
      <Button
        onClick={() => navigate('/Dashboard')}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8"
      >
        Go to Dashboard
      </Button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
const STEPS = ['Shop Info', 'Legal & Waiver', 'Confirmation'];

export default function MarketShopSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    shop_name: '',
    shop_type: '',
    city: '',
    state: '',
    zip: '',
    description: '',
    categories: [],
    products_summary: '',
    payment_methods: [],
  });

  const [waiverChecked, setWaiverChecked] = useState(
    Object.fromEntries(WAIVER_ITEMS.map(w => [w.key, false]))
  );

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const allWaiversChecked = Object.values(waiverChecked).every(Boolean);

  const validateStep1 = () => {
    if (!form.shop_name.trim()) return 'Shop name is required.';
    if (!form.shop_type) return 'Please select a shop type.';
    if (!form.city.trim()) return 'City is required.';
    if (!form.state.trim()) return 'State is required.';
    if (!form.zip.trim()) return 'ZIP code is required.';
    return null;
  };

  const handleNext = async () => {
    setError('');
    if (step === 0) {
      const err = validateStep1();
      if (err) { setError(err); return; }
      setStep(1);
    } else if (step === 1) {
      if (!allWaiversChecked) { setError('Please check all boxes to continue.'); return; }
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const user = await base44.auth.me();
      if (!user) { navigate('/'); return; }

      const now = new Date().toISOString();

      const shop = await base44.entities.MarketShop.create({
        email: user.email,
        ...form,
        waiver_accepted_at: now,
        is_active: true,
      });

      await base44.entities.MarketWaiverLog.create({
        user_email: user.email,
        profile_type: 'MarketShop',
        shop_id: shop.id,
        accepted_at: now,
        checkboxes_accepted: WAIVER_ITEMS.map(w => w.key),
      });

      setStep(2);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">MarketShop Signup</h1>
            <p className="text-sm text-slate-500">Farmers Market & Swap Meet vendors</p>
          </div>
        </div>

        {/* Step Indicator */}
        {step < 2 && (
          <div className="flex items-center gap-2 mb-8">
            {STEPS.slice(0, 2).map((label, i) => (
              <React.Fragment key={label}>
                <div className={`flex items-center gap-2 ${i <= step ? 'text-blue-600' : 'text-slate-400'}`}>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                    i < step ? 'bg-blue-600 border-blue-600 text-white'
                    : i === step ? 'border-blue-600 text-blue-600'
                    : 'border-slate-300 text-slate-400'
                  }`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{label}</span>
                </div>
                {i < 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-blue-600' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {step === 0 && (
            <>
              <h2 className="text-lg font-bold text-slate-800 mb-6">Step 1 — Shop Info</h2>
              <ShopInfoStep form={form} onChange={handleChange} />
            </>
          )}
          {step === 1 && (
            <>
              <h2 className="text-lg font-bold text-slate-800 mb-1">Legal Compliance & Platform Waiver</h2>
              <p className="text-sm text-slate-500 mb-6">Read and check each item carefully.</p>
              <WaiverStep
                checked={waiverChecked}
                onToggle={key => setWaiverChecked(prev => ({ ...prev, [key]: !prev[key] }))}
              />
            </>
          )}
          {step === 2 && <ConfirmationStep />}

          {/* Error */}
          {error && (
            <p className="mt-4 text-sm text-red-600 font-medium">{error}</p>
          )}

          {/* Navigation */}
          {step < 2 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              <Button
                variant="ghost"
                onClick={() => step === 0 ? navigate(-1) : setStep(0)}
                className="text-slate-600"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {step === 0 ? 'Back' : 'Previous'}
              </Button>
              <Button
                onClick={handleNext}
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting…</>
                ) : step === 1 ? (
                  <>Complete Signup <CheckCircle2 className="w-4 h-4 ml-2" /></>
                ) : (
                  <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}