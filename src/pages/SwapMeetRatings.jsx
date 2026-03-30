import React, { useState } from 'react';
import { Star, Loader2, MapPin, BarChart3 } from 'lucide-react';
import { useTopLocations } from '@/hooks/useLocationStats';
import LocationSelector from '@/components/locations/LocationSelector';
import LocationRatingForm from '@/components/locations/LocationRatingForm';

export default function SwapMeetRatings() {
  const { data: locationsList, isLoading: loading } = useTopLocations('swap_meet', 100);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showSelector, setShowSelector] = useState(false);

  const locations = locationsList || [];

  const StarRating = ({ value }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'text-slate-300'
          }`}
        />
      ))}
      <span className="ml-2 font-semibold text-slate-900">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Rate Button */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-orange-500" />
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Swap Meet Ratings</h1>
            </div>
            <p className="text-slate-600 max-w-2xl">
              Real ratings from vendors like you. Find the best swap meets based on cleanliness, customer traffic, and overall experience.
            </p>
          </div>
          <button
            onClick={() => setShowSelector(true)}
            className="px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
          >
            Rate a Location
          </button>
        </div>



        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : locations.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No ratings yet for this filter</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {locations.map((location, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{location.location_name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      {location.city}, {location.state.toUpperCase()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-slate-900">{location.overall_avg}</div>
                    <div className="text-xs text-slate-500">{location.rating_count} ratings</div>
                  </div>
                </div>

                {/* Overall Rating */}
                <div className="mb-4">
                  <StarRating value={location.overall_avg} />
                </div>

                {/* Detail Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-100">
                  {[
                    { label: 'Cleanliness', value: location.cleanliness_avg },
                    { label: 'Comfort', value: location.comfort_avg },
                    { label: 'Purchase Rate', value: location.purchase_avg },
                    { label: 'Safety', value: location.safety_avg },
                    { label: 'Traffic', value: location.traffic_avg },
                    { label: 'Layout', value: location.layout_avg },
                  ].map(item => (
                    <div key={item.label} className="text-center">
                      <div className="text-xs text-slate-600 mb-1">{item.label}</div>
                      <div className="text-lg font-bold text-slate-900">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Location Selector Modal */}
        {showSelector && (
          <LocationSelector
            locationType="swap_meet"
            onLocationSelect={(location) => {
              setSelectedLocation(location);
              setShowSelector(false);
            }}
            onClose={() => setShowSelector(false)}
          />
        )}

        {/* Rating Form Modal */}
        {selectedLocation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <LocationRatingForm
                location={selectedLocation}
                onClose={() => setSelectedLocation(null)}
                onSave={() => {
                  setSelectedLocation(null);
                  window.location.reload();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}