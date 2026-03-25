import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ContractorRatingsDisplay({ rating, reviewsCount, reviews }) {
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-start gap-6">
        <div className="text-center">
          <div className={`text-5xl font-bold ${getRatingColor(rating || 0)}`}>
            {rating ? rating.toFixed(1) : 'N/A'}
          </div>
          <div className="flex gap-1 justify-center mt-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= (rating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-600">
            {reviewsCount || 0} {reviewsCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews?.filter(r => r.overall_rating === star).length || 0;
            const percentage = reviewsCount ? (count / reviewsCount) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="w-12 text-sm font-medium">{star} star</span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm text-slate-600">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      {reviews && reviews.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">Recent Reviews</h3>
          {reviews.slice(0, 5).map((review) => (
            <Card key={review.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-slate-900">{review.reviewer_name}</p>
                  <p className="text-xs text-slate-600">{review.job_title}</p>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.overall_rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-700">{review.comment}</p>
              {review.work_date && (
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(review.work_date).toLocaleDateString()}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {!reviews || reviews.length === 0 && (
        <Card className="p-6 text-center text-slate-600">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No reviews yet</p>
        </Card>
      )}
    </div>
  );
}