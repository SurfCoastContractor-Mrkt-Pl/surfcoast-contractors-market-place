import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Star, Plus } from 'lucide-react';
import { format } from 'date-fns';
import ReviewForm from './ReviewForm';

export default function ReviewsDisplay({ contractorId, contractorName, scopeId = null, canReview = false }) {
  const [reviewFormOpen, setReviewFormOpen] = useState(false);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', contractorId],
    queryFn: () => base44.entities.Review.filter({ contractor_id: contractorId }, '-created_date'),
    enabled: !!contractorId
  });

  const averageRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (isLoading) {
    return <div className="text-slate-500 text-sm">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reviews & Ratings</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(averageRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold">{averageRating}</span>
            <span className="text-slate-600 text-sm">({reviews?.length || 0} reviews)</span>
          </div>
        </div>
        {canReview && scopeId && (
          <Button onClick={() => setReviewFormOpen(true)} className="bg-amber-500 hover:bg-amber-600">
            <Plus className="w-4 h-4 mr-2" />
            Leave Review
          </Button>
        )}
      </div>

      {reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(review => (
            <div
              key={review.id}
              className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-sm">{review.reviewer_name}</h4>
                  <p className="text-xs text-slate-600">
                    {review.work_date && `Project: ${review.job_title} • `}
                    {format(new Date(review.created_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-700">{review.comment}</p>
              {review.verified && (
                <p className="text-xs text-green-600 mt-2">✓ Verified Review</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-slate-600 text-sm">No reviews yet. Be the first to review!</p>
        </div>
      )}

      {canReview && scopeId && (
        <ReviewForm
          contractorId={contractorId}
          contractorName={contractorName}
          scopeId={scopeId}
          open={reviewFormOpen}
          onClose={() => setReviewFormOpen(false)}
        />
      )}
    </div>
  );
}