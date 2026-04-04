import React, { useMemo } from 'react';
import { Calendar, Star, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export default function RecentCompletedJobsFeed({ completedScopes = [], reviews = [] }) {
  const recentJobs = useMemo(() => {
    // Sort by closed_date descending, take last 5
    const sorted = [...completedScopes].sort(
      (a, b) => new Date(b.closed_date) - new Date(a.closed_date)
    );
    return sorted.slice(0, 5);
  }, [completedScopes]);

  const getReviewForScope = (scopeId) => {
    return (reviews || []).find(r => r.scope_id === scopeId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Recent Completed Jobs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentJobs.length === 0 ? (
          <p className="text-center py-6 text-slate-400 text-sm">No completed jobs yet</p>
        ) : (
          <div className="space-y-3">
            {recentJobs.map((job) => {
              const review = getReviewForScope(job.id);
              return (
                <div key={job.id} className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{job.job_title}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <p className="text-xs text-slate-600">{job.client_name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                    <div>
                      <p className="text-slate-500">Completed:</p>
                      <p className="font-medium text-slate-700">{formatDate(job.closed_date)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Payout:</p>
                      <p className="font-medium text-slate-700">
                        ${(job.contractor_payout_amount / 100 || (job.cost_amount * 0.82) / 100).toFixed(0)}
                      </p>
                    </div>
                  </div>

                  {review ? (
                    <div className="flex items-center gap-1.5 text-xs bg-yellow-50 border border-yellow-100 rounded-md p-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < review.overall_rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-yellow-700 font-medium">{review.overall_rating}.0</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Rating pending...</p>
                  )}

                  <Link to={`/ProjectManagement?scopeId=${job.id}`}>
                    <button className="w-full mt-2 text-xs font-medium text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-md py-1.5 transition-colors">
                      View Details
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}