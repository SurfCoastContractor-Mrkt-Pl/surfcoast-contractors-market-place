import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, TrendingUp } from 'lucide-react';

export default function RecentActivityBanner() {
  const [displayData, setDisplayData] = useState(null);

  const { data: scopes } = useQuery({
    queryKey: ['recent-completed-scopes'],
    queryFn: () => base44.entities.ScopeOfWork.filter(
      { status: 'closed' },
      '-closed_date',
      20
    ),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: reviews } = useQuery({
    queryKey: ['recent-reviews'],
    queryFn: () => base44.entities.Review.filter(
      { verified: true },
      '-created_date',
      15
    ),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (scopes?.length > 0 && reviews?.length > 0) {
      // Pick a random recent completion to display
      const randomScope = scopes[Math.floor(Math.random() * scopes.length)];
      const randomReview = reviews[Math.floor(Math.random() * reviews.length)];
      
      setDisplayData({
        scope: randomScope,
        review: randomReview
      });
    }
  }, [scopes, reviews]);

  if (!displayData) return null;

  const { scope, review } = displayData;
  const daysAgo = Math.floor((Date.now() - new Date(scope.closed_date).getTime()) / (1000 * 60 * 60 * 24));
  const daysText = daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5 max-w-7xl mx-auto my-6 mx-4 sm:mx-6 lg:mx-8">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 pt-0.5">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 mb-1">
            ✓ Job completed {daysText}
          </p>
          <p className="text-sm text-slate-700 mb-2">
            <span className="font-medium">{scope.contractor_name}</span> completed <span className="font-medium">"{scope.job_title}"</span> for {scope.customer_name}
          </p>
          {review && (
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.floor(review.overall_rating) ? 'text-amber-400' : 'text-slate-300'}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-slate-600 italic">"{review.comment.substring(0, 60)}..."</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 pt-1">
          <TrendingUp className="w-4 h-4 text-green-600" />
        </div>
      </div>
    </div>
  );
}