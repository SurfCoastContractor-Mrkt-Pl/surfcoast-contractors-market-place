import React from 'react';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { useGpsTracking } from '@/hooks/useGpsTracking';

export default function GpsTracker({ onLocationCapture }) {
  const { location, tracking, accuracy, error, startTracking, stopTracking } = useGpsTracking();

  const handleCapture = () => {
    if (location) {
      onLocationCapture({
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy,
        timestamp: location.timestamp
      });
      stopTracking();
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
      <div className="flex items-center gap-2 mb-3">
        <Navigation className="w-5 h-5 text-blue-400" />
        <p className="text-white font-semibold">Job Location</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {location && (
        <div className="mb-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Latitude:</span>
            <span className="text-white font-mono">{location.latitude.toFixed(6)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Longitude:</span>
            <span className="text-white font-mono">{location.longitude.toFixed(6)}</span>
          </div>
          {accuracy && (
            <div className="flex justify-between">
              <span className="text-slate-400">Accuracy:</span>
              <span className={`font-semibold ${accuracy < 10 ? 'text-green-400' : accuracy < 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                ±{accuracy}m
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {!tracking ? (
          <button
            onClick={startTracking}
            className="flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Start Tracking
          </button>
        ) : (
          <>
            <button
              onClick={stopTracking}
              className="flex-1 bg-slate-700 text-white rounded-lg py-3 font-semibold"
            >
              Stop Tracking
            </button>
            <button
              onClick={handleCapture}
              disabled={!location}
              className="flex-1 bg-green-600 disabled:opacity-50 text-white rounded-lg py-3 font-semibold"
            >
              Capture Location
            </button>
          </>
        )}
      </div>
    </div>
  );
}