import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, Loader2, Search, AlertCircle } from 'lucide-react';
import { trackEvent, EVENTS } from '@/lib/analytics';

const STATE_REGEX = /^[a-z]{2}$/i;

export default function LocationSelector({ locationType, onLocationSelect, onClose }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomEntry, setShowCustomEntry] = useState(false);
  const [customLocation, setCustomLocation] = useState({ name: '', city: '', state: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const filtered = await base44.entities.SwapMeetLocationRating.filter(
          { location_type: locationType },
          '-created_date',
          500
        );

        // Get unique locations efficiently
        const locationMap = new Map();
        filtered.forEach(rating => {
          if (!locationMap.has(rating.location_name)) {
            locationMap.set(rating.location_name, {
              location_name: rating.location_name,
              city: rating.city,
              state: rating.state,
              location_type: rating.location_type,
            });
          }
        });

        setLocations(Array.from(locationMap.values()));
      } catch {
        setError('Failed to load locations');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [locationType]);

  const filteredLocations = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return locations.filter(loc =>
      loc.location_name.toLowerCase().includes(term) ||
      loc.city.toLowerCase().includes(term)
    );
  }, [locations, searchTerm]);

  const isCustomFormValid = useMemo(
    () => customLocation.name.trim() && customLocation.city.trim() && STATE_REGEX.test(customLocation.state),
    [customLocation]
  );

  const handleLocationSelect = useCallback((location) => {
    trackEvent(EVENTS.LOCATION_SELECTED, {
      location: location.location_name,
      type: locationType,
    });
    onLocationSelect(location);
  }, [locationType, onLocationSelect]);

  const handleCustomSubmit = useCallback(() => {
    setError('');

    if (!isCustomFormValid) {
      setError('Location name, city, and 2-letter state code required');
      return;
    }

    const newLocation = {
      location_name: customLocation.name.trim(),
      city: customLocation.city.trim(),
      state: customLocation.state.toUpperCase(),
      location_type: locationType,
    };

    trackEvent(EVENTS.LOCATION_SELECTED, {
      location: newLocation.location_name,
      type: locationType,
      custom: true,
    });

    onLocationSelect(newLocation);
  }, [isCustomFormValid, customLocation, locationType, onLocationSelect]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        {!showCustomEntry ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Select a Location to Rate</h2>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                  aria-label="Close"
                >
                  <Search className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>

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

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 text-sm">No locations found</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2">
                {filteredLocations.map((location) => (
                  <button
                    key={location.location_name}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-orange-50 hover:border-orange-300 transition-colors focus:ring-2 focus:ring-orange-400"
                  >
                    <div className="font-medium text-slate-900">{location.location_name}</div>
                    <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {location.city}, {location.state?.toUpperCase() || 'N/A'}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2 mt-4">
              {onClose && (
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => { setShowCustomEntry(true); setError(''); }}
                className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Can't find your location? Add it
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add a New Location</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Downtown Market"
                  value={customLocation.name}
                  onChange={(e) => { setCustomLocation({ ...customLocation, name: e.target.value }); setError(''); }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={customLocation.city}
                    onChange={(e) => { setCustomLocation({ ...customLocation, city: e.target.value }); setError(''); }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    placeholder="CA"
                    value={customLocation.state}
                    onChange={(e) => { setCustomLocation({ ...customLocation, state: e.target.value.toUpperCase() }); setError(''); }}
                    maxLength="2"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowCustomEntry(false); setError(''); }}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCustomSubmit}
                disabled={!isCustomFormValid}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Location
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}