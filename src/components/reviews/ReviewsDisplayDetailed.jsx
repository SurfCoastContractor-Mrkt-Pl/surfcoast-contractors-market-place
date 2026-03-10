import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Star, Plus, MessageSquareQuote } from 'lucide-react';
import { format } from 'date-fns';
import ReviewFormDetailed from './ReviewFormDetailed';

const RatingBar = ({ label, value, maxValue = 5 }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs font-medium text-slate-600 w-24">{label}</span>
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-6 rounded-full ${
            i < Math.round(value)
              ? 'bg-amber-400'
              : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
    <span className="text-xs font-semibold text-slate-700 w-8">{value}</span>
  </div>
);

export default function ReviewsDisplayDetailed({
  revieweeId,
  revieweeName,
  revieweeType,
  scopeId = null,
  canReview = false,
}) {
  const [reviewFormOpen, setReviewFormOpen] = useState(false);

  const queryKey = revieweeType === 'contractor'
    ? ['reviews', 'contractor', revieweeId]
    : ['reviews', 'customer', revieweeId];

  const filterField = revieweeType === 'contractor' ? 'contractor_id' : 'customer_id';

  const { data: reviews, isLoading } = useQuery({
    queryKey,
    queryFn: () => base44.entities.Review.filter(
      { [filterField]: revieweeId },
      '-created_date'
    ),
    enabled: !!revieweeId
  });

  const stats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return {
        averageOverall: 0,
        averageQuality: 0,
        averagePunctuality: 0,
        averageCommunication: 0,
        averageProfessionalism: 0,
        totalReviews: 0,
      };
    }

    return {
      averageOverall: (reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reviews.length).toFixed(1),
      averageQuality: (reviews.reduce((sum, r) => sum + (r.quality_rating || 0), 0) / reviews.length).toFixed(1),
      averagePunctuality: (reviews.reduce((sum, r) => sum + (r.punctuality_rating || 0), 0) / reviews.length).toFixed(1),
      averageCommunication: (reviews.reduce((sum, r) => sum + (r.communication_rating || 0), 0) / reviews.length).toFixed(1),
      averageProfessionalism: (reviews.reduce((sum, r) => sum + (r.professionalism_rating || 0), 0) / reviews.length).toFixed(1),
      totalReviews: reviews.length,
    };
  }, [reviews]);

  if (isLoading) {
    return <div className="text-slate-500 text-sm">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reviews & Ratings</h2>
        {canReview && scopeId && (
          <Button onClick={() => setReviewFormOpen(true)} className="bg-amber-500 hover:bg-amber-600">
            <Plus className="w-4 h-4 mr-2" />
            Leave Review
          </Button>
        )}
      </div>

      {/* Overall Rating Summary */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{stats.averageOverall}</h3>
            <p className="text-sm text-slate-600">out of 5.0</p>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(stats.averageOverall)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-600">
          Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Detailed Ratings */}
      {stats.totalReviews > 0 && (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
          <h3 className="font-semibold text-slate-900 mb-4">Rating Breakdown</h3>
          <RatingBar label="Quality" value={stats.averageQuality} />
          <RatingBar label="Punctuality" value={stats.averagePunctuality} />
          <RatingBar label="Communication" value={stats.averageCommunication} />
          <RatingBar label="Professionalism" value={stats.averageProfessionalism} />
        </div>
      )}

      {/* Reviews List */}
      {reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(review => (
            <div
              key={review.id}
              className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-sm">{review.reviewer_name}</h4>
                  <p className="text-xs text-slate-600">
                    {review.work_date && `${review.job_title} • `}
                    {format(new Date(review.created_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < review.overall_rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Criteria Ratings */}
              {(review.quality_rating || review.punctuality_rating || review.communication_rating || review.professionalism_rating) && (
                <div className="mb-3 pb-3 border-b border-slate-100 space-y-1.5 text-xs">
                  {review.quality_rating && (
                    <div className="flex justify-between text-slate-600">
                      <span>Quality:</span>
                      <span className="font-semibold text-amber-600">{review.quality_rating}/5</span>
                    </div>
                  )}
                  {review.punctuality_rating && (
                    <div className="flex justify-between text-slate-600">
                      <span>Punctuality:</span>
                      <span className="font-semibold text-amber-600">{review.punctuality_rating}/5</span>
                    </div>
                  )}
                  {review.communication_rating && (
                    <div className="flex justify-between text-slate-600">
                      <span>Communication:</span>
                      <span className="font-semibold text-amber-600">{review.communication_rating}/5</span>
                    </div>
                  )}
                  {review.professionalism_rating && (
                    <div className="flex justify-between text-slate-600">
                      <span>Professionalism:</span>
                      <span className="font-semibold text-amber-600">{review.professionalism_rating}/5</span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-sm text-slate-700 mb-2">{review.comment}</p>
              {review.verified && (
                <p className="text-xs text-green-600">✓ Verified Review</p>
              )}
              {review.is_testimony && !review.verified && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <MessageSquareQuote className="w-3 h-3" /> Customer Testimony
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-slate-600 text-sm">No reviews yet. Be the first to review!</p>
        </div>
      )}

      {/* Review Form Modal */}
      {canReview && scopeId && (
        <ReviewFormDetailed
          revieweeId={revieweeId}
          revieweeName={revieweeName}
          revieweeType={revieweeType}
          scopeId={scopeId}
          open={reviewFormOpen}
          onClose={() => setReviewFormOpen(false)}
        />
      )}
    </div>
  );
}