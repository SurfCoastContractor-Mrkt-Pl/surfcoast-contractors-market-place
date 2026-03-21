import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, Trash2, CalendarDays, Search, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EMPTY_FORM = {
  location: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  lat: null,
  lng: null,
  booth_number: '',
  date: '',
  start_time: '',
  end_time: '',
  notes: '',
};

function PlacesSearch({ value, onChange, onSelect }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const search = (q) => {
    clearTimeout(debounceRef.current);
    if (!q.trim() || q.length < 3) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(q)}`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 400);
  };

  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    onChange(v);
    search(v);
  };

  const handleSelect = (place) => {
    const addr = place.address || {};
    const name = place.display_name.split(',')[0];
    const road = addr.road || addr.pedestrian || '';
    const houseNum = addr.house_number || '';
    const street = houseNum ? `${houseNum} ${road}` : road;
    const city = addr.city || addr.town || addr.village || addr.county || '';
    const state = addr.state || '';
    const zip = addr.postcode || '';

    setQuery(name);
    onChange(name);
    setOpen(false);
    onSelect({
      location: name,
      address: street,
      city,
      state,
      zip,
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          className="w-full border border-slate-300 rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search market name or address…"
          value={query}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        {query && (
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500" onClick={() => { setQuery(''); onChange(''); setResults([]); setOpen(false); }}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
          {loading && <p className="px-4 py-3 text-xs text-slate-400">Searching…</p>}
          {!loading && results.map(place => (
            <button
              key={place.place_id}
              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b border-slate-100 last:border-0 transition-colors"
              onMouseDown={() => handleSelect(place)}
            >
              <p className="text-sm font-medium text-slate-800 truncate">{place.display_name.split(',')[0]}</p>
              <p className="text-xs text-slate-400 truncate">{place.display_name.split(',').slice(1).join(',').trim()}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MarketShopMarkets({ shop, onUpdate }) {
  const markets = shop?.markets || [];
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPast, setShowPast] = useState(false);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handlePlaceSelect = (placeData) => {
    setForm(p => ({ ...p, ...placeData }));
  };

  const handleAdd = async () => {
    if (!form.location.trim() && !form.address.trim()) return;
    setSaving(true);
    const entry = { ...form, id: Date.now().toString() };
    await onUpdate({ markets: [...markets, entry] });
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSaving(false);
  };

  const handleRemove = async (id) => {
    await onUpdate({ markets: markets.filter(m => m.id !== id) });
  };

  const upcomingMarkets = markets
    .filter(m => !m.date || new Date(m.date + 'T23:59:59') >= new Date())
    .sort((a, b) => (a.date || '9999') < (b.date || '9999') ? -1 : 1);

  const pastMarkets = markets
    .filter(m => m.date && new Date(m.date + 'T23:59:59') < new Date())
    .sort((a, b) => a.date > b.date ? -1 : 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-800">Market Appearances</h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(v => !v)} className="gap-1">
          <Plus className="w-4 h-4" /> Add Date
        </Button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 space-y-3">
          {/* Location search */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Market / Venue Name *</label>
            <PlacesSearch
              value={form.location}
              onChange={(v) => setForm(p => ({ ...p, location: v, address: '', city: '', state: '', zip: '', lat: null, lng: null }))}
              onSelect={handlePlaceSelect}
            />
            <p className="text-xs text-slate-400 mt-1">Type to search — selecting auto-fills address fields below.</p>
          </div>

          {/* Auto-filled address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">Street Address</label>
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="Auto-filled from search" value={form.address} onChange={e => setField('address', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="City" value={form.city} onChange={e => setField('city', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">State</label>
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="State" value={form.state} onChange={e => setField('state', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">ZIP</label>
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="ZIP" value={form.zip} onChange={e => setField('zip', e.target.value)} />
            </div>
          </div>

          {/* Date, times, booth */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Date *</label>
              <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={form.date} onChange={e => setField('date', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Start</label>
              <input type="time" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={form.start_time} onChange={e => setField('start_time', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">End</label>
              <input type="time" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={form.end_time} onChange={e => setField('end_time', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Booth #</label>
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="e.g. B-12" value={form.booth_number} onChange={e => setField('booth_number', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes (optional)</label>
            <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="e.g. Rain or shine, near the main entrance" value={form.notes} onChange={e => setField('notes', e.target.value)} />
          </div>

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>Cancel</Button>
            <Button size="sm" onClick={handleAdd} disabled={saving || (!form.location && !form.address)} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      )}

      {markets.length === 0 && !showForm ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center py-14 text-center">
          <CalendarDays className="w-10 h-10 text-slate-300 mb-3" />
          <p className="font-medium text-slate-500">No market dates yet</p>
          <p className="text-sm text-slate-400 mt-1">Add the markets or events where you'll set up your booth.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {upcomingMarkets.length === 0 && markets.length > 0 && (
            <p className="text-xs text-slate-400 text-center py-4">No upcoming dates — add one above.</p>
          )}
          {upcomingMarkets.map(m => <MarketCard key={m.id} m={m} onRemove={handleRemove} />)}
          {pastMarkets.length > 0 && (
            <div className="mt-4">
              <button className="text-xs text-slate-400 hover:text-slate-600 underline mb-2" onClick={() => setShowPast(v => !v)}>
                {showPast ? 'Hide' : 'Show'} {pastMarkets.length} past date{pastMarkets.length !== 1 ? 's' : ''}
              </button>
              {showPast && pastMarkets.map(m => <MarketCard key={m.id} m={m} onRemove={handleRemove} past />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

function MarketCard({ m, onRemove, past }) {
  const addressLine = [m.address, m.city, m.state, m.zip].filter(Boolean).join(', ');
  const timeRange = m.start_time ? `${formatTime(m.start_time)}${m.end_time ? ' – ' + formatTime(m.end_time) : ''}` : '';
  const mapsUrl = m.lat && m.lng
    ? `https://www.google.com/maps?q=${m.lat},${m.lng}`
    : addressLine ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine)}` : null;

  const dateLabel = m.date
    ? new Date(m.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  // Legacy support for old "dates" and "location" fields
  const displayName = m.location_name || m.location || addressLine;

  return (
    <div className={`flex items-start gap-3 bg-white border rounded-xl p-4 ${past ? 'opacity-50 border-slate-100' : 'border-slate-200'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${past ? 'bg-slate-100' : 'bg-blue-50'}`}>
        <MapPin className={`w-4 h-4 ${past ? 'text-slate-400' : 'text-blue-500'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm text-slate-800">{displayName}</p>
          {m.booth_number && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex-shrink-0">Booth {m.booth_number}</span>
          )}
        </div>
        {(dateLabel || timeRange) && (
          <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" /> {dateLabel}{timeRange ? ` · ${timeRange}` : ''}
          </p>
        )}
        {/* Legacy dates field */}
        {m.dates && !m.date && (
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" /> {m.dates}
          </p>
        )}
        {addressLine && <p className="text-xs text-slate-400 mt-0.5 truncate">{addressLine}</p>}
        {m.notes && <p className="text-xs text-slate-400 mt-0.5 italic">{m.notes}</p>}
        {mapsUrl && (
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 mt-1">
            <ExternalLink className="w-3 h-3" /> View on Google Maps
          </a>
        )}
      </div>
      <button onClick={() => onRemove(m.id)} className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}