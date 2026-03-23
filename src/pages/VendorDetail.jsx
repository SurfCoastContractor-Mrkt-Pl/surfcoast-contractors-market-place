import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewsDisplay from '@/components/reviews/ReviewsDisplay';
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
          className={`w-5 h-5 rounded-full ${
            i < rating
              ? 'bg-amber-400'
              : 'bg-slate-300'
          }`}
        />
      ))}
    </div>
  );

  if (vendorLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-slate-600 mb-4">Vendor not found</p>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/BoothsAndVendorsMap" className="mb-6 inline-block">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vendors
          </Button>
        </Link>

        {/* Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Main Info */}
          <div className="md:col-span-2">
            {vendor.banner_url && (
              <img
                src={vendor.banner_url}
                alt={vendor.shop_name}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}

            <h1 className="text-4xl font-bold text-slate-900 mb-3">{vendor.shop_name}</h1>

            <div className="space-y-2 text-slate-600 mb-6">
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
                    <Badge key={cat} variant="outline">{cat}</Badge>
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
          <ReviewsDisplay reviews={reviews} />
        </Card>
      </div>

      {/* Modals */}
      <ReviewForm
        vendor={vendor}
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onSuccess={() => {
          // Reviews will auto-refresh via query
        }}
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