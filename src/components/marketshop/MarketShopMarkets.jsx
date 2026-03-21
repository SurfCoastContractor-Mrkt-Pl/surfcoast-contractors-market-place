import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, Trash2, CalendarDays, ExternalLink, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Set your Google Maps API key here (enable Maps JavaScript API + Places API in Google Cloud Console)
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

function loadGoogleMapsScript(apiKey) {
  if (window.google?.maps?.places) return Promise.resolve();
  if (document.getElementById('google-maps-script')) {
    return new Promise(resolve => {
      const check = setInterval(() => {
        if (window.google?.maps?.places) { clearInterval(check); resolve(); }
      }, 100);
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function PlacesAutocomplete({ value, onChange, onPlaceSelect }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const key = GOOGLE_MAPS_API_KEY;
    if (!key) { setReady(false); return; }
    loadGoogleMapsScript(key).then(() => setReady(true)).catch(() => setReady(false));
  }, []);

  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return;
    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode'],
    });
    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place.geometry) return;
      const name = place.name || '';
      const address = place.formatted_address || '';
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
      onPlaceSelect({ name, address, lat, lng, mapsUrl, display: name + (address ? ` — ${address}` : '') });
    });
    autocompleteRef.current = ac;
  }, [ready]);

  return (
    <input
      ref={inputRef}
      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={ready ? "Search for a market or address…" : "Enter market name or address"}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
}

const emptyForm = {
  location_name: '',
  address: '',
  lat: null,
  lng: null,
  maps_url: '',
  booth_number: '',
  event_dates: [], // array of { date, start_time, end_time, note }
};

const emptyDate = { date: '', start_time: '', end_time: '', note: '' };

export default function MarketShopMarkets({ shop, onUpdate }) {
  const markets = shop?.markets || [];
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [locationInput, setLocationInput] = useState('');

  const handlePlaceSelect = (place) => {
    setLocationInput(place.name);
    setForm(p => ({
      ...p,
      location_name: place.name,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      maps_url: place.mapsUrl,
    }));
  };

  const addDate = () => setForm(p => ({ ...p, event_dates: [...p.event_dates, { ...emptyDate }] }));
  const updateDate = (i, field, val) => setForm(p => {
    const dates = [...p.event_dates];
    dates[i] = { ...dates[i], [field]: val };
    return { ...p, event_dates: dates };
  });
  const removeDate = (i) => setForm(p => ({ ...p, event_dates: p.event_dates.filter((_, idx) => idx !== i) }));

  const handleAdd = async () => {
    if (!form.location_name.trim() && !locationInput.trim()) return;
    setSaving(true);
    const entry = {
      ...form,
      location_name: form.location_name || locationInput,
      id: Date.now().toString(),
    };
    await onUpdate({ markets: [...markets, entry] });
    setForm({ ...emptyForm });
    setLocationInput('');
    setShowForm(false);
    setSaving(false);
  };

  const handleRemove = async (id) => {
    await onUpdate({ markets: markets.filter(m => m.id !== id) });
  };

  // Sort upcoming dates first
  const sortedDates = (dates) =>
    [...(dates || [])].sort((a, b) => new Date(a.date) - new Date(b.date));

  const upcomingMarkets = markets.filter(m => {
    if (!m.event_dates?.length) return true;
    return m.event_dates.some(d => !d.date || new Date(d.date) >= new Date());
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-800">My Markets</h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(v => !v)} className="gap-1">
          <Plus className="w-4 h-4" /> Add Market
        </Button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 space-y-4">
          {/* Location search */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Market / Location *</label>
              <PlacesAutocomplete
                value={locationInput}
                onChange={(v) => { setLocationInput(v); setForm(p => ({ ...p, location_name: v, address: '', lat: null, lng: null, maps_url: '' })); }}
                onPlaceSelect={handlePlaceSelect}
              />
              {form.address && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-blue-400" /> {form.address}
                </p>
              )}
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

          {/* Event Dates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-600">Event Dates</label>
              <button onClick={addDate} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Date
              </button>
            </div>
            {form.event_dates.length === 0 && (
              <p className="text-xs text-slate-400 italic">No dates added — click "Add Date" to schedule appearances.</p>
            )}
            <div className="space-y-2">
              {form.event_dates.map((d, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
                  <div>
                    <label className="block text-xs text-slate-500 mb-0.5">Date</label>
                    <input type="date" className="w-full border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" value={d.date} onChange={e => updateDate(i, 'date', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-0.5">Start</label>
                    <input type="time" className="w-full border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" value={d.start_time} onChange={e => updateDate(i, 'start_time', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-0.5">End</label>
                    <input type="time" className="w-full border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" value={d.end_time} onChange={e => updateDate(i, 'end_time', e.target.value)} />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-0.5">Note</label>
                      <input className="w-full border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" placeholder="Optional" value={d.note} onChange={e => updateDate(i, 'note', e.target.value)} />
                    </div>
                    <button onClick={() => removeDate(i)} className="text-red-400 hover:text-red-600 pb-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setForm({ ...emptyForm }); setLocationInput(''); }}>Cancel</Button>
            <Button size="sm" onClick={handleAdd} disabled={saving || (!form.location_name && !locationInput)} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? 'Saving…' : 'Save Market'}
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
            <div key={m.id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-slate-800">{m.location_name || m.location}</p>
                    {m.booth_number && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Booth {m.booth_number}</span>
                    )}
                    {m.maps_url && (
                      <a href={m.maps_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  {m.address && (
                    <p className="text-xs text-slate-400 mt-0.5">{m.address}</p>
                  )}
                  {/* Legacy dates field */}
                  {m.dates && !m.event_dates?.length && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" /> {m.dates}
                    </p>
                  )}
                  {/* Structured event dates */}
                  {m.event_dates?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {sortedDates(m.event_dates).map((d, i) => {
                        const isPast = d.date && new Date(d.date) < new Date(new Date().toDateString());
                        return (
                          <div key={i} className={`flex items-center gap-2 text-xs ${isPast ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                            <CalendarDays className="w-3 h-3 flex-shrink-0" />
                            <span>
                              {d.date ? new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}
                              {d.start_time && ` · ${d.start_time}`}
                              {d.end_time && `–${d.end_time}`}
                              {d.note && ` · ${d.note}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <button onClick={() => handleRemove(m.id)} className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}