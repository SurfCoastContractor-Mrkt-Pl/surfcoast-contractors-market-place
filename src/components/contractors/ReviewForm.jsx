import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, Loader2 } from 'lucide-react';

export default function ReviewForm({ contractorId, contractorName, scopeId, open, onClose }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Review.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', contractorId] });
      setRating(5);
      setComment('');
      setReviewerName('');
      setReviewerEmail('');
      onClose();
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewerName || !reviewerEmail || !comment) {
      alert('Please fill in all required fields');
      return;
    }

    const scopeData = await base44.entities.ScopeOfWork.get(scopeId);

    await createMutation.mutateAsync({
      contractor_id: contractorId,
      contractor_name: contractorName,
      reviewer_name: reviewerName,
      reviewer_email: reviewerEmail,
      job_title: scopeData.job_title,
      rating,
      comment,
      verified: true,
      work_date: scopeData.agreed_work_date
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-semibold mb-2 block">Rating *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`w-6 h-6 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {rating === 5 && "Excellent work!"}
              {rating === 4 && "Very good"}
              {rating === 3 && "Good"}
              {rating === 2 && "Fair"}
              {rating === 1 && "Poor"}
            </p>
          </div>

          <div>
            <Label htmlFor="name">Your Name *</Label>
            <input
              id="name"
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="John Doe"
              className="w-full mt-1.5 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <Label htmlFor="email">Your Email *</Label>
            <input
              id="email"
              type="email"
              value={reviewerEmail}
              onChange={(e) => setReviewerEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full mt-1.5 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <Label htmlFor="comment">Your Review *</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience working with this contractor..."
              className="mt-1.5 h-24"
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !reviewerName || !reviewerEmail || !comment}
              className="flex-1 bg-amber-500 hover:bg-amber-600"
            >
              {createMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
              ) : (
                <>Submit Review</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}