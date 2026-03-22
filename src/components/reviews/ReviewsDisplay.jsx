import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, Verified } from 'lucide-react';

export default function ReviewsDisplay({ reviews = [] }) {
  // Filter only approved reviews and calculate average
  const approvedReviews = reviews.filter(r => r.status === 'approved');
  
  const stats = useMemo(() => {
    if (approvedReviews.length === 0) {
      return { average: 0, count: 0, distribution: {} };
    }

    const sum = approvedReviews.reduce((acc, r) => acc + r.overall_rating, 0);
    const average = (sum / approvedReviews.length).toFixed(1);

    const distribution = {
      5: approvedReviews.filter(r => r.overall_rating === 5).length,
      4: approvedReviews.filter(r => r.overall_rating === 4).length,
      3: approvedReviews.filter(r => r.overall_rating === 3).length,
      2: approvedReviews.filter(r => r.overall_rating === 2).length,
      1: approvedReviews.filter(r => r.overall_rating === 1).length
    };

    return {
      average: parseFloat(average),
      count: approvedReviews.length,
      distribution
    };
  }, [approvedReviews]);

  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating
              ? 'fill-amber-400 text-amber-400'
              : 'text-slate-300'
          }`}
        />
      ))}
    </div>
  );

  if (approvedReviews.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Star className="w-8 h-8 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-600">No reviews yet. Be the first to review!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div>
              <p className="text-4xl font-bold text-slate-900">{stats.average}</p>
              <p className="text-sm text-slate-600">{stats.count} reviews</p>
            </div>
            <div className="ml-auto">
              {renderStars(Math.round(stats.average))}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2 pt-4 border-t">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-8">{rating}★</span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all"
                    style={{
                      width: `${stats.count > 0 ? (stats.distribution[rating] / stats.count) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm text-slate-600 w-8">{stats.distribution[rating]}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {approvedReviews.map(review => (
          <Card key={review.id} className="p-4">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-slate-900">{review.reviewer_name}</p>
                    {review.verified_purchase && (
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        <Verified className="w-3 h-3" />
                        Verified Purchase
                      </Badge>
                    )}
                  </div>
                  {renderStars(review.overall_rating)}
                </div>
              </div>

              {/* Category Ratings */}
              {review.categories && (
                <div className="grid grid-cols-3 gap-3 py-2 border-y text-xs">
                  <div>
                    <p className="text-slate-600">Quality</p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < (review.categories.quality || 0)
                              ? 'fill-blue-400 text-blue-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-600">Variety</p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < (review.categories.variety || 0)
                              ? 'fill-green-400 text-green-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-600">Pricing</p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < (review.categories.pricing || 0)
                              ? 'fill-purple-400 text-purple-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Review Text */}
              <p className="text-slate-700 text-sm">{review.review_text}</p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-xs text-slate-500">
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
                {review.helpful_count > 0 && (
                  <button className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition-colors">
                    <ThumbsUp className="w-3 h-3" />
                    Helpful ({review.helpful_count})
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}