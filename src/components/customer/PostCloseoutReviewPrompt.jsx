import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle2 } from 'lucide-react';

export default function PostCloseoutReviewPrompt({ scope, reviewerType, reviewerEmail, reviewerName, open, onClose }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const queryClient = useQueryClient();

  if (!scope) return null;

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);

    const isReviewingContractor = reviewerType === 'client';

    await base44.entities.Review.create({
      scope_id: scope.id,
      contractor_id: scope.contractor_id,
      contractor_name: scope.contractor_name,
      contractor_email: scope.contractor_email,
      client_name: scope.client_name,
      scope_id: scope.id,
      reviewer_name: reviewerName,
      reviewer_email: reviewerEmail,
      reviewer_type: reviewerType,
      job_title: scope.job_title,
      overall_rating: rating,
      comment: comment,
      verified: true,
      work_date: scope.agreed_work_date,
    });

    queryClient.invalidateQueries();
    setSubmitting(false);
    setDone(true);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>
            {reviewerType === 'client'
              ? `How did ${scope.contractor_name} do on "${scope.job_title}"?`
              : `How was working with ${scope.client_name} on "${scope.job_title}"?`}
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="font-semibold text-slate-800">Review submitted — thank you!</p>
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">Close</Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Star Rating */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Overall Rating</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className="w-8 h-8 transition-colors"
                      fill={star <= rating ? '#f59e0b' : 'none'}
                      stroke={star <= rating ? '#f59e0b' : '#94a3b8'}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Review</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full border border-slate-300 rounded-lg p-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={onClose} className="flex-1">Skip</Button>
              <Button
                onClick={handleSubmit}
                disabled={rating === 0 || submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}