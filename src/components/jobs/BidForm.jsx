import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function BidForm({ job, contractor, customer, open, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    proposed_amount: '',
    estimated_duration: '',
    cover_letter: '',
  });
  const [error, setError] = useState('');

  const submitBidMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Bid.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-bids', job.id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setFormData({ proposed_amount: '', estimated_duration: '', cover_letter: '' });
      setError('');
      onClose();
    },
    onError: (err) => {
      setError(err.message || 'Failed to submit bid');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.proposed_amount || parseFloat(formData.proposed_amount) <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    if (!formData.cover_letter.trim()) {
      setError('Please explain why you are a good fit for this job');
      return;
    }

    submitBidMutation.mutate({
      job_id: job.id,
      contractor_id: contractor.id,
      contractor_name: contractor.name,
      contractor_email: contractor.email,
      job_title: job.title,
      proposed_amount: parseFloat(formData.proposed_amount),
      estimated_duration: formData.estimated_duration || null,
      cover_letter: formData.cover_letter,
      customer_email: customer.email,
      customer_name: customer.full_name,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Bid for {job.title}</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="proposed_amount">Your Bid Amount *</Label>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-slate-600">$</span>
              <Input
                id="proposed_amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.proposed_amount}
                onChange={(e) => setFormData({ ...formData, proposed_amount: e.target.value })}
                disabled={submitBidMutation.isPending}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="estimated_duration">Estimated Duration (Optional)</Label>
            <Input
              id="estimated_duration"
              placeholder="e.g., '3-5 days' or '2 weeks'"
              value={formData.estimated_duration}
              onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
              disabled={submitBidMutation.isPending}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="cover_letter">Why You're a Good Fit *</Label>
            <Textarea
              id="cover_letter"
              placeholder="Explain your qualifications, relevant experience, and why you would be great for this job..."
              value={formData.cover_letter}
              onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
              disabled={submitBidMutation.isPending}
              rows={6}
              className="mt-1.5 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitBidMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitBidMutation.isPending}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900"
            >
              {submitBidMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Bid'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}