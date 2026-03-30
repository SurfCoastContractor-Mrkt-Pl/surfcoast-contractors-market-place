import React from 'react';
import { useTopLocations } from '@/hooks/useLocationStats';
import { Star, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopLocationsWidget({ locationType = 'swap_meet', limit = 5 }) {
  const { data: locations, isLoading, error } = useTopLocations(locationType, limit);

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg border border-slate-200 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200 flex gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        <p className="text-red-700">Failed to load top locations</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Top Rated Locations</h2>
      <div className="space-y-3">
        {locations?.map((loc, idx) => (
          <div key={loc.location_name} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{loc.location_name}</h3>
              <p className="text-xs text-slate-500">{loc.city}, {loc.state}</p>
              <p className="text-xs text-slate-600 mt-1">{loc.total_ratings} ratings</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="font-bold text-slate-900">{loc.overall_experience}</span>
              <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}