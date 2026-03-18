import React, { useEffect, useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, Flag, MessageCircle, Loader2 } from 'lucide-react';

const StarRating = ({ rating }) => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
      />
    ))}
  </div>
);

const StarDistribution = ({ reviews }) => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) distribution[r.rating]++;
  });

  const max = Math.max(...Object.values(distribution), 1);

  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map(stars => (
        <div key={stars} className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600 w-12">{stars} star{stars !== 1 ? 's' : ''}</span>
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all"
              style={{ width: `${(distribution[stars] / max) * 100}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 w-8 text-right">{distribution[stars]}</span>
        </div>
      ))}
    </div>
  );
};

const ReviewCard = ({ review, onReply, onFlag }) => {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await base44.entities.VendorReview.update(review.id, {
        vendor_reply: replyText,
        vendor_replied_at: new Date().toISOString(),
      });
      await onReply(review.id, replyText);
      setReplyText('');
      setReplyOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl p-5 bg-slate-50">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <StarRating rating={review.rating} />
            <span className="text-xs text-slate-500">
              {new Date(review.created_date).toLocaleDateString()}
            </span>
          </div>
          <h4 className="font-semibold text-slate-800">{review.title}</h4>
          <p className="text-sm text-slate-600 mt-1">{review.reviewer_name}</p>
        </div>
        <div className="flex gap-2">
          {!review.flagged && (
            <button
              onClick={() => onFlag(review.id)}
              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
              title="Flag as inappropriate"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed mb-4">{review.body}</p>

      {review.vendor_reply && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4">
          <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-2">
            🏪 Your Reply
          </p>
          <p className="text-sm text-slate-700">{review.vendor_reply}</p>
          {review.vendor_replied_at && (
            <p className="text-xs text-slate-500 mt-2">
              Replied {new Date(review.vendor_replied_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {!review.vendor_reply && (
        <>
          {!replyOpen ? (
            <button
              onClick={() => setReplyOpen(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <MessageCircle className="w-4 h-4" /> Reply
            </button>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write your reply..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setReplyOpen(false)}
                  className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={submitting || !replyText.trim()}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Reply'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default function ReviewsSection({ shop }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shop?.id) return;
    const loadReviews = async () => {
      try {
        const data = await base44.entities.VendorReview.filter({ shop_id: shop.id }, '-created_date', 1000);
        setReviews(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, [shop?.id]);

  const visibleReviews = useMemo(() => reviews.filter(r => r.status !== 'hidden'), [reviews]);
  const avgRating = useMemo(() => {
    if (visibleReviews.length === 0) return 0;
    return (visibleReviews.reduce((sum, r) => sum + r.rating, 0) / visibleReviews.length).toFixed(1);
  }, [visibleReviews]);

  if (shop?.subscription_status !== 'active') {
    return (
      <div className="text-center py-12">
        <Star className="w-10 h-10 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Upgrade to active subscription to view reviews</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (visibleReviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="w-10 h-10 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">No reviews yet</p>
      </div>
    );
  }

  const handleReply = (reviewId, reply) => {
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, vendor_reply: reply, vendor_replied_at: new Date().toISOString() } : r));
  };

  const handleFlag = async (reviewId) => {
    await base44.entities.VendorReview.update(reviewId, { flagged: true, status: 'pending' });
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, flagged: true, status: 'pending' } : r));
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-5xl font-bold text-amber-400 mb-2">{avgRating}</div>
          <div className="flex justify-center mb-2">
            <StarRating rating={Math.round(parseFloat(avgRating))} />
          </div>
          <p className="text-sm text-slate-500">{visibleReviews.length} review{visibleReviews.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Star Distribution */}
        <div className="md:col-span-2">
          <StarDistribution reviews={visibleReviews} />
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {visibleReviews.map(review => (
          <ReviewCard
            key={review.id}
            review={review}
            onReply={handleReply}
            onFlag={handleFlag}
          />
        ))}
      </div>
    </div>
  );
}