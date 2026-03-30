import React from 'react';
import { useLocationStats } from '@/hooks/useLocationStats';
import { Star, Loader2, AlertCircle } from 'lucide-react';

const StatRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
    <span className="text-sm text-slate-600">{label}</span>
    <div className="flex items-center gap-1">
      <span className="font-semibold text-slate-900">{value}</span>
      <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
    </div>
  </div>
);

export default function LocationStatsCard({ locationName, locationType = 'swap_meet' }) {
  const { data: stats, isLoading, error } = useLocationStats(locationName, locationType);

  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200 flex gap-2">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-700">Failed to load location stats</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="mb-4">
        <h3 className="font-bold text-slate-900">{stats.location_name}</h3>
        <p className="text-sm text-slate-500">{stats.total_ratings} ratings</p>
      </div>

      <StatRow label="Overall Experience" value={stats.overall_experience} />
      <StatRow label="Cleanliness" value={stats.cleanliness} />
      <StatRow label="Safety & Security" value={stats.safety_security} />
      <StatRow label="Foot Traffic" value={stats.foot_traffic} />
      <StatRow label="Space & Layout" value={stats.space_layout} />
      <StatRow label="Environment Comfort" value={stats.environment_comfort} />
      <StatRow label="Customer Purchase Rate" value={stats.customer_purchase_rate} />
    </div>
  );
}