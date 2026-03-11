import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, AlertTriangle } from 'lucide-react';

export default function MinorHoursTracker({ contractor }) {
  if (!contractor?.is_minor) return null;

  const { data: hoursStatus } = useQuery({
    queryKey: ['minor-hours', contractor.id],
    queryFn: async () => {
      const resp = await base44.functions.invoke('checkMinorHoursLimit', {
        contractorId: contractor.id
      });
      return resp?.data || resp;
    },
    refetchInterval: 60000, // Check every minute
  });

  const hoursUsed = hoursStatus?.hours_used || 0;
  const hoursRemaining = hoursStatus?.hours_remaining ?? 20;
  const isLocked = hoursStatus?.locked;
  const percentageUsed = (hoursUsed / 20) * 100;

  if (isLocked) {
    return (
      <Card className="p-5 bg-red-50 border-red-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-1">Account Temporarily Locked</h3>
            <p className="text-sm text-red-800 mb-2">
              You've reached your 20-hour weekly work limit for minors under California labor law.
            </p>
            <p className="text-xs text-red-700">
              <strong>Unlocks:</strong> {new Date(hoursStatus.locked_until).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-5 ${percentageUsed > 80 ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-900">Weekly Hours</span>
          </div>
          <Badge className={percentageUsed > 80 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}>
            {hoursUsed} / 20 hours
          </Badge>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all ${percentageUsed > 80 ? 'bg-amber-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-600">
          {hoursRemaining > 0
            ? `${hoursRemaining} hours remaining this week`
            : 'Limit reached — account will lock after current jobs complete'}
        </p>
        {percentageUsed > 80 && (
          <div className="flex gap-2 p-2 bg-white border border-amber-200 rounded text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            California child labor law limits you to 20 hours/week during school months.
          </div>
        )}
      </div>
    </Card>
  );
}