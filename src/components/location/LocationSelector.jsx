import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { getUserLocation, geocodeLocation, reverseGeocodeLocation } from './geolocationUtils';

export default function LocationSelector({ onLocationChange }) {
  const [location, setLocation] = useState(null);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [locationDisplay, setLocationDisplay] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    setLoading(true);
    setError('');
    const userLoc = await getUserLocation();
    if (userLoc) {
      setLocation(userLoc);
      // Try to get city/state from coordinates
      const reverseGeo = await reverseGeocodeLocation(userLoc.lat, userLoc.lon);
      if (reverseGeo) {
        setLocationDisplay(reverseGeo);
      }
      onLocationChange(userLoc);
    } else {
      setError('Unable to detect location. Please enter your city and state.');
    }
    setLoading(false);
  };

  const handleManualLocation = async () => {
    if (!city.trim() || !state.trim()) {
      setError('Please enter both city and state');
      return;
    }

    const locationQuery = `${city}, ${state}`;
    setLoading(true);
    setError('');
    const geocoded = await geocodeLocation(locationQuery);
    if (geocoded) {
      const loc = { lat: geocoded.lat, lon: geocoded.lon };
      setLocation(loc);
      setLocationDisplay(locationQuery);
      onLocationChange(loc);
      setState('');
      setCity('');
    } else {
      setError('Location not found. Check spelling and try again.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      {location ? (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <MapPin className="w-4 h-4" />
            <span>Searching near {locationDisplay || 'your location'}</span>
          </div>
          <button
            onClick={() => {
              setLocation(null);
              setState('');
              setCity('');
              setLocationDisplay('');
            }}
            className="text-xs text-green-600 hover:text-green-700 mt-1 underline"
          >
            Change location
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {error && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700 font-medium">{error}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600">Enter city and state:</p>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={loading}
                className="text-sm"
              />
              <Input
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                disabled={loading}
                className="text-sm"
              />
            </div>
            <Button
              onClick={handleManualLocation}
              disabled={loading || !city.trim() || !state.trim()}
              className="w-full"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                'Set Location'
              )}
            </Button>
          </div>

          <div className="relative flex items-center gap-2">
            <div className="flex-1 border-t border-slate-300"></div>
            <span className="text-xs text-slate-500 px-2">or</span>
            <div className="flex-1 border-t border-slate-300"></div>
          </div>

          <Button
            onClick={detectLocation}
            disabled={loading}
            variant="outline"
            className="w-full"
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Detecting...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Auto-Detect My Location
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}