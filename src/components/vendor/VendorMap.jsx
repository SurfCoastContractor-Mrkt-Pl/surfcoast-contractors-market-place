import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue with Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

export default function VendorMap({ vendors, onVendorSelect, selectedFilters }) {
  const [mapCenter, setMapCenter] = useState([39.8283, -98.5795]); // US center
  const [mapZoom, setMapZoom] = useState(4);
  const [filteredVendors, setFilteredVendors] = useState(vendors);

  useEffect(() => {
    // Filter vendors based on selected filters
    let filtered = vendors;

    if (selectedFilters?.marketType && selectedFilters.marketType !== 'all') {
      filtered = filtered.filter(v => 
        selectedFilters.marketType === 'farmers_market' 
          ? v.shop_type === 'farmers_market' || v.shop_type === 'both'
          : v.shop_type === 'swap_meet' || v.shop_type === 'both'
      );
    }

    if (selectedFilters?.location) {
      filtered = filtered.filter(v =>
        `${v.city}, ${v.state}`.toLowerCase().includes(selectedFilters.location.toLowerCase())
      );
    }

    if (selectedFilters?.category && selectedFilters.category !== 'all') {
      filtered = filtered.filter(v =>
        v.categories && v.categories.includes(selectedFilters.category)
      );
    }

    if (selectedFilters?.minRating) {
      filtered = filtered.filter(v =>
        (v.average_rating || 0) >= selectedFilters.minRating
      );
    }

    setFilteredVendors(filtered);
  }, [vendors, selectedFilters]);

  const handleVendorMarkerClick = (vendor) => {
    setMapCenter([parseFloat(vendor.latitude) || 39.8283, parseFloat(vendor.longitude) || -98.5795]);
    setMapZoom(13);
    if (onVendorSelect) {
      onVendorSelect(vendor);
    }
  };

  // Get geolocation to center map on user
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
          setMapZoom(11);
        },
        () => {
          // Geolocation failed, keep default center
        }
      );
    }
  }, []);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-slate-200">
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapController center={mapCenter} zoom={mapZoom} />
        
        {filteredVendors.map((vendor) => {
          const lat = parseFloat(vendor.latitude);
          const lng = parseFloat(vendor.longitude);
          
          if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;
          
          return (
            <Marker 
              key={vendor.id} 
              position={[lat, lng]}
              onClick={() => handleVendorMarkerClick(vendor)}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">{vendor.shop_name}</p>
                  <p className="text-slate-600">{vendor.city}, {vendor.state}</p>
                  {vendor.average_rating && (
                    <p className="text-slate-700">⭐ {vendor.average_rating.toFixed(1)}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}