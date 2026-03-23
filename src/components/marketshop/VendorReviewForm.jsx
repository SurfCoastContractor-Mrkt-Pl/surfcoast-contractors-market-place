import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function VendorReviewForm({ vendorId, vendorName, onReviewSubmitted }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reviewer_name: '',
    reviewer_email: '',
    overall_rating: 0,
    review_text: '',
    quality: 0,
    variety: 0,
    pricing: 0,
  });

  const handleRatingClick = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.reviewer_name || !formData.reviewer_email || formData.overall_rating === 0 || !formData.review_text.trim()) {
      toast.error('Please fill out all required fields');
      return;
    }

    if (formData.review_text.length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.entities.VendorReview.create({
        vendor_id: vendorId,
        vendor_name: vendorName,
        reviewer_name: formData.reviewer_name,
        reviewer_email: formData.reviewer_email,
        overall_rating: formData.overall_rating,
        review_text: formData.review_text,
        categories: {
          quality: formData.quality || null,
          variety: formData.variety || null,
          pricing: formData.pricing || null,
        },
        status: 'pending',
      });

      toast.success('Review submitted! It will be visible after approval.');
      setFormData({
        reviewer_name: '',
        reviewer_email: '',
        overall_rating: 0,
        review_text: '',
        quality: 0,
        variety: 0,
        pricing: 0,
      });

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      toast.error('Failed to submit review. Please try again.');
      console.error('Review submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ value, field, label }) => (
    <div style={{ marginBottom: '12px' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: '600',
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '6px',
        }}>
          {label}
        </label>
      )}
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingClick(field, star)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'transform 0.2s',
              transform: value >= star ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <Star
              size={20}
              fill={value >= star ? '#f97316' : 'rgba(255,255,255,0.2)'}
              color={value >= star ? '#f97316' : 'rgba(255,255,255,0.2)'}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
    }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '700',
        color: '#ffffff',
        margin: '0 0 16px',
      }}>
        Leave a Review
      </h3>

      {/* Reviewer Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Your name"
          value={formData.reviewer_name}
          onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
          style={{
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '13px',
          }}
          required
        />
        <input
          type="email"
          placeholder="Your email"
          value={formData.reviewer_email}
          onChange={(e) => setFormData({ ...formData, reviewer_email: e.target.value })}
          style={{
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '13px',
          }}
          required
        />
      </div>

      {/* Overall Rating */}
      <StarRating value={formData.overall_rating} field="overall_rating" label="Overall Rating *" />

      {/* Category Ratings */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
        marginBottom: '16px',
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div>
          <StarRating value={formData.quality} field="quality" label="Quality" />
        </div>
        <div>
          <StarRating value={formData.variety} field="variety" label="Variety" />
        </div>
        <div>
          <StarRating value={formData.pricing} field="pricing" label="Pricing" />
        </div>
      </div>

      {/* Review Text */}
      <textarea
        placeholder="Share your experience (at least 10 characters)..."
        value={formData.review_text}
        onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
        style={{
          width: '100%',
          padding: '12px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          color: '#ffffff',
          fontSize: '13px',
          fontFamily: 'inherit',
          minHeight: '100px',
          resize: 'vertical',
          marginBottom: '12px',
        }}
        required
      />
      <p style={{
        fontSize: '11px',
        color: 'rgba(255,255,255,0.5)',
        margin: '0 0 16px',
      }}>
        {formData.review_text.length} characters
      </p>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          width: '100%',
          padding: '10px 16px',
          background: isSubmitting ? 'rgba(249,115,22,0.5)' : '#f97316',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.background = '#ea580c')}
        onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.background = '#f97316')}
      >
        <Send size={14} />
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}