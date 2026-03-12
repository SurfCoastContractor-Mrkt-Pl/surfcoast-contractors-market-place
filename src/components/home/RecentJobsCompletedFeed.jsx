import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle2, MapPin, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function RecentJobsCompletedFeed() {
  const { data: completedScopes, isLoading } = useQuery({
    queryKey: ['completedScopes'],
    queryFn: async () => {
      const scopes = await base44.entities.ScopeOfWork.filter(
        { status: 'closed' },
        '-closed_date',
        12
      );
      return scopes || [];
    },
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const recentJobs = completedScopes?.slice(0, 6) || [];

  if (recentJobs.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Recently Completed Work</h3>
        <p className="text-slate-600">Real projects, real results from verified professionals</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {recentJobs.map((scope) => (
          <Card key={scope.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {scope.job_together_photo_url && (
              <div className="relative h-40 bg-slate-100 overflow-hidden">
                <img
                  src={scope.job_together_photo_url}
                  alt={scope.job_title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            )}

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 line-clamp-2">{scope.job_title}</h4>
                  <p className="text-sm text-slate-500 mt-0.5">{scope.contractor_name}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
              </div>

              {scope.customer_satisfaction_rating && (
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < 5 ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-slate-600 ml-1">5.0</span>
                </div>
              )}

              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="line-clamp-1">{scope.job_title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>
                    {scope.closed_date
                      ? formatDistanceToNow(new Date(scope.closed_date), { addSuffix: true })
                      : 'Recently'}
                  </span>
                </div>
              </div>

              <Badge className="mt-4 bg-green-100 text-green-800">
                Job Completed ✓
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}