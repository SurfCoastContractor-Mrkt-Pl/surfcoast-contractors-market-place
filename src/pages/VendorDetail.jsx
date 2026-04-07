import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReviewForm from '@/components/reviews/ReviewForm';
import BookingRequestForm from '@/components/booking/BookingRequestForm';
import ServiceRequestForm from '@/components/service-request/ServiceRequestForm';
import { MapPin, Calendar, MessageCircle, ArrowLeft, Phone, Mail, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VendorDetail() {
  const { vendorId } = useParams();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [serviceRequestOpen, setServiceRequestOpen] = useState(false);

  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => base44.entities.MarketShop.filter({ id: vendorId }).then(results => results?.[0] || null),
    enabled: !!vendorId
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['vendorReviews', vendorId],
    queryFn: () =>
      base44.entities.VendorReview.filter({
        vendor_id: vendorId,
        status: 'approved'
      }),
    enabled: !!vendorId
  });

  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return { average: 0, count: 0 };
    }
    const sum = reviews.reduce((acc, r) => acc + r.overall_rating, 0);
    return {
      average: (sum / reviews.length).toFixed(1),
      count: reviews.length
    };
  }, [reviews]);

  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-5 h-5 rounded-full ${i < rating ? 'bg-amber-400' : 'bg-slate-300'}`}
        />
      ))}
    </div>
  );

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
  };

  if (vendorLoading) {
    return (
      <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
        <div style={{ width: 32, height: 32, border: "3px solid #D0D0D2", borderTop: "3px solid " + T.dark, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, padding: 24, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ maxWidth: 896, margin: "0 auto", textAlign: "center", paddingTop: 48 }}>
          <p style={{ color: T.muted, marginBottom: 16, fontStyle: "italic" }}>Vendor not found</p>
          <Link to="/BoothsAndVendorsMap">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Vendors
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/BoothsAndVendorsMap" className="mb-6 inline-block">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vendors
          </Button>
        </Link>

        {/* Header Section */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 32 }}>
          {/* Main Info */}
          <div style={{ gridColumn: "span 2" }}>
            {vendor.banner_url && (
              <img
                src={vendor.banner_url}
                alt={vendor.shop_name}
                style={{ width: "100%", height: 256, objectFit: "cover", borderRadius: 8, marginBottom: 24 }}
              />
            )}

            <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.8rem)", fontWeight: 800, color: T.dark, margin: "0 0 12px 0", fontStyle: "italic" }}>{vendor.shop_name}</h1>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, color: T.muted, marginBottom: 24 }}>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {vendor.city}, {vendor.state}
              </div>
              {vendor.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${vendor.phone}`} className="hover:text-slate-900">
                    {vendor.phone}
                  </a>
                </div>
              )}
              {vendor.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${vendor.email}`} className="hover:text-slate-900">
                    {vendor.email}
                  </a>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary">
                {vendor.shop_type === 'farmers_market' ? '🌱 Farmers Market' : vendor.shop_type === 'swap_meet' ? '🔄 Swap Meet' : '🛍️ Both'}
              </Badge>
              {vendor.verified_vendor && (
                <Badge>✓ Verified</Badge>
              )}
            </div>

            {vendor.description && (
              <div className="prose prose-sm max-w-none mb-6">
                <p className="text-slate-700">{vendor.description}</p>
              </div>
            )}

            {vendor.categories && vendor.categories.length > 0 && (
              <div className="space-y-2 mb-6">
                <h3 className="font-semibold text-slate-900">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {vendor.categories.map(cat => (
                    <Badge key={cat} variant="outline">{cat.replace(/_/g, ' ')}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Rating & Actions */}
          <div>
            <Card className="p-6 space-y-6">
              {/* Rating Summary */}
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">{stats.average}</div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(stats.average))}
                </div>
                <p className="text-sm text-slate-600">
                  Based on {stats.count} {stats.count === 1 ? 'review' : 'reviews'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-6 border-t">
                <Button
                  onClick={() => setReviewOpen(true)}
                  variant="outline"
                  className="w-full"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Leave a Review
                </Button>
                <Button
                  onClick={() => setBookingOpen(true)}
                  className="w-full"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book a Visit
                </Button>
                <Button
                  onClick={() => setServiceRequestOpen(true)}
                  variant="outline"
                  className="w-full"
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Service Request
                </Button>
              </div>

              {/* Hours */}
              {vendor.hours && (
                <div className="pt-6 border-t">
                  <h4 className="font-semibold text-slate-900 mb-3">Hours</h4>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>{vendor.hours}</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Customer Reviews</h2>
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No reviews yet. Be the first to review this vendor!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{review.reviewer_name}</h3>
                      <p className="text-sm text-slate-600">{new Date(review.created_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-4 h-4 rounded-full ${i < review.overall_rating ? 'bg-amber-400' : 'bg-slate-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Modals */}
      <ReviewForm
        vendor={vendor}
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onSuccess={() => {}}
      />
      <BookingRequestForm
        market={vendor}
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
      {vendor && (
        <ServiceRequestForm
          isOpen={serviceRequestOpen}
          onClose={() => setServiceRequestOpen(false)}
          professional={{ ...vendor, type: 'vendor' }}
        />
      )}
    </div>
  );
}