import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import JobTogetherPhoto from './JobTogetherPhoto';

const RATINGS = [
  { value: 'unsatisfactory', label: 'Unsatisfactory', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'satisfactory', label: 'Satisfactory', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'good', label: 'Good', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'excellent', label: 'Excellent', color: 'bg-green-100 text-green-700 border-green-200' },
];

export default function JobCloseout({ scope, role, open, onClose }) {
  const [rating, setRating] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const queryClient = useQueryClient();

  const handleConfirm = async () => {
    if (!rating) return;
    setSubmitting(true);

    const updateData = role === 'contractor'
      ? { contractor_closeout_confirmed: true, contractor_satisfaction_rating: rating }
      : { customer_closeout_confirmed: true, customer_satisfaction_rating: rating };

    await base44.entities.ScopeOfWork.update(scope.id, updateData);

    const fresh = await base44.entities.ScopeOfWork.filter({ id: scope.id });
    const updated = fresh?.[0] || { ...scope, ...updateData };

    if (
      (updated.contractor_closeout_confirmed || (role === 'contractor')) &&
      (updated.customer_closeout_confirmed || (role === 'customer'))
    ) {
      const closedDate = new Date().toISOString().split('T')[0];
      await base44.entities.ScopeOfWork.update(scope.id, { status: 'closed', closed_date: closedDate });

      const contractorRating = role === 'contractor' ? rating : updated.contractor_satisfaction_rating;
      const customerRating = role === 'customer' ? rating : updated.customer_satisfaction_rating;
      const satisfactoryRatings = ['satisfactory', 'good', 'excellent'];

      if (satisfactoryRatings.includes(contractorRating) && satisfactoryRatings.includes(customerRating)) {
      if (scope.contractor_id) {
        const contractors = await base44.entities.Contractor.filter({ id: scope.contractor_id });
        const contractor = contractors?.[0];
        if (contractor) {
          const newCount = (contractor.completed_jobs_count || 0) + 1;
          await base44.entities.Contractor.update(contractor.id, {
            completed_jobs_count: newCount,
          });
          if (newCount === 300) {
            await base44.integrations.Core.SendEmail({
              to: 'admin@surfcoastmarketplace.com.au',
              subject: '🌊 SurfCoast Legend Achieved — Contractor',
              body: `Contractor ${contractor.name} (${contractor.email}) has just reached 300 verified completed jobs and earned the SurfCoast Legend badge!\n\nConsider reaching out to congratulate them.`,
            });
          }
        }
      }

      if (scope.customer_email) {
        const profiles = await base44.entities.CustomerProfile.filter({ email: scope.customer_email });
        const profile = profiles?.[0];
        if (profile) {
          const newCount = (profile.completed_jobs_count || 0) + 1;
          await base44.entities.CustomerProfile.update(profile.id, {
            completed_jobs_count: newCount,
          });
          if (newCount === 300) {
            await base44.integrations.Core.SendEmail({
              to: 'admin@surfcoastmarketplace.com.au',
              subject: '🌊 SurfCoast Legend Achieved — Customer',
              body: `Customer ${profile.full_name} (${profile.email}) has just reached 300 verified completed jobs and earned the SurfCoast Legend badge!\n\nConsider reaching out to congratulate them.`,
            });
          }
        }
      }
      }

      await base44.functions.invoke('createReviewFromCloseout', { scopeId: scope.id });
    }

    setDone(true);
    setSubmitting(false);
    queryClient.invalidateQueries();
  };

  const handleClose = () => {
    setRating('');
    setDone(false);
    setSubmitting(false);
    onClose();
  };

  if (!scope) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Close Out Job</DialogTitle>
          <DialogDescription>
            Confirm completion of <strong>{scope.job_title}</strong> and provide your satisfaction rating.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="font-semibold text-slate-800">Closeout confirmed!</p>
            <p className="text-sm text-slate-500">
              {role === 'contractor'
                ? "We're waiting for the customer to confirm as well."
                : "We're waiting for the contractor to confirm as well."}
              {' '}Once both parties confirm, the job will be officially closed.
            </p>
            <Button onClick={handleClose} className="mt-2 bg-amber-500 hover:bg-amber-600">Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
              <p><span className="font-medium">Job:</span> {scope.job_title}</p>
              <p><span className="font-medium">{role === 'contractor' ? 'Customer' : 'Contractor'}:</span> {role === 'contractor' ? scope.customer_name : scope.contractor_name}</p>
              <p><span className="font-medium">Cost:</span> {scope.cost_type === 'fixed' ? `$${scope.cost_amount} fixed` : `$${scope.cost_amount}/hr`}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">
                {role === 'contractor'
                  ? 'How would you rate this customer engagement?'
                  : "How would you rate the contractor's work?"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {RATINGS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setRating(r.value)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      rating === r.value
                        ? r.color + ' ring-2 ring-offset-1 ring-amber-400'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              {rating === 'unsatisfactory' && (
                <div className="mt-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Unsatisfactory ratings will close the job but won't award badge progress to either party.</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
              <Button
                onClick={handleConfirm}
                disabled={!rating || submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {submitting ? 'Confirming...' : 'Confirm Closeout'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}