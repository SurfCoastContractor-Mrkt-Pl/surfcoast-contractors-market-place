import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Loader2, Star } from 'lucide-react';

export default function ReviewForm({ vendor, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    reviewer_name: '',
    reviewer_email: '',
    overall_rating: 5,
    quality_rating: 5,
    variety_rating: 5,
    pricing_rating: 5,
    review_text: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('rating') ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.reviewer_name || !formData.reviewer_email || !formData.review_text) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.review_text.length < 10) {
      setError('Review must be at least 10 characters');
      return;
    }

    setLoading(true);
    try {
      await base44.entities.VendorReview.create({
        vendor_id: vendor.id,
        vendor_name: vendor.shop_name,
        reviewer_name: formData.reviewer_name,
        reviewer_email: formData.reviewer_email,
        overall_rating: formData.overall_rating,
        categories: {
          quality: formData.quality_rating,
          variety: formData.variety_rating,
          pricing: formData.pricing_rating
        },
        review_text: formData.review_text,
        verified_purchase: false,
        status: 'pending',
        created_at: new Date().toISOString()
      });

      setFormData({
        reviewer_name: '',
        reviewer_email: '',
        overall_rating: 5,
        quality_rating: 5,
        variety_rating: 5,
        pricing_rating: 5,
        review_text: ''
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const RatingInput = ({ label, name, value, onChange }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-900">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(num => (
          <button
            key={num}
            type="button"
            onClick={() => onChange({ target: { name, value: num } })}
            className={`p-1 rounded ${
              value >= num
                ? 'text-amber-400'
                : 'text-slate-300'
            } hover:text-amber-300 transition-colors`}
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-slate-900">{vendor.shop_name}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-900 block mb-2">Name</label>
            <Input
              type="text"
              name="reviewer_name"
              value={formData.reviewer_name}
              onChange={handleInputChange}
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-900 block mb-2">Email</label>
            <Input
              type="email"
              name="reviewer_email"
              value={formData.reviewer_email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <RatingInput
            label="Overall Rating"
            name="overall_rating"
            value={formData.overall_rating}
            onChange={handleInputChange}
          />

          <div className="grid grid-cols-3 gap-3">
            <RatingInput
              label="Quality"
              name="quality_rating"
              value={formData.quality_rating}
              onChange={handleInputChange}
            />
            <RatingInput
              label="Variety"
              name="variety_rating"
              value={formData.variety_rating}
              onChange={handleInputChange}
            />
            <RatingInput
              label="Pricing"
              name="pricing_rating"
              value={formData.pricing_rating}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-900 block mb-2">Your Review</label>
            <Textarea
              name="review_text"
              value={formData.review_text}
              onChange={handleInputChange}
              placeholder="Share your experience... (minimum 10 characters)"
              rows={4}
              maxLength={500}
              required
            />
            <p className="text-xs text-slate-500 mt-1">{formData.review_text.length}/500</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <p className="text-xs text-slate-600">
            Your review will be moderated before appearing publicly.
          </p>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}