import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { getUserLocation, geocodeLocation } from './geolocationUtils';

export default function LocationSelector({ onLocationChange }) {
  const [location, setLocation] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
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
      onLocationChange(userLoc);
    } else {
      setError('Unable to detect location. Please enter manually.');
    }
    setLoading(false);
  };

  const handleManualLocation = async () => {
    if (!manualInput.trim()) {
      setError('Please enter a city or ZIP code');
      return;
    }

    setLoading(true);
    setError('');
    const geocoded = await geocodeLocation(manualInput);
    if (geocoded) {
      const loc = { lat: geocoded.lat, lon: geocoded.lon };
      setLocation(loc);
      onLocationChange(loc);
      setManualInput('');
    } else {
      setError('Location not found. Try a different city or ZIP code.');
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
              setManualInput('');
            }}
            className="text-xs text-green-600 hover:text-green-700 mt-1 underline"
          >
            Change location
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {error && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700 font-medium mb-2">{error}</p>
              <p className="text-xs text-amber-600">Please enter your city or ZIP code below:</p>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Enter city or ZIP code"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleManualLocation()}
              disabled={loading}
              autoFocus={!!error}
            />
            <Button
              onClick={handleManualLocation}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </div>
          {!error && (
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
                  Use My Location
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}