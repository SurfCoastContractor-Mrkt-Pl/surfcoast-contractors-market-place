import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Clock, MapPin, DollarSign, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import JobCard from './JobCard';
import OfflineJobCard from './OfflineJobCard';

export default function MyDayView({ contractor, selectedDate }) {
  const today = selectedDate || new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  const { isOnline, loadAndCacheScopes } = useOfflineSync(contractor?.email);

  // Fetch scopes for this contractor for today
  const { data: scopes = [], isLoading } = useQuery({
    queryKey: ['myDayScopes', contractor?.id, dateStr],
    queryFn: async () => {
      if (!contractor?.email) return [];
      return await loadAndCacheScopes();
    },
    enabled: !!contractor?.email,
  });

  // Filter for today
  const todayScopes = scopes.filter(
    (scope) =>
      scope.agreed_work_date === dateStr && scope.status !== 'cancelled'
  );

  const jobCount = todayScopes.length;
  const approvedCount = todayScopes.filter((s) => s.status === 'approved').length;
  const totalEarnings = todayScopes.reduce((sum, s) => sum + (s.cost_amount || 0), 0);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-semibold">Total Jobs</p>
              <p className="text-3xl font-bold text-blue-900">{jobCount}</p>
            </div>
            <Clock className="w-10 h-10 text-blue-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-semibold">Approved</p>
              <p className="text-3xl font-bold text-green-900">{approvedCount}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-semibold">Est. Earnings</p>
              <p className="text-3xl font-bold text-orange-900">${totalEarnings.toFixed(0)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-orange-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Jobs Today</h2>
        {jobCount === 0 ? (
          <div className="bg-slate-50 rounded-lg p-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No jobs scheduled for today.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {todayScopes.map((scope) => (
              isOnline ? (
                <JobCard key={scope.id} scope={scope} contractor={contractor} />
              ) : (
                <OfflineJobCard key={scope.id} scope={scope} contractor={contractor} isOnline={isOnline} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}