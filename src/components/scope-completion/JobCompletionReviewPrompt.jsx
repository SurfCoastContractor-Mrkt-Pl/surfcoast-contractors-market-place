import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import ClientReviewForm from '@/components/reviews/ClientReviewForm';

export default function JobCompletionReviewPrompt({ open, onOpenChange, scope, contractor }) {
  const [showReviewForm, setShowReviewForm] = useState(false);

  return (
    <>
      <Dialog open={open && !showReviewForm} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Experience</DialogTitle>
            <DialogDescription>
              How was your experience with {contractor?.name}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <p className="text-sm text-slate-600 mb-2">Your feedback helps other clients make informed decisions</p>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-6 h-6 text-slate-300" />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => setShowReviewForm(true)}
                className="w-full"
              >
                Leave a Review
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                Skip for Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showReviewForm && scope && contractor && (
        <ClientReviewForm
          open={showReviewForm}
          onOpenChange={(open) => {
            if (!open) {
              setShowReviewForm(false);
              onOpenChange(false);
            }
          }}
          scope={scope}
          contractor={contractor}
          onSuccess={() => {
            setShowReviewForm(false);
            onOpenChange(false);
          }}
        />
      )}
    </>
  );
}