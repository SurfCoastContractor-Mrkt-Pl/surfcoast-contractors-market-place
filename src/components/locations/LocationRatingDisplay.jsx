import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, Loader2 } from 'lucide-react';

export default function LocationRatingDisplay({ location }) {
  const [ratings, setRatings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const locationKey = location.location_name || `${location.city}, ${location.state}`;
        const locationRatings = await base44.entities.SwapMeetLocationRating.filter({
          location_name: locationKey,
        });

        if (locationRatings && locationRatings.length > 0) {
          setRatings(locationRatings);
          
          const avg = (
            locationRatings.reduce((sum, r) => sum + r.overall_experience, 0) / locationRatings.length
          ).toFixed(1);
          setAverageRating(avg);
        }
      } catch (err) {
        console.error('Error fetching ratings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!ratings || ratings.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500">
        <p className="text-sm">No ratings yet for this location</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= Math.round(averageRating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300'
              }`}
            />
          ))}
        </div>
        <div>
          <span className="text-lg font-bold text-slate-900">{averageRating}</span>
          <span className="text-sm text-slate-500"> ({ratings.length} ratings)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          { key: 'cleanliness', label: 'Cleanliness' },
          { key: 'environment_comfort', label: 'Comfort' },
          { key: 'customer_purchase_rate', label: 'Purchase Rate' },
          { key: 'safety_security', label: 'Safety' },
          { key: 'foot_traffic', label: 'Traffic' },
          { key: 'space_layout', label: 'Layout' },
        ].map(({ key, label }) => {
          const avg = (
            ratings.reduce((sum, r) => sum + r[key], 0) / ratings.length
          ).toFixed(1);
          return (
            <div key={key} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600">{label}</span>
              <span className="font-semibold text-slate-900">{avg}/5</span>
            </div>
          );
        })}
      </div>

      {ratings[0]?.comments && (
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs font-semibold text-amber-900 mb-1">Latest Feedback</p>
          <p className="text-sm text-amber-800">{ratings[0].comments}</p>
        </div>
      )}
    </div>
  );
}