import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
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
import { AlertCircle } from 'lucide-react';

export default function QuoteResponseModal({ open, onOpenChange, quote, actionType, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    estimate: '',
    message: ''
  });

  const handleEstimateSubmit = async () => {
    if (!formData.estimate || isNaN(parseFloat(formData.estimate))) {
      setError('Please enter a valid estimate amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update quote with estimate and status
      await base44.entities.QuoteRequest.update(quote.id, {
        contractor_estimate: parseFloat(formData.estimate),
        contractor_message: formData.message || '',
        status: 'quoted',
        read_by_contractor: true
      });

      // Send notification email to customer
      await base44.integrations.Core.SendEmail({
        to: quote.customer_email,
        subject: `Estimate for ${quote.job_title} from ${quote.contractor_name}`,
        body: `Hello ${quote.customer_name},\n\n${quote.contractor_name} has sent you an estimate for your project.\n\nEstimate Amount: $${parseFloat(formData.estimate).toFixed(2)}\n\n${formData.message ? `Message:\n${formData.message}\n\n` : ''}Please log in to your SurfCoast account to review and accept or decline this estimate.\n\nBest regards,\nSurfCoast Marketplace`
      });

      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to send estimate');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageSubmit = async () => {
    if (!formData.message.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update quote message and status
      await base44.entities.QuoteRequest.update(quote.id, {
        contractor_message: formData.message,
        status: 'in_progress',
        read_by_contractor: true
      });

      // Send message email
      await base44.integrations.Core.SendEmail({
        to: quote.customer_email,
        subject: `Message from ${quote.contractor_name} regarding ${quote.job_title}`,
        body: `Hello ${quote.customer_name},\n\n${quote.contractor_name} has sent you a message:\n\n${formData.message}\n\nLog in to respond.\n\nBest regards,\nSurfCoast Marketplace`
      });

      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (actionType === 'estimate') {
      handleEstimateSubmit();
    } else if (actionType === 'message') {
      handleMessageSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {actionType === 'estimate' ? 'Send Estimate' : 'Send Message'}
          </DialogTitle>
          <DialogDescription>
            {quote.job_title} • {quote.customer_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {actionType === 'estimate' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Estimate Amount ($)
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.estimate}
                  onChange={(e) => setFormData({ ...formData, estimate: e.target.value })}
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Additional Message (Optional)
                </label>
                <Textarea
                  placeholder="e.g., Timeline, materials, approach..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Your Message
              </label>
              <Textarea
                placeholder="Type your message..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
              />
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Sending...' : actionType === 'estimate' ? 'Send Estimate' : 'Send Message'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}