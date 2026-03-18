import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MapPin, Star, ChevronLeft, CalendarDays, Loader2, Send, Leaf, Tag, CheckCircle, Clock, User, Store, MessageSquare, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import PhotoGalleryLightbox from '@/components/marketshop/PhotoGalleryLightbox';

const SHOP_TYPE_ICONS = {
  farmers_market: Leaf,
  swap_meet: Tag,
};

const SHOP_TYPE_LABELS = {
  farmers_market: 'Farmers Market',
  swap_meet: 'Swap Meet',
  both: 'Farmers Market & Swap Meet',
};

const SHOP_TYPE_COLORS = {
  farmers_market: { bg: 'bg-green-900', text: 'text-green-200', icon: '#16a34a' },
  swap_meet: { bg: 'bg-amber-900', text: 'text-amber-200', icon: '#d97706' },
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

const SocialIcon = ({ platform, url }) => {
  if (!url) return null;

  const iconProps = { className: 'w-5 h-5', target: '_blank', rel: 'noopener noreferrer' };

  switch (platform) {
    case 'instagram':
      return (
        <a href={url} {...iconProps} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <defs>
              <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#feda75" />
                <stop offset="5%" stopColor="#fa7e1e" />
                <stop offset="45%" stopColor="#d92e7f" />
                <stop offset="60%" stopColor="#9b36b7" />
                <stop offset="90%" stopColor="#515bd4" />
              </linearGradient>
            </defs>
            <rect width="24" height="24" rx="5.5" fill="url(#ig-gradient)" />
            <circle cx="12" cy="12" r="3.5" fill="white" />
            <circle cx="18.5" cy="5.5" r="1.5" fill="white" />
          </svg>
        </a>
      );
    case 'facebook':
      return (
        <a href={url} {...iconProps} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <svg viewBox="0 0 24 24" fill="#1877f2" className="w-5 h-5">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>
      );
    case 'tiktok':
      return (
        <a href={url} {...iconProps} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.89 2.89 0 0 1 5.1-1.82V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.36-.04z" />
          </svg>
        </a>
      );
    case 'twitter':
      return (
        <a href={url} {...iconProps} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
            <path d="M23.953 4.57a10 10 0 002.856-5.638 9.88 9.88 0 01-2.828.856 4.904 4.904 0 00-8.564-4.27c-1.344 1.681-2.138 3.692-2.138 5.805 0 .399.045.794.14 1.173a13.978 13.978 0 01-10.147-5.14 4.928 4.928 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          </svg>
        </a>
      );
    default:
      return null;
  }
};

export default function MarketShopProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
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
          <Tag className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="font-medium text-slate-300 text-lg">Vendor not found</p>
          <button
            onClick={() => navigate('/MarketDirectory')}
            className="mt-6 text-blue-400 hover:text-blue-300 underline font-medium flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  const TypeIcon = SHOP_TYPE_ICONS[shop.shop_type];
  const typeColor = SHOP_TYPE_COLORS[shop.shop_type] || SHOP_TYPE_COLORS.swap_meet;

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
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Content */}
      <div className="relative -mt-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Profile Header */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Logo */}
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-4xl flex-shrink-0">
              {shop.logo_url ? (
                <img src={shop.logo_url} alt={shop.shop_name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Tag className="w-10 h-10 text-slate-500" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-bold">{shop.shop_name}</h1>
                {shop.verified_vendor && (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                {TypeIcon && (
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-2 ${typeColor.bg} ${typeColor.text}`}>
                    <TypeIcon className="w-4 h-4" />
                    {SHOP_TYPE_LABELS[shop.shop_type] || shop.shop_type}
                  </span>
                )}
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
                  <SocialIcon platform="instagram" url={shop.social_links.instagram} />
                  <SocialIcon platform="facebook" url={shop.social_links.facebook} />
                  <SocialIcon platform="tiktok" url={shop.social_links.tiktok} />
                  <SocialIcon platform="twitter" url={shop.social_links.twitter} />
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
                  <div className="space-y-2 text-sm text-slate-300">
                    {event.date && (
                      <p className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 flex-shrink-0" />
                        {event.date}
                      </p>
                    )}
                    {event.location && (
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        {event.location}
                      </p>
                    )}
                    {event.hours && (
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        {event.hours}
                      </p>
                    )}
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
                    <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                      <User className="w-4 h-4" />
                      {review.reviewer_name} • 
                      <CalendarDays className="w-4 h-4 ml-2" />
                      {new Date(review.created_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{review.body}</p>
                
                {review.vendor_reply && (
                  <div className="bg-slate-600 rounded-lg p-4 mt-4 border-l-4 border-blue-500">
                    <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                      <Store className="w-4 h-4" />
                      Vendor Reply
                    </p>
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
              {submittingInquiry ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
              Send Message
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-slate-700">
          <button
            onClick={() => navigate('/MarketDirectory')}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Vendor Directory
          </button>
        </div>
      </div>
    </div>
  );
}