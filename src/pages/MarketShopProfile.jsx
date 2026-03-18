import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MapPin, Star, ChevronLeft, CalendarDays, Instagram, Facebook, Music, Twitter, Loader2, Send } from 'lucide-react';

const SHOP_TYPE_ICONS = {
  farmers_market: '🌽',
  swap_meet: '🏷️',
  both: '🌽🏷️',
};

const SHOP_TYPE_LABELS = {
  farmers_market: 'Farmers Market',
  swap_meet: 'Swap Meet',
  both: 'Farmers Market & Swap Meet',
};

const StarRating = ({ rating, interactive = false, onSelect = null }) => (
  <div className="flex gap-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <button
        key={i}
        onClick={() => interactive && onSelect?.(i + 1)}
        className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
      >
        <Star
          className={`w-5 h-5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
        />
      </button>
    ))}
  </div>
);

export default function MarketShopProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', rating: 0, title: '', body: '' });
  const [inquiryForm, setInquiryForm] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const shops = await base44.entities.MarketShop.filter({ custom_slug: id });
        setShop(shops?.[0] || null);
        
        if (shops?.[0]) {
          const shopReviews = await base44.entities.VendorReview.filter(
            { shop_id: shops[0].id, status: 'visible' },
            '-created_date',
            100
          );
          setReviews(shopReviews || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.email || !reviewForm.rating || !reviewForm.title || !reviewForm.body) {
      alert('Please fill all fields');
      return;
    }
    
    setSubmittingReview(true);
    try {
      const newReview = {
        shop_id: shop.id,
        shop_name: shop.shop_name,
        reviewer_name: reviewForm.name,
        reviewer_email: reviewForm.email,
        rating: reviewForm.rating,
        title: reviewForm.title,
        body: reviewForm.body,
        status: 'visible',
      };
      
      await base44.entities.VendorReview.create(newReview);
      
      // Call backend function
      await base44.functions.invoke('submitVendorReview', {
        shop_id: shop.id,
        reviewer_name: reviewForm.name,
        rating: reviewForm.rating,
        review_title: reviewForm.title,
        review_body: reviewForm.body,
        vendor_email: shop.email,
        vendor_name: shop.shop_name,
        shop_name: shop.shop_name,
      });
      
      setReviews(prev => [newReview, ...prev]);
      setReviewForm({ name: '', email: '', rating: 0, title: '', body: '' });
      alert('Review submitted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryForm.name || !inquiryForm.email || !inquiryForm.message) {
      alert('Please fill all fields');
      return;
    }
    
    setSubmittingInquiry(true);
    try {
      await base44.entities.VendorInquiry.create({
        shop_id: shop.id,
        shop_name: shop.shop_name,
        visitor_name: inquiryForm.name,
        visitor_email: inquiryForm.email,
        message: inquiryForm.message,
        shop_email: shop.email,
      });
      
      setInquiryForm({ name: '', email: '', message: '' });
      alert('Message sent to vendor!');
    } catch (err) {
      console.error(err);
      alert('Failed to send message');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛍️</div>
          <p className="font-medium text-slate-300 text-lg">Vendor not found</p>
          <button
            onClick={() => navigate('/MarketDirectory')}
            className="mt-6 text-blue-400 hover:text-blue-300 underline font-medium"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  const bannerBg = shop.banner_url 
    ? { backgroundImage: `url(${shop.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : shop.shop_type === 'farmers_market'
      ? { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }
      : shop.shop_type === 'swap_meet'
        ? { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }
        : { background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Banner */}
      <div className="relative h-64 sm:h-72 md:h-80" style={bannerBg}>
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/MarketDirectory')}
          className="absolute top-4 left-4 z-10 flex items-center gap-1 px-3 py-1.5 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Content */}
      <div className="relative -mt-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Profile Header */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Logo */}
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-4xl flex-shrink-0">
              🛍️
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-bold">{shop.shop_name}</h1>
                {shop.verified_vendor && (
                  <span className="text-lg">✅</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  shop.shop_type === 'farmers_market'
                    ? 'bg-green-900 text-green-200'
                    : shop.shop_type === 'swap_meet'
                      ? 'bg-amber-900 text-amber-200'
                      : 'bg-blue-900 text-blue-200'
                }`}>
                  {SHOP_TYPE_ICONS[shop.shop_type] || '🛍️'} {SHOP_TYPE_LABELS[shop.shop_type] || shop.shop_type}
                </span>
              </div>

              <div className="flex items-center gap-1 text-slate-300 mb-3">
                <MapPin className="w-4 h-4" />
                {[shop.city, shop.state].filter(Boolean).join(', ')}
              </div>

              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(parseFloat(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-slate-400">{avgRating} ({reviews.length})</span>
                </div>
              )}

              {/* Social Icons */}
              {shop.social_links && Object.keys(shop.social_links).some(k => shop.social_links[k]) && (
                <div className="flex gap-3 mt-4">
                  {shop.social_links.instagram && (
                    <a href={shop.social_links.instagram} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {shop.social_links.facebook && (
                    <a href={shop.social_links.facebook} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {shop.social_links.tiktok && (
                    <a href={shop.social_links.tiktok} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                      <Music className="w-5 h-5" />
                    </a>
                  )}
                  {shop.social_links.twitter && (
                    <a href={shop.social_links.twitter} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* About */}
          {shop.description && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">About</h3>
              <p className="text-slate-400 leading-relaxed">{shop.description}</p>
            </div>
          )}

          {(shop.categories || []).length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {shop.categories.map(cat => (
                  <span key={cat} className="text-xs bg-slate-700 text-slate-200 px-3 py-1 rounded-full">{cat}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Market Schedule */}
        {(shop.market_events || []).length > 0 && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-bold mb-4">Where to Find Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shop.market_events.map((event, i) => (
                <div key={i} className="bg-slate-700 rounded-xl p-4 border border-slate-600">
                  <p className="font-semibold text-slate-100 mb-2">{event.market_name}</p>
                  <div className="space-y-1 text-sm text-slate-300">
                    {event.date && <p className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> {event.date}</p>}
                    {event.location && <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.location}</p>}
                    {event.hours && <p>Hours: {event.hours}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!shop.market_events || shop.market_events.length === 0) && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center mb-8">
            <CalendarDays className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No upcoming dates posted yet.</p>
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold mb-6">Reviews & Feedback</h2>

          {/* Reviews Summary */}
          {reviews.length > 0 && (
            <div className="mb-8 pb-8 border-b border-slate-700">
              <div className="text-center">
                <div className="text-5xl font-bold text-amber-400 mb-2">{avgRating}</div>
                <StarRating rating={Math.round(parseFloat(avgRating))} />
                <p className="text-slate-400 mt-2">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-5 mb-8">
            {reviews.map(review => (
              <div key={review.id} className="bg-slate-700 rounded-xl p-5 border border-slate-600">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <StarRating rating={review.rating} />
                    <p className="font-semibold text-slate-100 mt-2">{review.title}</p>
                    <p className="text-sm text-slate-400">{review.reviewer_name} • {new Date(review.created_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{review.body}</p>
                
                {review.vendor_reply && (
                  <div className="bg-slate-600 rounded-lg p-4 mt-4">
                    <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">🏪 Vendor Reply</p>
                    <p className="text-slate-300 text-sm">{review.vendor_reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Leave a Review Form */}
          <div className="bg-slate-700 rounded-xl p-6 border border-slate-600 mb-8">
            <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={reviewForm.name}
                  onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={reviewForm.email}
                  onChange={e => setReviewForm({ ...reviewForm, email: e.target.value })}
                  className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Rating</label>
                <StarRating rating={reviewForm.rating} interactive onSelect={r => setReviewForm({ ...reviewForm, rating: r })} />
              </div>

              <input
                type="text"
                placeholder="Review Title"
                value={reviewForm.title}
                onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              <textarea
                placeholder="Your Review..."
                value={reviewForm.body}
                onChange={e => setReviewForm({ ...reviewForm, body: e.target.value })}
                className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Review
              </button>
            </form>
          </div>
        </div>

        {/* Contact Vendor Form */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold mb-4">Contact Vendor</h2>
          <form onSubmit={handleInquirySubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              value={inquiryForm.name}
              onChange={e => setInquiryForm({ ...inquiryForm, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              value={inquiryForm.email}
              onChange={e => setInquiryForm({ ...inquiryForm, email: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <textarea
              placeholder="Your Message..."
              value={inquiryForm.message}
              onChange={e => setInquiryForm({ ...inquiryForm, message: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              required
            />
            <button
              type="submit"
              disabled={submittingInquiry}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {submittingInquiry ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Message
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-slate-700">
          <button
            onClick={() => navigate('/MarketDirectory')}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            ← Back to Vendor Directory
          </button>
        </div>
      </div>
    </div>
  );
}