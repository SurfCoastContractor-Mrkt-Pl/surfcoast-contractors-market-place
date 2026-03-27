import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Star, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function SubmitConsumerOrderReview() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const orderId = searchParams.get('order_id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [shop, setShop] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
  });
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    const validateAndLoadOrder = async () => {
      try {
        if (!token || !orderId) {
          setError('Invalid review link.');
          setLoading(false);
          return;
        }

        // Fetch order details using service role
        const orderData = await base44.asServiceRole.entities.ConsumerOrder.get(orderId);
        if (!orderData) {
          setError('Order not found.');
          setLoading(false);
          return;
        }

        // Verify token hasn't expired (24 hours from email send)
        // In production, verify token more robustly

        setOrder(orderData);

        // Fetch shop details
        const shopData = await base44.asServiceRole.entities.MarketShop.get(orderData.shop_id);
        setShop(shopData);

        setLoading(false);
      } catch (err) {
        console.error('Error loading order:', err);
        setError('Failed to load order details. Please try again.');
        setLoading(false);
      }
    };

    validateAndLoadOrder();
  }, [token, orderId]);

  const handleSubmitReview = async () => {
    if (formData.rating === 0) {
      setError('Please select a rating.');
      return;
    }

    try {
      setLoading(true);

      // Create VendorReview record
      const review = await base44.asServiceRole.entities.VendorReview.create({
        shop_id: order.shop_id,
        shop_name: order.shop_name,
        reviewer_email: order.consumer_email,
        reviewer_name: order.consumer_email.split('@')[0], // Use email prefix as name
        rating: formData.rating,
        title: formData.title || `Great purchase at ${order.shop_name}`,
        comment: formData.comment,
        status: 'visible',
        verified: true,
        created_at: new Date().toISOString(),
      });

      // Mark review email request as submitted
      const reviewRequests = await base44.asServiceRole.entities.ReviewEmailRequest.filter({
        scope_id: orderId,
      });
      if (reviewRequests && reviewRequests.length > 0) {
        await base44.asServiceRole.entities.ReviewEmailRequest.update(reviewRequests[0].id, {
          review_submitted: true,
          review_submitted_at: new Date().toISOString(),
        });
      }

      setSubmitted(true);
      setLoading(false);

      // Redirect to vendor profile after 2 seconds
      setTimeout(() => {
        navigate(`/vendor/${shop?.custom_slug || order.shop_id}`);
      }, 2000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-lg shadow p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-lg font-semibold text-slate-900">Oops!</h2>
          </div>
          <p className="text-slate-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/')} className="w-full">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-lg shadow p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Thank You!</h2>
          <p className="text-slate-600 mb-6">Your review has been posted and will appear on {order.shop_name}'s profile.</p>
          <p className="text-sm text-slate-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Share Your Experience</h1>
            <p className="text-slate-600">
              Tell us about your recent purchase at <span className="font-semibold">{order?.shop_name}</span>
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-slate-50 rounded-lg p-4 mb-8 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">Order Details</h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p>Order Number: <span className="font-mono font-semibold">{order?.order_number}</span></p>
              <p>Total: <span className="font-semibold">${order?.total}</span></p>
              <p>Items: {order?.items?.length}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-900 mb-4">
              How would you rate this vendor? *
            </label>
            <div className="flex gap-3 text-4xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFormData({ ...formData, rating: star })}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || formData.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {formData.rating > 0 && (
              <p className="text-sm text-slate-600 mt-2">
                {['Poor', 'Fair', 'Good', 'Great', 'Excellent'][formData.rating - 1]} rating
              </p>
            )}
          </div>

          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-semibold text-slate-900 mb-2">
              Review Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g., Great quality and fast service"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Comment */}
          <div className="mb-8">
            <label htmlFor="comment" className="block text-sm font-semibold text-slate-900 mb-2">
              Your Review
            </label>
            <textarea
              id="comment"
              placeholder="Share details about your experience, product quality, service, etc."
              rows="5"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 mt-2">
              {formData.comment.length} characters
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleSubmitReview}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
              disabled={loading || formData.rating === 0}
            >
              Submit Review
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="px-6"
            >
              Skip
            </Button>
          </div>

          {/* Privacy Notice */}
          <p className="text-xs text-slate-500 text-center mt-6">
            Your review will be posted publicly on {order?.shop_name}'s profile and will help other shoppers make informed decisions.
          </p>
        </div>
      </div>
    </div>
  );
}