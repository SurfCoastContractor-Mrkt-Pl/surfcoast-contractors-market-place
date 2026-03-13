import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Star, Loader2 } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ProjectCompletionTracker({ scopeId, scopeData, open, onClose, onCompletionSuccess }) {
  const [ratingStep, setRatingStep] = useState(true);
  const [contractorRating, setContractorRating] = useState(0);
  const [customerRating, setCustomerRating] = useState(0);
  const [completionStep, setCompletionStep] = useState('rating'); // rating | processing | confirmed

  const completionMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('finalizeProjectCompletion', {
        scope_id: scopeId,
        contractor_rating: contractorRating || null,
        customer_rating: customerRating || null,
      });
      return response.data;
    },
    onSuccess: () => {
      setCompletionStep('confirmed');
      setTimeout(() => {
        onCompletionSuccess?.();
        handleClose();
      }, 2500);
    },
  });

  const handleSubmitCompletion = async () => {
    setCompletionStep('processing');
    await completionMutation.mutateAsync();
  };

  const handleClose = () => {
    setRatingStep(true);
    setContractorRating(0);
    setCustomerRating(0);
    setCompletionStep('rating');
    onClose();
  };

  const StarRating = ({ value, onChange, maxStars = 5, label = '' }) => (
    <div>
      {label && <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>}
      <div className="flex gap-2">
        {Array.from({ length: maxStars }).map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i + 1)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                i < value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Mark Project as Complete</DialogTitle>
          <DialogDescription>
            Record completion and satisfaction ratings for this project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Summary */}
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="pt-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-600">Project:</span>
                  <p className="font-semibold text-slate-900">{scopeData?.job_title}</p>
                </div>
                <div>
                  <span className="text-slate-600">Contractor:</span>
                  <p className="font-semibold text-slate-900">{scopeData?.contractor_name}</p>
                </div>
                <div>
                  <span className="text-slate-600">Estimate:</span>
                  <p className="font-semibold text-slate-900">
                    {scopeData?.cost_type === 'hourly'
                      ? `$${scopeData?.cost_amount}/hr`
                      : `$${scopeData?.cost_amount}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating Step */}
          {completionStep === 'rating' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                <p className="font-medium mb-1">How satisfied were you with this project?</p>
                <p className="text-xs">Your ratings help build trust in the marketplace and provide valuable feedback.</p>
              </div>

              <StarRating
                value={contractorRating}
                onChange={setContractorRating}
                label="Contractor's Work Quality"
              />

              <StarRating
                value={customerRating}
                onChange={setCustomerRating}
                label="Customer Experience"
              />

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={handleClose} disabled={completionMutation.isPending}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitCompletion}
                  disabled={completionMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {completionMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark Complete
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {completionStep === 'processing' && (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-slate-600">Finalizing project completion...</p>
              </div>
            </div>
          )}

          {/* Confirmed Step */}
          {completionStep === 'confirmed' && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Project Complete!</h3>
              <p className="text-slate-600 text-sm">
                Your ratings have been recorded and the project is now closed. Both parties have been notified.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}