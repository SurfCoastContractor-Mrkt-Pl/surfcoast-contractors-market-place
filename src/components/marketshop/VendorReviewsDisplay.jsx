import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, ThumbsUp, MessageCircle } from 'lucide-react';

export default function VendorReviewsDisplay({ shopId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'helpful', 'rating-high', 'rating-low'
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const vendorReviews = await base44.entities.VendorReview.filter({
          shop_id: shopId,
          status: 'visible',
        });

        if (vendorReviews && vendorReviews.length > 0) {
          setTotalReviews(vendorReviews.length);
          
          // Calculate average rating
          const avg = (vendorReviews.reduce((sum, r) => sum + r.rating, 0) / vendorReviews.length).toFixed(1);
          setAverageRating(parseFloat(avg));
          
          setReviews(vendorReviews);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading reviews:', err);
        setLoading(false);
      }
    };

    if (shopId) {
      loadReviews();
    }
  }, [shopId]);

  const getSortedReviews = () => {
    const sorted = [...reviews];
    switch (sortBy) {
      case 'helpful':
        return sorted.sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));
      case 'rating-high':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'rating-low':
        return sorted.sort((a, b) => a.rating - b.rating);
      case 'recent':
      default:
        return sorted.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-20 bg-slate-200 rounded"></div>
      </div>
    );
  }

  if (totalReviews === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg">
        <MessageCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-slate-600">No reviews yet. Be the first to review this vendor!</p>
      </div>
    );
  }

  const sortedReviews = getSortedReviews();
  const ratingDistribution = getRatingDistribution();

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Overall Rating */}
          <div className="md:col-span-1 flex flex-col items-center justify-center border-r border-amber-200 md:border-r md:border-b-0 pb-4 md:pb-0">
            <div className="text-4xl font-bold text-slate-900">{averageRating}</div>
            <div className="flex gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
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
            <p className="text-sm text-slate-600 mt-2">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
          </div>

          {/* Rating Distribution */}
          <div className="md:col-span-2 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600 w-12">{rating}★</span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${(ratingDistribution[rating] / totalReviews) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-slate-500">{ratingDistribution[rating]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex gap-2 flex-wrap">
        {['recent', 'helpful', 'rating-high', 'rating-low'].map((sort) => (
          <button
            key={sort}
            onClick={() => setSortBy(sort)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              sortBy === sort
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {sort === 'recent' && 'Most Recent'}
            {sort === 'helpful' && 'Most Helpful'}
            {sort === 'rating-high' && 'Highest Rating'}
            {sort === 'rating-low' && 'Lowest Rating'}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <div key={review.id} className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            {/* Review Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-slate-900">{review.title}</p>
                <p className="text-sm text-slate-600">by {review.reviewer_name}</p>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Review Body */}
            <p className="text-slate-700 mb-3 leading-relaxed">{review.comment}</p>

            {/* Review Footer */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                {new Date(review.created_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              {review.verified && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  ✓ Verified Purchase
                </span>
              )}
            </div>

            {/* Helpful Button */}
            <button className="mt-3 flex items-center gap-1 text-sm text-slate-600 hover:text-blue-600 transition-colors">
              <ThumbsUp className="w-4 h-4" />
              Helpful ({review.helpful_count || 0})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}