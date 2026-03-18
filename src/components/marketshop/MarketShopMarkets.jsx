import React, { useState } from 'react';
import { MapPin, Plus, Trash2, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MarketShopMarkets({ shop, onUpdate }) {
  const markets = shop?.markets || [];
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ location: '', dates: '', booth_number: '' });

  const handleAdd = async () => {
    if (!form.location.trim()) return;
    setSaving(true);
    const updated = [...markets, { ...form, id: Date.now().toString() }];
    await onUpdate({ markets: updated });
    setForm({ location: '', dates: '', booth_number: '' });
    setShowForm(false);
    setSaving(false);
  };

  const handleRemove = async (id) => {
    const updated = markets.filter(m => m.id !== id);
    await onUpdate({ markets: updated });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-800">My Markets</h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(v => !v)} className="gap-1">
          <Plus className="w-4 h-4" /> Add Market
        </Button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Location / Market Name *</label>
              <input
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Del Mar Farmers Market"
                value={form.location}
                onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Booth #</label>
              <input
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. B-12"
                value={form.booth_number}
                onChange={e => setForm(p => ({ ...p, booth_number: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Dates / Schedule</label>
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Every Saturday, 7am–1pm"
              value={form.dates}
              onChange={e => setForm(p => ({ ...p, dates: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAdd} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      )}

      {markets.length === 0 && !showForm ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center py-14 text-center">
          <MapPin className="w-10 h-10 text-slate-300 mb-3" />
          <p className="font-medium text-slate-500">No markets added yet</p>
          <p className="text-sm text-slate-400 mt-1">Add the markets or events where you set up your booth.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {markets.map(m => (
            <div key={m.id} className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-4">
              <MapPin className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-800">{m.location}</p>
                {m.dates && (
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> {m.dates}
                  </p>
                )}
                {m.booth_number && (
                  <p className="text-xs text-slate-500 mt-0.5">Booth: {m.booth_number}</p>
                )}
              </div>
              <button onClick={() => handleRemove(m.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}