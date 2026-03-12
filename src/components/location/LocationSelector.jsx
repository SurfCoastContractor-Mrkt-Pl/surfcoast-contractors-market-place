import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { getUserLocation, geocodeLocation } from './geolocationUtils';

export default function LocationSelector({ onLocationChange }) {
  const [location, setLocation] = useState(null);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [manualInput, setManualInput] = useState('');

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    setLoading(true);
    setError('');
    const userLoc = await getUserLocation();
    if (userLoc) {
      setLocation(userLoc);
      onLocationChange(userLoc);
    } else {
      setError('Unable to detect location. Please enter manually.');
    }
    setLoading(false);
  };

  const handleManualLocation = async () => {
    const locationQuery = [state, city, zipCode].filter(v => v.trim()).join(', ');
    if (!locationQuery) {
      setError('Please enter at least a city, state, or ZIP code');
      return;
    }

    setLoading(true);
    setError('');
    const geocoded = await geocodeLocation(locationQuery);
    if (geocoded) {
      const loc = { lat: geocoded.lat, lon: geocoded.lon };
      setLocation(loc);
      onLocationChange(loc);
      setState('');
      setCity('');
      setZipCode('');
    } else {
      setError('Location not found. Try a different combination.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      {location ? (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <MapPin className="w-4 h-4" />
            <span>
              Location detected{' '}
              {manualInput ? `(${manualInput})` : '(from your device)'}
            </span>
          </div>
          <button
            onClick={() => {
              setLocation(null);
              setState('');
              setCity('');
              setZipCode('');
              setManualInput('');
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
              <p className="text-sm text-amber-700 font-medium mb-2">{error}</p>
              <p className="text-xs text-amber-600">Enter your location details below:</p>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600">Enter your location:</p>
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                disabled={loading}
                className="text-sm"
              />
              <Input
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={loading}
                className="text-sm"
              />
              <Input
                placeholder="ZIP code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                disabled={loading}
                className="text-sm"
              />
            </div>
            <Button
              onClick={handleManualLocation}
              disabled={loading || (!state.trim() && !city.trim() && !zipCode.trim())}
              className="w-full"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                'Search Location'
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
                Use My Current Location
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}