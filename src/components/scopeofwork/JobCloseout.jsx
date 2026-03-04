import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, AlertTriangle, Camera, DollarSign, Loader2, X, ThumbsUp } from 'lucide-react';
import ReviewFormDetailed from '@/components/reviews/ReviewFormDetailed';

const RATINGS = [
  { value: 'unsatisfactory', label: 'Unsatisfactory', color: 'border-red-300 bg-red-50 text-red-700', blocked: true },
  { value: 'satisfactory', label: 'Satisfactory', color: 'border-green-300 bg-green-50 text-green-700', blocked: false },
  { value: 'good', label: 'Good', color: 'border-blue-300 bg-blue-50 text-blue-700', blocked: false },
  { value: 'excellent', label: 'Excellent', color: 'border-purple-300 bg-purple-50 text-purple-700', blocked: false },
];

export default function JobCloseout({ scope, role, open, onClose }) {
  const [confirming, setConfirming] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const queryClient = useQueryClient();

  if (!scope) return null;

  const hasAfterPhotos = scope.after_photo_urls?.length > 0;
  const isApproved = scope.status === 'approved';
  const isClosed = scope.status === 'closed';
  const alreadyConfirmed = role === 'contractor'
    ? scope.contractor_closeout_confirmed
    : scope.customer_closeout_confirmed;

  const canClose = hasAfterPhotos && isApproved;
  const ratingObj = RATINGS.find(r => r.value === selectedRating);
  const ratingBlocked = ratingObj?.blocked === true;
  const canConfirm = selectedRating && !ratingBlocked;

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const update = role === 'contractor'
        ? { contractor_closeout_confirmed: true, contractor_satisfaction_rating: selectedRating }
        : { customer_closeout_confirmed: true, customer_satisfaction_rating: selectedRating };

      await base44.entities.ScopeOfWork.update(scope.id, update);

      // Fetch fresh to check if both confirmed
      const fresh = await base44.entities.ScopeOfWork.filter({ id: scope.id });
      const updated = fresh[0];

      const bothConfirmed = updated.contractor_closeout_confirmed && updated.customer_closeout_confirmed;

      // Check that both sides have satisfactory or higher
      const contractorRatingOk = updated.contractor_satisfaction_rating && updated.contractor_satisfaction_rating !== 'unsatisfactory';
      const customerRatingOk = updated.customer_satisfaction_rating && updated.customer_satisfaction_rating !== 'unsatisfactory';
      const bothSatisfactory = contractorRatingOk && customerRatingOk;

      if (bothConfirmed && bothSatisfactory) {
        await base44.entities.ScopeOfWork.update(scope.id, {
          status: 'closed',
          closed_date: new Date().toISOString(),
        });

        // Increment contractor's completed jobs count for badge tracking
        if (scope.contractor_id) {
          const contractorList = await base44.entities.Contractor.filter({ id: scope.contractor_id });
          if (contractorList.length > 0) {
            const current = contractorList[0].completed_jobs_count || 0;
            await base44.entities.Contractor.update(scope.contractor_id, {
              completed_jobs_count: current + 1,
            });
          }
        }

        // Increment customer's completed jobs count for badge tracking
        if (scope.customer_email) {
          const profileList = await base44.entities.CustomerProfile.filter({ email: scope.customer_email });
          if (profileList.length > 0) {
            const current = profileList[0].completed_jobs_count || 0;
            await base44.entities.CustomerProfile.update(profileList[0].id, {
              completed_jobs_count: current + 1,
            });
          }
        }

        // Notify both parties
        await Promise.all([
          base44.integrations.Core.SendEmail({
            to: scope.customer_email,
            subject: `✅ Job Closed Out — ${scope.job_title}`,
            body: `Hello ${scope.customer_name},\n\nBoth you and ${scope.contractor_name} have confirmed job completion for "${scope.job_title}" with satisfactory ratings.\n\nThe job has been officially closed out on SurfCoast Market Place. Your loyalty badge progress has been updated!\n\nSurfCoast Market Place`,
          }),
          base44.integrations.Core.SendEmail({
            to: scope.contractor_email || '',
            subject: `✅ Job Closed Out — ${scope.job_title}`,
            body: `Hello ${scope.contractor_name},\n\nBoth you and ${scope.customer_name} have confirmed job completion for "${scope.job_title}" with satisfactory ratings.\n\nThe job has been officially closed out. Your SurfCoast Contractor badge progress has been updated!\n\nSurfCoast Market Place`,
          }),
        ]);

        // Show review prompt
        if (role === 'customer') {
          setShowReviewForm(true);
        }
      } else if (bothConfirmed && !bothSatisfactory) {
        // Both confirmed but rating too low — close but don't award badges
        await base44.entities.ScopeOfWork.update(scope.id, {
          status: 'closed',
          closed_date: new Date().toISOString(),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-scopes'] });
      queryClient.invalidateQueries({ queryKey: ['contractor-scopes'] });
      queryClient.invalidateQueries({ queryKey: ['contractor-past-work'] });
      setConfirming(false);
      if (!showReviewForm) onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Job Closeout — {scope.job_title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Status Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border ${isApproved ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
              <CheckCircle2 className={`w-5 h-5 ${isApproved ? 'text-green-600' : 'text-slate-400'}`} />
              <span className="text-xs font-medium text-center">Scope Approved</span>
              <Badge className={isApproved ? 'bg-green-100 text-green-700 text-xs' : 'bg-slate-100 text-slate-500 text-xs'}>
                {isApproved ? 'Yes' : 'No'}
              </Badge>
            </div>

            <div className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border ${hasAfterPhotos ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <Camera className={`w-5 h-5 ${hasAfterPhotos ? 'text-green-600' : 'text-red-400'}`} />
              <span className="text-xs font-medium text-center">After Photos</span>
              <Badge className={hasAfterPhotos ? 'bg-green-100 text-green-700 text-xs' : 'bg-red-100 text-red-700 text-xs'}>
                {hasAfterPhotos ? `${scope.after_photo_urls.length} uploaded` : 'Missing'}
              </Badge>
            </div>

            <div className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border ${isClosed ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              <DollarSign className={`w-5 h-5 ${isClosed ? 'text-green-600' : 'text-amber-500'}`} />
              <span className="text-xs font-medium text-center">Payment</span>
              <Badge className={isClosed ? 'bg-green-100 text-green-700 text-xs' : 'bg-amber-100 text-amber-700 text-xs'}>
                {isClosed ? 'Confirmed' : 'Confirm below'}
              </Badge>
            </div>
          </div>

          {!canClose && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {!isApproved && 'The scope of work must be approved by the customer before closing. '}
                {!hasAfterPhotos && 'After photos must be uploaded before the job can be closed.'}
              </span>
            </div>
          )}

          {isClosed ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <div className="font-semibold text-green-800">Job Officially Closed</div>
                  <div className="text-xs text-green-700">Both parties confirmed on {scope.closed_date ? new Date(scope.closed_date).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>

              {role === 'customer' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800 mb-3">Would you like to leave a review for {scope.contractor_name}?</p>
                  <Button onClick={() => setShowReviewForm(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Leave a Review
                  </Button>
                </div>
              )}

              {role === 'contractor' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800 mb-3">Would you like to leave feedback for {scope.customer_name}?</p>
                  <Button onClick={() => setShowReviewForm(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Leave Feedback
                  </Button>
                </div>
              )}
            </div>
          ) : canClose && (
            <>
              {/* Confirmation Status */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Confirmation Status:</p>
                <div className="flex items-center gap-2 text-sm">
                  {scope.contractor_closeout_confirmed
                    ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                    : <X className="w-4 h-4 text-slate-400" />}
                  <span className={scope.contractor_closeout_confirmed ? 'text-green-700' : 'text-slate-500'}>
                    Contractor confirmed {scope.contractor_satisfaction_rating && `(${scope.contractor_satisfaction_rating})`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {scope.customer_closeout_confirmed
                    ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                    : <X className="w-4 h-4 text-slate-400" />}
                  <span className={scope.customer_closeout_confirmed ? 'text-green-700' : 'text-slate-500'}>
                    Customer confirmed payment made & satisfied {scope.customer_satisfaction_rating && `(${scope.customer_satisfaction_rating})`}
                  </span>
                </div>
              </div>

              {alreadyConfirmed ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                  You have confirmed. Waiting for the {role === 'contractor' ? 'customer' : 'contractor'} to confirm their side.
                </div>
              ) : !confirming ? (
                <div className="space-y-4">
                  {/* Satisfaction Rating */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ThumbsUp className="w-4 h-4 text-amber-500" />
                      <p className="text-sm font-medium text-slate-700">
                        {role === 'customer' ? 'Rate the contractor\'s work:' : 'Rate this customer/engagement:'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {RATINGS.map(r => (
                        <button
                          key={r.value}
                          onClick={() => setSelectedRating(r.value)}
                          className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                            selectedRating === r.value
                              ? r.color + ' border-opacity-100 ring-2 ring-offset-1 ' + (r.value === 'unsatisfactory' ? 'ring-red-400' : 'ring-green-400')
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                    {ratingBlocked && (
                      <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        An <strong>Unsatisfactory</strong> rating will close this job but <strong>no badges will be awarded</strong> to either party. Both sides must rate Satisfactory or higher to count toward badge progress.
                      </div>
                    )}
                    {selectedRating && !ratingBlocked && (
                      <p className="text-xs text-green-700 mt-2">✓ This rating will count toward badge progress for both parties.</p>
                    )}
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                    {role === 'customer'
                      ? 'By confirming, you attest that you have paid the contractor in full and are satisfied with the completed work.'
                      : 'By confirming, you attest that the work has been completed in full accordance with the agreed scope.'}
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setConfirming(true)}
                    disabled={!canConfirm && !ratingBlocked ? true : !selectedRating}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {role === 'customer' ? 'Confirm Payment Made & Work Complete' : 'Confirm Work Completed'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-800">
                    Confirming with rating: <strong className="capitalize">{selectedRating}</strong>. This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setConfirming(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => confirmMutation.mutate()}
                      disabled={confirmMutation.isPending}
                    >
                      {confirmMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                      Yes, Confirm
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Review Form Modal */}
        {showReviewForm && role === 'customer' && (
          <ReviewFormDetailed
            revieweeId={scope.contractor_id}
            revieweeName={scope.contractor_name}
            revieweeType="contractor"
            scopeId={scope.id}
            jobTitle={scope.job_title}
            open={showReviewForm}
            onClose={() => { setShowReviewForm(false); onClose(); }}
          />
        )}

        {showReviewForm && role === 'contractor' && (
          <ReviewFormDetailed
            revieweeId={scope.customer_email}
            revieweeName={scope.customer_name}
            revieweeType="customer"
            scopeId={scope.id}
            jobTitle={scope.job_title}
            open={showReviewForm}
            onClose={() => { setShowReviewForm(false); onClose(); }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}