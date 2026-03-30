import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, Loader2, Search } from 'lucide-react';
import { trackEvent, EVENTS } from '@/lib/analytics';

export default function LocationSelector({ locationType, onLocationSelect, onClose }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomEntry, setShowCustomEntry] = useState(false);
  const [customLocation, setCustomLocation] = useState({ name: '', city: '', state: '' });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const filtered = await base44.entities.SwapMeetLocationRating.filter(
          { location_type: locationType },
          '-created_date',
          500
        );

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

  const handleCustomSubmit = () => {
    if (!customLocation.name || !customLocation.city || !customLocation.state) {
      alert('Please fill in all fields');
      return;
    }
    const newLocation = {
      location_name: customLocation.name,
      city: customLocation.city,
      state: customLocation.state,
      location_type: locationType,
    };
    trackEvent(EVENTS.LOCATION_SELECTED, {
      location: newLocation.location_name,
      type: locationType,
      custom: true,
    });
    onLocationSelect(newLocation);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        {!showCustomEntry ? (
          <>
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
                onClick={() => {
                  trackEvent(EVENTS.LOCATION_SELECTED, {
                    location: location.location_name,
                    type: locationType,
                  });
                  onLocationSelect(location);
                }}
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

        <button
          onClick={() => setShowCustomEntry(true)}
          className="w-full mt-3 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
        >
          Can't find your location? Add it
        </button>
        </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add a New Location</h2>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location Name</label>
                <input
                  type="text"
                  placeholder="e.g., Downtown Market, Riverside Swap Meet"
                  value={customLocation.name}
                  onChange={(e) => setCustomLocation({ ...customLocation, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={customLocation.city}
                    onChange={(e) => setCustomLocation({ ...customLocation, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="CA"
                    value={customLocation.state}
                    onChange={(e) => setCustomLocation({ ...customLocation, state: e.target.value.toUpperCase() })}
                    maxLength="2"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCustomEntry(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={handleCustomSubmit}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
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