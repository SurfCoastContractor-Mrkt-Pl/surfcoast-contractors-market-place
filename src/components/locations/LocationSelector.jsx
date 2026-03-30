import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, Loader2, Search } from 'lucide-react';

export default function LocationSelector({ locationType, onLocationSelect, onClose }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const allRatings = await base44.entities.SwapMeetLocationRating.list('', 1000);
        const filtered = allRatings.filter(r => r.location_type === locationType);

        // Get unique locations
        const locationMap = {};
        filtered.forEach(rating => {
          const key = rating.location_name;
          if (!locationMap[key]) {
            locationMap[key] = {
              location_name: rating.location_name,
              city: rating.city,
              state: rating.state,
              location_type: rating.location_type,
            };
          }
        });

        setLocations(Object.values(locationMap));
      } catch (err) {
        console.error('Error fetching locations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [locationType]);

  const filtered = locations.filter(loc =>
    loc.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Select a Location to Rate</h2>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search location or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 text-sm">No locations found</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filtered.map((location) => (
              <button
                key={location.location_name}
                onClick={() => onLocationSelect(location)}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-orange-50 hover:border-orange-300 transition-colors"
              >
                <div className="font-medium text-slate-900">{location.location_name}</div>
                <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {location.city}, {location.state.toUpperCase()}
                </div>
              </button>
            ))}
          </div>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}