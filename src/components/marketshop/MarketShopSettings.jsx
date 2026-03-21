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
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Shop Settings</h3>
      <p className="text-xs text-slate-500 -mt-3">To update your cover photo or profile photo, use the camera icons on the shop header above.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1">Shop Name</label>
          <input
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
            value={form.shop_name}
            onChange={e => setForm(p => ({ ...p, shop_name: e.target.value }))}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-2">Shop Type</label>
          <div className="flex flex-wrap gap-2">
            {SHOP_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm(p => ({ ...p, shop_type: value }))}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  form.shop_type === value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-blue-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">City</label>
          <input className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">State</label>
            <input className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} maxLength={2} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">ZIP</label>
            <input className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500" value={form.zip} onChange={e => setForm(p => ({ ...p, zip: e.target.value }))} />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
          <textarea className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none placeholder-slate-500" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1">Products / Services Summary</label>
          <textarea className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none placeholder-slate-500" value={form.products_summary} onChange={e => setForm(p => ({ ...p, products_summary: e.target.value }))} />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-2">Categories</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat} type="button" onClick={() => toggle('categories', cat)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  (form.categories || []).includes(cat) ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-blue-500'
                }`}
              >{cat}</button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-2">Payment Methods</label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map(method => (
              <button key={method} type="button" onClick={() => toggle('payment_methods', method)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  (form.payment_methods || []).includes(method) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-emerald-500'
                }`}
              >{method}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance status */}
      {shop?.waiver_accepted_at && (
        <div className="border border-emerald-800/50 bg-emerald-950/30 rounded-xl p-4">
          <p className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Compliance Acknowledged
          </p>
          <p className="text-xs text-emerald-500/80 mb-3">
            Accepted on {new Date(shop.waiver_accepted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="space-y-1.5">
            {WAIVER_ITEMS.map(w => (
              <div key={w.key} className="flex items-center gap-2 text-xs text-emerald-500/70">
                <CheckCircle2 className="w-3 h-3" /> {w.label}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white px-6 gap-2">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}