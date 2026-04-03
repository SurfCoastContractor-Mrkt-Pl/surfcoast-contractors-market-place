import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';

export default function RouteOptimizer({ contractor, selectedDate }) {
  const today = selectedDate || new Date();
  const dateStr = today.toISOString().split('T')[0];

  // Fetch scopes for this date
  const { data: scopes = [], isLoading } = useQuery({
    queryKey: ['routeScopes', contractor?.id, dateStr],
    queryFn: async () => {
      if (!contractor?.email) return [];
      const allScopes = await base44.entities.ScopeOfWork.filter({
        contractor_email: contractor.email,
      });
      return allScopes.filter(
        (scope) => scope.agreed_work_date === dateStr && scope.status !== 'cancelled'
      );
    },
    enabled: !!contractor?.email,
  });

  const handleOpenInMaps = (location) => {
    if (typeof window !== 'undefined') {
      const encoded = encodeURIComponent(location);
      window.open(`https://maps.google.com/?q=${encoded}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-orange-600"></div>
      </div>
    );
  }

  if (scopes.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-slate-50 rounded-lg p-12 text-center">
          <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No jobs scheduled for route optimization today.</p>
        </div>
      </div>
    );
  }

  // Simple route ordering (by insertion order from DB)
  // In a real app, you'd calculate optimal routes using a routing API
  const optimizedRoute = [...scopes];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Route for Today</h2>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900">Route Guide</p>
          <p className="text-sm text-blue-700">
            Click on any job to open navigation. Optimize your order to minimize travel time.
          </p>
        </div>
      </div>

      {/* Route List */}
      <div className="space-y-4">
        {optimizedRoute.map((scope, idx) => (
          <div
            key={scope.id}
            className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Order Number */}
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                <span className="font-bold text-white">{idx + 1}</span>
              </div>

              {/* Job Details */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{scope.job_title}</h3>
                <p className="text-slate-600 text-sm mb-3">{scope.client_name}</p>

                {/* Navigation Button */}
                <button
                  onClick={() => handleOpenInMaps(scope.client_name)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-sm"
                >
                  <Navigation className="w-4 h-4" />
                  Open in Maps
                </button>
              </div>

              {/* Cost */}
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">${scope.cost_amount}</p>
                <p className="text-xs text-slate-600">{scope.cost_type}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg p-6 border border-blue-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-600 font-semibold">Total Jobs</p>
            <p className="text-3xl font-bold text-slate-900">{optimizedRoute.length}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600 font-semibold">Est. Earnings</p>
            <p className="text-3xl font-bold text-orange-600">
              ${optimizedRoute.reduce((sum, s) => sum + (s.cost_amount || 0), 0).toFixed(0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}