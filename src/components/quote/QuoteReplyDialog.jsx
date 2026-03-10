import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function QuoteReplyDialog({ request, open, onClose }) {
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (request) {
      setQuoteAmount(request.quote_amount || '');
      setQuoteMessage(request.quote_message || '');
    }
  }, [request]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.QuoteRequest.update(request.id, {
        quote_amount: parseFloat(quoteAmount),
        quote_message: quoteMessage,
        status: 'quoted',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quoteRequests'] });
      onClose();
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quoteAmount) return;
    await updateMutation.mutateAsync();
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Quote to {request.customer_name}</DialogTitle>
          <DialogDescription>
            Provide your quote amount and optional message
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="job-description" className="text-slate-700">
              Work Description
            </Label>
            <p className="text-sm text-slate-600 mt-1 p-2 bg-slate-50 rounded">
              {request.work_description}
            </p>
          </div>

          <div>
            <Label htmlFor="quote-amount" className="text-slate-700">
              Quote Amount ($) *
            </Label>
            <Input
              id="quote-amount"
              type="number"
              step="0.01"
              min="0"
              value={quoteAmount}
              onChange={(e) => setQuoteAmount(e.target.value)}
              placeholder="0.00"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="quote-message" className="text-slate-700">
              Message (Optional)
            </Label>
            <Textarea
              id="quote-message"
              value={quoteMessage}
              onChange={(e) => setQuoteMessage(e.target.value)}
              placeholder="Add details about your quote, timeline, etc."
              className="mt-1 resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={updateMutation.isPending || !quoteAmount}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Quote'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}