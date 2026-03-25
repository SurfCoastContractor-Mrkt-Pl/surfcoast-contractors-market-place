import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, AlertCircle } from 'lucide-react';

export default function ClientReviewForm({ open, onOpenChange, scope, contractor, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    if (rating < 1 || !comment.trim()) {
      setError('Please provide a rating and comment');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await base44.auth.me();
      
      // Create review record
      await base44.entities.Review.create({
        contractor_id: contractor.id,
        contractor_name: contractor.name,
        scope_id: scope.id,
        reviewer_name: user?.full_name || 'Anonymous',
        reviewer_email: user?.email || '',
        reviewer_type: 'customer',
        job_title: scope.job_title,
        overall_rating: rating,
        quality_rating: rating,
        punctuality_rating: rating,
        communication_rating: rating,
        professionalism_rating: rating,
        comment: comment,
        verified: true,
        work_date: scope.agreed_work_date
      });

      // Send notification email to contractor
      await base44.integrations.Core.SendEmail({
        to: contractor.email,
        subject: `New Review from ${user?.full_name || 'A Client'} for ${scope.job_title}`,
        body: `Congratulations! You received a ${rating}-star review.\n\nComment:\n${comment}\n\nLog in to see all your reviews.`
      });

      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>
            {scope?.job_title} with {contractor?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-3">
              Overall Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Your Feedback
            </label>
            <Textarea
              placeholder="Tell us about your experience with this contractor..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}