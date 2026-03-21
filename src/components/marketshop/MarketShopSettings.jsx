import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import ImageCropUploader from './ImageCropUploader';

const SHOP_TYPES = [
  { value: 'farmers_market', label: 'Farmers Market' },
  { value: 'swap_meet', label: 'Swap Meet' },
  { value: 'both', label: 'Both' },
];

const CATEGORIES = [
  'Produce', 'Baked Goods', 'Crafts', 'Clothing',
  'Electronics', 'Collectibles', 'Food & Beverage', 'Health & Wellness', 'Other'
];

const PAYMENT_METHODS = ['Cash', 'Venmo', 'Zelle', 'Card', 'Other'];

const WAIVER_ITEMS = [
  { key: 'federal', label: 'Federal Compliance' },
  { key: 'state', label: 'State Compliance' },
  { key: 'local', label: 'Local Permits & Regulations' },
  { key: 'platform_terms', label: 'Platform Terms' },
  { key: 'liability', label: 'Liability Waiver' },
  { key: 'no_responsibility', label: 'No Platform Responsibility' },
];

export default function MarketShopSettings({ shop, onUpdate }) {
  const [form, setForm] = useState({
    shop_name: shop?.shop_name || '',
    shop_type: shop?.shop_type || '',
    city: shop?.city || '',
    state: shop?.state || '',
    zip: shop?.zip || '',
    description: shop?.description || '',
    products_summary: shop?.products_summary || '',
    categories: shop?.categories || [],
    payment_methods: shop?.payment_methods || [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (field, value) => {
    const current = form[field] || [];
    setForm(p => ({
      ...p,
      [field]: current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePhotoSave = async (field, url) => {
    await onUpdate({ [field]: url });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-base font-semibold text-slate-800">Shop Settings</h3>

      {/* Photo Uploads */}
      <div className="space-y-5 border border-slate-200 rounded-xl p-4 bg-slate-50">
        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Shop Photos</p>

        {/* Cover Banner */}
        <ImageCropUploader
          label="Cover Banner"
          currentUrl={shop?.banner_url}
          aspectRatio={4}
          shape="rect"
          hint="Recommended: wide landscape photo (4:1 ratio). Drag & zoom to crop."
          onSave={(url) => handlePhotoSave('banner_url', url)}
        />

        {/* Profile / Booth Photo */}
        <ImageCropUploader
          label="Profile / Booth Photo"
          currentUrl={shop?.logo_url}
          aspectRatio={1}
          shape="circle"
          hint="Square photo of your booth or logo. Drag & zoom to crop."
          onSave={(url) => handlePhotoSave('logo_url', url)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Shop Name</label>
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.shop_name}
            onChange={e => setForm(p => ({ ...p, shop_name: e.target.value }))}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-2">Shop Type</label>
          <div className="flex flex-wrap gap-2">
            {SHOP_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm(p => ({ ...p, shop_type: value }))}
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

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
          <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">State</label>
            <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} maxLength={2} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">ZIP</label>
            <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.zip} onChange={e => setForm(p => ({ ...p, zip: e.target.value }))} />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
          <textarea className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Products / Services Summary</label>
          <textarea className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none" value={form.products_summary} onChange={e => setForm(p => ({ ...p, products_summary: e.target.value }))} />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-2">Categories</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat} type="button" onClick={() => toggle('categories', cat)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  (form.categories || []).includes(cat) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                }`}
              >{cat}</button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-2">Payment Methods</label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map(method => (
              <button key={method} type="button" onClick={() => toggle('payment_methods', method)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  (form.payment_methods || []).includes(method) ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-600 border-slate-300 hover:border-green-400'
                }`}
              >{method}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance status */}
      {shop?.waiver_accepted_at && (
        <div className="border border-green-200 bg-green-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Compliance Acknowledged
          </p>
          <p className="text-xs text-green-700 mb-3">
            Accepted on {new Date(shop.waiver_accepted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="space-y-1.5">
            {WAIVER_ITEMS.map(w => (
              <div key={w.key} className="flex items-center gap-2 text-xs text-green-700">
                <CheckCircle2 className="w-3 h-3" /> {w.label}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 gap-2">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}