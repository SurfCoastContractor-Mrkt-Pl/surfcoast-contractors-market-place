import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, Loader2 } from 'lucide-react';

const CriteriaRating = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">{label}</Label>
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-1 transition-colors"
        >
          <Star
            className={`w-5 h-5 ${
              value >= star
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300'
            }`}
          />
        </button>
      ))}
    </div>
  </div>
);

export default function ReviewFormDetailed({
  revieweeId,
  revieweeName,
  revieweeType,
  scopeId,
  jobTitle,
  open,
  onClose,
}) {
  const queryClient = useQueryClient();
  const [overallRating, setOverallRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [professionalismRating, setProfessionalismRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Review.create(data),
    onSuccess: () => {
      const queryKey = revieweeType === 'contractor' 
        ? ['reviews', 'contractor', revieweeId]
        : ['reviews', 'customer', revieweeId];
      queryClient.invalidateQueries({ queryKey });
      resetForm();
      onClose();
    }
  });

  const resetForm = () => {
    setOverallRating(5);
    setQualityRating(5);
    setPunctualityRating(5);
    setCommunicationRating(5);
    setProfessionalismRating(5);
    setComment('');
    setReviewerName('');
    setReviewerEmail('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enforce verified reviews only if no scope provided
    if (!scopeId && !revieweeType === 'contractor') {
      alert('Reviews can only be submitted for completed jobs or by verified contractors');
      return;
    }
    
    if (!reviewerName || !reviewerEmail || !comment) {
      alert('Please fill in all required fields');
      return;
    }

    const reviewData = {
      reviewer_name: reviewerName,
      reviewer_email: reviewerEmail,
      reviewer_type: revieweeType === 'contractor' ? 'customer' : 'contractor',
      job_title: jobTitle || 'Project',
      overall_rating: overallRating,
      quality_rating: qualityRating,
      punctuality_rating: punctualityRating,
      communication_rating: communicationRating,
      professionalism_rating: professionalismRating,
      comment,
      verified: !!scopeId,
      scope_id: scopeId,
    };

    if (revieweeType === 'contractor') {
      reviewData.contractor_id = revieweeId;
      reviewData.contractor_name = revieweeName;
    } else {
      reviewData.customer_id = revieweeId;
      reviewData.customer_name = revieweeName;
    }

    if (scopeId) {
      try {
        const scopeData = await base44.entities.ScopeOfWork.get(scopeId);
        reviewData.work_date = scopeData?.agreed_work_date || new Date().toISOString().split('T')[0];
      } catch (error) {
        console.error('Error fetching scope:', error);
      }
    }

    createMutation.mutate(reviewData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Leave a Review for {revieweeName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                    className={`w-6 h-6 ${
                      overallRating >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {overallRating === 5 && "Excellent!"}
              {overallRating === 4 && "Very good"}
              {overallRating === 3 && "Good"}
              {overallRating === 2 && "Fair"}
              {overallRating === 1 && "Poor"}
            </p>
          </div>

          {/* Detailed Criteria */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Rate specific criteria:</h3>
            <CriteriaRating label="Quality of Work" value={qualityRating} onChange={setQualityRating} />
            <CriteriaRating label="Punctuality" value={punctualityRating} onChange={setPunctualityRating} />
            <CriteriaRating label="Communication" value={communicationRating} onChange={setCommunicationRating} />
            <CriteriaRating label="Professionalism" value={professionalismRating} onChange={setProfessionalismRating} />
          </div>

          {/* Reviewer Info */}
          <div className="border-t pt-4 space-y-3">
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
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment">Your Review *</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
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