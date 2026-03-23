import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Locate, Filter, X, Loader2, SlidersHorizontal, MapPin } from 'lucide-react';
import ShopMapPopup from '@/components/consumer/ShopMapPopup';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom colored pin icons
function makeIcon(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -42],
  });
}

const ICONS = {
  farmers_market: makeIcon('#16a34a'),
  swap_meet: makeIcon('#d97706'),
  both: makeIcon('#2563eb'),
  selected: makeIcon('#7c3aed'),
  default: makeIcon('#64748b'),
};

const FILTER_TYPES = [
  { key: 'all', label: 'All Shops' },
  { key: 'farmers_market', label: "Farmer's Market" },
  { key: 'swap_meet', label: 'Swap Meet' },
  { key: 'both', label: 'Both' },
];

// Geocode city+state using Nominatim (rate-limited, cached)
const geocodeCache = {};
async function geocode(city, state) {
  const key = `${city},${state}`;
  if (geocodeCache[key]) return geocodeCache[key];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(`${city}, ${state}`)}&countrycodes=us`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (data?.[0]) {
      const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      geocodeCache[key] = result;
      return result;
    }
  } catch {}
  return null;
}

// Map controller to fly to a location
function MapFlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Dismiss popup when clicking elsewhere on map
function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: onMapClick });
  return null;
}

export default function ConsumerMarketMap() {
  const [selectedShop, setSelectedShop] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const [geocodedShops, setGeocodedShops] = useState([]);
  const [geocoding, setGeocoding] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all active shops
  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['market-shops-map'],
    queryFn: () => base44.entities.MarketShop.filter({ is_active: true }),
  });

  // Fetch listings for selected shop
  const { data: selectedListings = [] } = useQuery({
    queryKey: ['shop-listings-map', selectedShop?.id],
    queryFn: () => base44.entities.MarketListing.filter({ shop_id: selectedShop.id }),
    enabled: !!selectedShop?.id,
  });

  // Geocode all shops that have city+state
  useEffect(() => {
    if (!shops.length) return;
    setGeocoding(true);
    let cancelled = false;

    const run = async () => {
      const results = [];
      // Batch with small delay to respect Nominatim rate limit (1 req/sec)
      for (const shop of shops) {
        if (cancelled) break;
        if (!shop.city || !shop.state) continue;
        const coords = await geocode(shop.city, shop.state);
        if (coords) {
          // Add slight jitter to prevent exact overlaps
          results.push({
            ...shop,
            lat: coords.lat + (Math.random() - 0.5) * 0.004,
            lng: coords.lng + (Math.random() - 0.5) * 0.004,
          });
        }
        await new Promise(r => setTimeout(r, 350)); // rate limit
      }
      if (!cancelled) {
        setGeocodedShops(results);
        setGeocoding(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [shops]);

  // Filtered shops
  const visibleShops = geocodedShops.filter(shop => {
    const typeMatch = filterType === 'all' || shop.shop_type === filterType;
    const searchMatch = !searchQuery ||
      shop.shop_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.categories?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return typeMatch && searchMatch;
  });

  const handleLocate = useCallback(() => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const loc = [coords.latitude, coords.longitude];
        setUserLocation(loc);
        setFlyTarget({ center: loc, zoom: 11 });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }, []);

  const handleShopClick = useCallback((shop) => {
    setSelectedShop(shop);
    setFlyTarget({ center: [shop.lat, shop.lng], zoom: 14 });
  }, []);

  const handleMapClick = useCallback(() => {
    setSelectedShop(null);
  }, []);

  return (
    <div className="h-screen flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Top control bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 z-10 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search shops, cities, categories…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter toggle (mobile) */}
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`sm:hidden flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${showFilters ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Filter pills — desktop always visible */}
        <div className="hidden sm:flex items-center gap-1.5">
          {FILTER_TYPES.map(f => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                filterType === f.key
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Locate me */}
        <button
          onClick={handleLocate}
          disabled={locating}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Locate className="w-4 h-4" />}
          <span className="hidden sm:inline">Near Me</span>
        </button>

        {/* Count badge */}
        <span className="hidden md:inline text-xs text-slate-500 whitespace-nowrap">
          {geocoding ? (
            <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Loading…</span>
          ) : (
            `${visibleShops.length} shop${visibleShops.length !== 1 ? 's' : ''}`
          )}
        </span>
      </div>

      {/* Mobile filter pills */}
      {showFilters && (
        <div className="sm:hidden bg-white border-b border-slate-200 px-4 py-2 flex gap-2 overflow-x-auto">
          {FILTER_TYPES.map(f => (
            <button
              key={f.key}
              onClick={() => { setFilterType(f.key); setShowFilters(false); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                filterType === f.key
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[37.7749, -119.4194]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {flyTarget && <MapFlyTo center={flyTarget.center} zoom={flyTarget.zoom} />}
          <MapClickHandler onMapClick={handleMapClick} />

          {/* User location dot */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={L.divIcon({
                html: `<div style="width:16px;height:16px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 0 0 3px rgba(37,99,235,0.3)"></div>`,
                className: '',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })}
            />
          )}

          {/* Shop markers */}
          {visibleShops.map(shop => (
            <Marker
              key={shop.id}
              position={[shop.lat, shop.lng]}
              icon={selectedShop?.id === shop.id ? ICONS.selected : (ICONS[shop.shop_type] || ICONS.default)}
              eventHandlers={{ click: () => handleShopClick(shop) }}
            />
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-6 right-4 z-[999] bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 p-3 text-xs space-y-1.5 hidden sm:block">
          <p className="font-semibold text-slate-700 mb-2">Map Legend</p>
          {[
            { color: '#16a34a', label: "Farmer's Market" },
            { color: '#d97706', label: 'Swap Meet' },
            { color: '#2563eb', label: 'Both Types' },
            { color: '#7c3aed', label: 'Selected' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-slate-600">{label}</span>
            </div>
          ))}
        </div>

        {/* Loading overlay */}
        {(isLoading || geocoding) && !geocodedShops.length && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-[999] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-slate-600 font-medium">Loading market shops…</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !geocoding && visibleShops.length === 0 && geocodedShops.length === 0 && (
          <div className="absolute inset-0 z-[900] flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-center max-w-xs mx-4">
              <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">No shops found</p>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters.</p>
            </div>
          </div>
        )}

        {/* Shop popup card */}
        {selectedShop && (
          <ShopMapPopup
            shop={selectedShop}
            listings={selectedListings}
            onClose={() => setSelectedShop(null)}
          />
        )}
      </div>
    </div>
  );
}