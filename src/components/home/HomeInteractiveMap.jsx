import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Filter, X, Loader2, AlertCircle, Store, Wrench } from 'lucide-react';

const CATEGORY_LABELS = {
  electronics: 'Electronics',
  tools: 'Tools',
  sports_equipment: 'Sports Equipment',
  books_media: 'Books & Media',
  home_decor: 'Home Decor',
  clothing_accessories: 'Clothing & Accessories',
  collectibles: 'Collectibles',
  handmade_crafts: 'Handmade Crafts',
  vintage_antiques: 'Vintage & Antiques',
  jewelry: 'Jewelry',
  misc: 'Miscellaneous',
  other: 'Other',
};

const SHOP_TYPE_LABELS = {
  farmers_market: "Farmer's Market",
  swap_meet: 'Swap Meet',
  both: 'Both',
};

// Custom icons for different entity types
const createShopIcon = (shopType) => {
  const colors = {
    farmers_market: '#10b981',
    swap_meet: '#f59e0b',
    both: '#8b5cf6',
  };

  return L.divIcon({
    html: `<div style="background-color: ${colors[shopType] || '#3b82f6'}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
      <span style="color: white; font-size: 18px;">🛍️</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const createContractorIcon = () => {
  return L.divIcon({
    html: `<div style="background-color: #ef4444; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
      <span style="color: white; font-size: 18px;">🔧</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const createUserIcon = () => {
  return L.divIcon({
    html: `<div style="background-color: #3b82f6; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
      <span style="color: white; font-size: 14px;">📍</span>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const MapController = ({ userLocation }) => {
  const map = useMap();
  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 13);
    }
  }, [userLocation, map]);
  return null;
};

export default function HomeInteractiveMap() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [selectedShopType, setSelectedShopType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(15); // miles
  const [entityTypeFilter, setEntityTypeFilter] = useState('all'); // all, vendors, contractors

  // Get user's location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationError(null);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          // Fallback to San Diego area
           setUserLocation({ lat: 32.7157, lng: -117.1611 });
          setLocationError('Using default location. Enable geolocation for better results.');
        }
      );
    } else {
      setUserLocation({ lat: 32.7157, lng: -117.1611 });
      setLocationError('Geolocation not supported.');
    }
  }, []);

  // Fetch all active shops and contractors
  const { data: allShops = [] } = useQuery({
    queryKey: ['nearby-shops'],
    queryFn: () => base44.entities.MarketShop.filter({ is_active: true, status: 'active' }),
    staleTime: 60000,
  });

  const { data: allContractors = [] } = useQuery({
    queryKey: ['nearby-contractors'],
    queryFn: () => base44.entities.Contractor.filter({ available: true }),
    staleTime: 60000,
  });

  // Calculate distance helper
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter shops by distance and selected filters
  const nearbyShops = allShops.filter(shop => {
    if (!userLocation || !shop.latitude || !shop.longitude) return false;
    if (entityTypeFilter === 'contractors') return false;

    const lat1 = userLocation.lat;
    const lon1 = userLocation.lng;
    const lat2 = parseFloat(shop.latitude);
    const lon2 = parseFloat(shop.longitude);

    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    if (distance > nearbyRadius * 1.60934) return false;

    // Apply filters
    if (selectedShopType && shop.shop_type !== selectedShopType) return false;
    if (selectedCategory && !(shop.categories || []).includes(selectedCategory)) return false;

    return true;
  });

  // Filter contractors by distance
  const nearbyContractors = allContractors.filter(contractor => {
    if (!userLocation || !contractor.location) return false;
    if (entityTypeFilter === 'vendors') return false;

    // For contractors, we can only filter by text-based location proximity
    // This is a simplified approach - in production, store lat/lng for contractors
    return true;
  }).slice(0, 10);

  if (!userLocation) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto mb-2" />
        <p className="text-slate-600">Loading map...</p>
      </Card>
    );
  }

  // Get unique categories from nearby shops
  const availableCategories = Array.from(
    new Set(nearbyShops.flatMap(shop => shop.categories || []))
  ).sort();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {entityTypeFilter === 'contractors' ? 'Nearby Contractors' : entityTypeFilter === 'vendors' ? 'Nearby Vendors' : 'Browse By Location'}
          </h3>
          <p className="text-sm text-slate-300 mt-0.5">
            {entityTypeFilter === 'contractors' ? `${nearbyContractors.length} contractor${nearbyContractors.length !== 1 ? 's' : ''}` : `${nearbyShops.length} vendor${nearbyShops.length !== 1 ? 's' : ''}`} within {nearbyRadius} miles
          </p>
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Error message */}
      {locationError && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">{locationError}</p>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card className="p-4 space-y-4 bg-slate-50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Distance */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Distance: {nearbyRadius} miles</label>
               <input
                 type="range"
                 min="3"
                 max="30"
                 value={nearbyRadius}
                 onChange={(e) => setNearbyRadius(parseInt(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            {/* Shop Type */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase mb-2 block">Market Type</label>
              <select
                value={selectedShopType}
                onChange={(e) => setSelectedShopType(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white"
              >
                <option value="">All Types</option>
                <option value="farmers_market">Farmers Market</option>
                <option value="swap_meet">Swap Meet</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase mb-2 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white"
              >
                <option value="">All Categories</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{CATEGORY_LABELS[cat] || cat}</option>
                ))}
              </select>
            </div>
          </div>

          {(selectedShopType || selectedCategory || nearbyRadius !== 25) && (
            <button
              onClick={() => {
                setSelectedShopType('');
                setSelectedCategory('');
                setNearbyRadius(15);
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear filters
            </button>
          )}
        </Card>
      )}

      {/* Map */}
      <Card className="overflow-hidden">
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={13}
          style={{ height: '400px', width: '100%' }}
          className="rounded-lg"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <MapController userLocation={userLocation} />

          {/* User location marker */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
            <Popup>Your Location</Popup>
          </Marker>

          {/* Shop markers */}
          {nearbyShops.map((shop) => {
            if (!shop.latitude || !shop.longitude) return null;
            const lat = parseFloat(shop.latitude);
            const lng = parseFloat(shop.longitude);

            return (
              <Marker
                key={shop.id}
                position={[lat, lng]}
                icon={createShopIcon(shop.shop_type)}
              >
                <Popup>
                  <div className="space-y-2 min-w-[200px]">
                    <p className="font-semibold text-slate-900">{shop.shop_name}</p>
                    <p className="text-xs text-slate-600">{shop.city}, {shop.state}</p>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {SHOP_TYPE_LABELS[shop.shop_type] || shop.shop_type}
                      </Badge>
                    </div>
                    {shop.products_summary && (
                      <p className="text-xs text-slate-700">{shop.products_summary}</p>
                    )}
                    <button
                      onClick={() => window.location.href = `/MarketShopProfile?id=${shop.id}`}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
                    >
                      View Profile →
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </Card>

      {/* Results List */}
      {nearbyShops.length === 0 ? (
        <Card className="p-8 text-center">
          <Store className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No vendors found</p>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search distance.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {nearbyShops.slice(0, 6).map((shop) => {
            const lat1 = userLocation.lat;
            const lon1 = userLocation.lng;
            const lat2 = parseFloat(shop.latitude);
            const lon2 = parseFloat(shop.longitude);
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = (R * c * 0.621371).toFixed(1); // Convert km to miles

            return (
              <Card key={shop.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = `/MarketShopProfile?id=${shop.id}`}>
                <div className="flex gap-3">
                  {shop.logo_url && (
                    <img src={shop.logo_url} alt={shop.shop_name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{shop.shop_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{distance} miles away</p>
                    <div className="flex gap-1 flex-wrap mt-1">
                      <Badge variant="outline" className="text-xs">{SHOP_TYPE_LABELS[shop.shop_type]}</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}