import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle2, User } from 'lucide-react';

export default function ReviewsSection({ reviews, averageRating, totalReviews }) {
  const verifiedReviews = reviews?.filter(r => r.verified) || [];

  if (!reviews || reviews.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Reviews</h2>
        <p className="text-slate-500 text-sm">No reviews yet</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Verified Reviews</h2>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating || 0)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-slate-500">{verifiedReviews.length} verified</div>
        </div>
      </div>

      <div className="space-y-4">
        {verifiedReviews.map((review, idx) => (
          <div key={idx} className="p-4 border border-slate-200 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">{review.reviewer_name}</div>
                  <div className="text-xs text-slate-500">
                    {review.work_date ? new Date(review.work_date).toLocaleDateString() : 'Recent'}
                  </div>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </Badge>
            </div>

            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-semibold text-slate-900">{review.rating}</span>
            </div>

            {review.job_title && (
              <p className="text-xs text-slate-500 mb-2">For: {review.job_title}</p>
            )}

            <p className="text-sm text-slate-700 leading-relaxed">{review.comment}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}