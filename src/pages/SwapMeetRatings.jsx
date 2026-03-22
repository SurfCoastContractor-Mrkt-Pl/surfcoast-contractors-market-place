import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, Loader2, MapPin, BarChart3 } from 'lucide-react';

export default function SwapMeetRatings() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const allRatings = await base44.entities.SwapMeetLocationRating.list('', 1000);
        
        // Group by location and calculate averages
        const locationMap = {};
        allRatings.forEach(rating => {
          const key = rating.location_name;
          if (!locationMap[key]) {
            locationMap[key] = {
              location_name: rating.location_name,
              city: rating.city,
              state: rating.state,
              location_type: rating.location_type,
              ratings: [],
            };
          }
          locationMap[key].ratings.push(rating);
        });

        // Calculate aggregates
        const locationsList = Object.values(locationMap)
          .map(loc => {
            const ratings = loc.ratings;
            const overallAvg = (
              ratings.reduce((sum, r) => sum + r.overall_experience, 0) / ratings.length
            ).toFixed(1);

            return {
              ...loc,
              overall_avg: overallAvg,
              rating_count: ratings.length,
              cleanliness_avg: (
                ratings.reduce((sum, r) => sum + r.cleanliness, 0) / ratings.length
              ).toFixed(1),
              comfort_avg: (
                ratings.reduce((sum, r) => sum + r.environment_comfort, 0) / ratings.length
              ).toFixed(1),
              purchase_avg: (
                ratings.reduce((sum, r) => sum + r.customer_purchase_rate, 0) / ratings.length
              ).toFixed(1),
              safety_avg: (
                ratings.reduce((sum, r) => sum + r.safety_security, 0) / ratings.length
              ).toFixed(1),
              traffic_avg: (
                ratings.reduce((sum, r) => sum + r.foot_traffic, 0) / ratings.length
              ).toFixed(1),
              layout_avg: (
                ratings.reduce((sum, r) => sum + r.space_layout, 0) / ratings.length
              ).toFixed(1),
            };
          })
          .sort((a, b) => parseFloat(b.overall_avg) - parseFloat(a.overall_avg));

        setLocations(locationsList);
      } catch (err) {
        console.error('Error fetching ratings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);

  const filtered = filter === 'all' 
    ? locations 
    : locations.filter(l => l.location_type === filter);

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Swap Meet & Market Ratings</h1>
          </div>
          <p className="text-slate-600 max-w-2xl">
            Real ratings from vendors like you. Find the best locations based on cleanliness, customer traffic, and overall experience.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { value: 'all', label: 'All Locations' },
            { value: 'swap_meet', label: 'Swap Meets' },
            { value: 'farmers_market', label: 'Farmers Markets' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === tab.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No ratings yet for this filter</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((location, idx) => (
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
      </div>
    </div>
  );
}