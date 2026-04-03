import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, Star, Clock, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function SupplyHousesFinder({ contractor, isOpen, onClose, inline = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [supplyHouses, setSupplyHouses] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleFindNearby = async () => {
    setLoading(true);
    setError(null);
    setSupplyHouses([]);

    try {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await base44.functions.invoke('findNearbySupplyHouses', {
                              latitude,
                              longitude,
                              trade_specialty: contractor?.trade_specialty || 'general',
                              radius: 10
                            });

            if (response.data.success) {
              setSupplyHouses(response.data.supplies_houses || []);
              setSearched(true);
            } else {
              setError(response.data.error || 'Failed to find supply houses');
            }
          } catch (err) {
            setError(err.message || 'Error searching for supply houses');
          }
          setLoading(false);
        },
        (err) => {
          setError(`Please enable location access to find nearby supply houses`);
          setLoading(false);
        }
      );
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const content = (
    <div className="space-y-6">
      {!searched && (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">
            Find {contractor?.trade_specialty || 'trade'}-specific supply houses near you
          </p>
          <Button
            onClick={handleFindNearby}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Finding locations...
              </>
            ) : (
              'Use My Location'
            )}
          </Button>
        </div>
      )}

      {error && (
        <div className="bg-red-950 border border-red-700 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-semibold">Error</p>
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        </div>
      )}

      {searched && supplyHouses.length > 0 && (
        <div className="space-y-3">
          <p className="text-slate-300 text-sm font-semibold">
            Found {supplyHouses.length} supply houses within 10 miles
          </p>
          {supplyHouses.map((house, idx) => (
            <a
              key={idx}
              href={`https://www.google.com/maps/search/${encodeURIComponent(house.name + ' ' + house.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-blue-500 transition cursor-pointer block"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-semibold">{house.name}</h3>
                <span className="text-blue-400 text-sm font-medium">
                  {house.distance_miles} mi
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-3">{house.address}</p>
              <div className="flex gap-4 text-xs">
                {house.rating && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    {house.rating}
                    {house.user_ratings_total > 0 && (
                      <span className="text-slate-500">({house.user_ratings_total})</span>
                    )}
                  </div>
                )}
                {house.open_now !== null && (
                  <div className={`flex items-center gap-1 ${house.open_now ? 'text-green-400' : 'text-red-400'}`}>
                    <Clock className="w-3 h-3" />
                    {house.open_now ? 'Open now' : 'Closed'}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}

      {searched && supplyHouses.length === 0 && !error && (
        <div className="text-center py-8 text-slate-400">
          No supply houses found nearby. Try searching in a different location.
        </div>
      )}

      {searched && (
        <div className="border-t border-slate-700 pt-4">
          <Button onClick={handleFindNearby} variant="outline" className="w-full">
            Search Again
          </Button>
        </div>
      )}
    </div>
  );

  if (inline) {
    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-blue-400" />
          <h2 className="text-white text-lg font-semibold">Find Supply Houses</h2>
        </div>
        {content}
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-slate-900 border-slate-700">
        <DialogHeader className="border-b border-slate-700 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              Find Supply Houses
            </DialogTitle>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>
        <div className="max-h-[600px] overflow-y-auto">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}