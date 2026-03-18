import React, { useEffect, useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, MessageCircle, Flag, Loader2 } from 'lucide-react';

const StarRating = ({ rating, interactive = false, onSelect = null }) => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <button
        key={i}
        onClick={() => interactive && onSelect?.(i + 1)}
        className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
      >
        <Star
          className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`}
        />
      </button>
    ))}
  </div>
);

export default function MarketShopReviews({ shop }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (!shop?.id) return;
        const data = await base44.entities.VendorReview.filter(
          { shop_id: shop.id },
          '-created_date',
          100
        );
        setReviews(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [shop?.id]);

  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, total: 0, distribution: [0, 0, 0, 0, 0] };
    
    const distribution = [0, 0, 0, 0, 0];
    let sum = 0;
    
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating - 1]++;
        sum += r.rating;
      }
    });
    
    return {
      avg: (sum / reviews.length).toFixed(1),
      total: reviews.length,
      distribution,
    };
  }, [reviews]);

  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim()) return;
    
    setSubmittingReply(true);
    try {
      await base44.entities.VendorReview.update(reviewId, {
        vendor_reply: replyText,
        vendor_replied_at: new Date().toISOString(),
      });
      
      setReviews(reviews.map(r => 
        r.id === reviewId 
          ? { ...r, vendor_reply: replyText, vendor_replied_at: new Date().toISOString() }
          : r
      ));
      
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      console.error(err);
      alert('Failed to submit reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleFlag = async (reviewId) => {
    if (!window.confirm('Flag this review for admin review? It will be hidden from public view.')) return;
    
    try {
      await base44.entities.VendorReview.update(reviewId, {
        flagged: true,
        status: 'pending',
      });
      
      setReviews(reviews.map(r => 
        r.id === reviewId 
          ? { ...r, flagged: true, status: 'pending' }
          : r
      ));
    } catch (err) {
      console.error(err);
      alert('Failed to flag review');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No reviews yet. When customers review your shop, they'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-amber-500 mb-2">{stats.avg}</div>
            <StarRating rating={Math.round(parseFloat(stats.avg))} />
            <p className="text-sm text-slate-500 mt-2">{stats.total} review{stats.total !== 1 ? 's' : ''}</p>
          </div>

          {/* Distribution Bars */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Rating Breakdown</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(level => {
                const count = stats.distribution[level - 1];
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={level} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-600 w-8">{level}★</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-amber-400 h-2 rounded-full transition-all" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Customer Reviews</h3>
        
        {reviews.map(review => (
          <div key={review.id} className="bg-white rounded-xl border border-slate-200 p-6">
            {/* Review Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <StarRating rating={review.rating} />
                <p className="font-medium text-slate-800 mt-2">{review.title}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFlag(review.id)}
                  disabled={review.flagged}
                  className={`p-2 rounded-lg transition-colors ${
                    review.flagged
                      ? 'bg-red-100 text-red-600'
                      : 'hover:bg-slate-100 text-slate-500 hover:text-red-600'
                  }`}
                  title={review.flagged ? 'Flagged' : 'Flag for review'}
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Review Info */}
            <p className="text-sm text-slate-500 mb-3">
              {review.reviewer_name} • {new Date(review.created_date).toLocaleDateString()}
              {review.flagged && <span className="ml-2 text-red-600 font-medium">(Flagged)</span>}
            </p>

            {/* Review Body */}
            <p className="text-slate-700 leading-relaxed mb-4">{review.body}</p>

            {/* Vendor Reply */}
            {review.vendor_reply && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                <p className="text-xs font-semibold text-blue-700 flex items-center gap-1.5 mb-2">
                  🏪 Your Reply
                </p>
                <p className="text-sm text-blue-900">{review.vendor_reply}</p>
                <p className="text-xs text-blue-600 mt-2">
                  {new Date(review.vendor_replied_at).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Reply Form or Button */}
            {!review.vendor_reply && (
              <>
                {replyingTo === review.id ? (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Your Reply
                    </label>
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Write a response to this review..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      autoFocus
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleReplySubmit(review.id)}
                        disabled={submittingReply || !replyText.trim()}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                      >
                        {submittingReply && <Loader2 className="w-3 h-3 animate-spin" />}
                        Submit Reply
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingTo(review.id)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Reply to Review
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}