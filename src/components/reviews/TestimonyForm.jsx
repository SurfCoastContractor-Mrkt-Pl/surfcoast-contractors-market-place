import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, Loader2, MessageSquareQuote } from 'lucide-react';

export default function TestimonyForm({ contractorId, contractorName, open, onClose, user }) {
  const queryClient = useQueryClient();
  const [overallRating, setOverallRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('submitReview', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'contractor', contractorId] });
      setSubmitted(true);
    },
    onError: (err) => {
      const msg = err?.response?.data?.error || 'Failed to submit testimony. Please try again.';
      alert(msg);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment) {
      alert('Please write your testimony before submitting.');
      return;
    }

    createMutation.mutate({
      contractor_id: contractorId,
      contractor_name: contractorName,
      overall_rating: overallRating,
      comment,
      is_testimony: true,
    });
  };

  const handleClose = () => {
    setSubmitted(false);
    setOverallRating(5);
    setComment('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-amber-500" />
            Leave a Testimony for {contractorName}
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="text-4xl">🙏</div>
            <h3 className="text-lg font-semibold text-slate-900">Thank you for your testimony!</h3>
            <p className="text-sm text-slate-600">Your feedback helps others find great contractors.</p>
            <Button onClick={handleClose} className="bg-amber-500 hover:bg-amber-600 mt-4">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Reviewer info (read-only) */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700">
              Submitting as <strong>{user?.full_name}</strong> ({user?.email})
            </div>

            {/* Overall Rating */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Overall Rating *</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setOverallRating(star)}
                    className="p-1 transition-colors"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        overallRating >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {overallRating === 5 && "Excellent!"}
                {overallRating === 4 && "Very good"}
                {overallRating === 3 && "Good"}
                {overallRating === 2 && "Fair"}
                {overallRating === 1 && "Poor"}
              </p>
            </div>

            {/* Testimony Text */}
            <div>
              <Label htmlFor="testimony-comment">Your Testimony *</Label>
              <Textarea
                id="testimony-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience working with this contractor..."
                className="mt-1.5 h-28 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !comment}
                className="flex-1 bg-amber-500 hover:bg-amber-600"
              >
                {createMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                ) : (
                  'Submit Testimony'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}