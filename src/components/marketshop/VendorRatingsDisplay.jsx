import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star } from 'lucide-react';

export default function VendorRatingsDisplay({ vendorId }) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['vendor-reviews', vendorId],
    queryFn: () => base44.entities.VendorReview.filter({ 
      vendor_id: vendorId,
      status: 'approved'
    }),
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
        Loading reviews...
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.5)',
      }}>
        No reviews yet. Be the first to share your experience!
      </div>
    );
  }

  // Calculate aggregate ratings
  const avgOverall = (reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length).toFixed(1);
  const avgQuality = reviews.filter(r => r.categories?.quality).length > 0
    ? (reviews.filter(r => r.categories?.quality).reduce((sum, r) => sum + r.categories.quality, 0) / reviews.filter(r => r.categories?.quality).length).toFixed(1)
    : 0;
  const avgVariety = reviews.filter(r => r.categories?.variety).length > 0
    ? (reviews.filter(r => r.categories?.variety).reduce((sum, r) => sum + r.categories.variety, 0) / reviews.filter(r => r.categories?.variety).length).toFixed(1)
    : 0;
  const avgPricing = reviews.filter(r => r.categories?.pricing).length > 0
    ? (reviews.filter(r => r.categories?.pricing).reduce((sum, r) => sum + r.categories.pricing, 0) / reviews.filter(r => r.categories?.pricing).length).toFixed(1)
    : 0;

  const StarDisplay = ({ rating, showLabel, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            fill={star <= Math.round(rating) ? '#f97316' : 'rgba(255,255,255,0.2)'}
            color={star <= Math.round(rating) ? '#f97316' : 'rgba(255,255,255,0.2)'}
          />
        ))}
      </div>
      {showLabel && (
        <>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
            {rating}
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
            {label}
          </span>
        </>
      )}
    </div>
  );

  return (
    <div>
      {/* Summary Section */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '700',
          color: '#ffffff',
          margin: '0 0 16px',
        }}>
          Customer Ratings
        </h3>

        {/* Overall Rating */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ textAlign: 'center', minWidth: '60px' }}>
            <div style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#f97316',
              lineHeight: 1,
            }}>
              {avgOverall}
            </div>
            <div style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.5)',
              marginTop: '2px',
            }}>
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <StarDisplay rating={avgOverall} />
            <div style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)',
              marginTop: '4px',
            }}>
              Average rating
            </div>
          </div>
        </div>

        {/* Category Ratings */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
        }}>
          {avgQuality > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                Quality
              </div>
              <StarDisplay rating={avgQuality} />
            </div>
          )}
          {avgVariety > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                Variety
              </div>
              <StarDisplay rating={avgVariety} />
            </div>
          )}
          {avgPricing > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                Pricing
              </div>
              <StarDisplay rating={avgPricing} />
            </div>
          )}
        </div>
      </div>

      {/* Individual Reviews */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '700',
          color: '#ffffff',
          margin: '0 0 12px',
        }}>
          Recent Reviews
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {reviews.slice(0, 5).map((review) => (
            <div
              key={review.id}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '12px',
              }}
            >
              {/* Review Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px',
              }}>
                <div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#ffffff',
                  }}>
                    {review.reviewer_name}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.5)',
                    marginTop: '2px',
                  }}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      fill={star <= review.overall_rating ? '#f97316' : 'rgba(255,255,255,0.2)'}
                      color={star <= review.overall_rating ? '#f97316' : 'rgba(255,255,255,0.2)'}
                    />
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <p style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.7)',
                margin: 0,
                lineHeight: '1.5',
              }}>
                {review.review_text}
              </p>

              {/* Verified Badge */}
              {review.verified_purchase && (
                <div style={{
                  marginTop: '8px',
                  display: 'inline-block',
                  padding: '2px 8px',
                  background: 'rgba(34,197,94,0.1)',
                  color: '#22c55e',
                  borderRadius: '4px',
                  fontSize: '9px',
                  fontWeight: '600',
                }}>
                  ✓ Verified Purchase
                </div>
              )}
            </div>
          ))}
        </div>

        {reviews.length > 5 && (
          <div style={{
            textAlign: 'center',
            marginTop: '12px',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '11px',
          }}>
            +{reviews.length - 5} more {reviews.length - 5 === 1 ? 'review' : 'reviews'}
          </div>
        )}
      </div>
    </div>
  );
}