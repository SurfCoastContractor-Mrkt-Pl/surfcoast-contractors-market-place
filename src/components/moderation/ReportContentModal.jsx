import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const violationCategories = [
  { value: 'illegal_activity', label: 'Illegal Activity' },
  { value: 'harassment', label: 'Harassment or Threats' },
  { value: 'hate_speech', label: 'Hate Speech or Discrimination' },
  { value: 'scam_fraud', label: 'Scam or Fraud' },
  { value: 'unsafe_services', label: 'Unsafe or Exploitative Services' },
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'spam', label: 'Spam' },
  { value: 'other', label: 'Other' },
];

export default function ReportContentModal({
  open,
  onClose,
  targetUserEmail,
  targetUserName,
  contentType,
  contentPreview,
}) {
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!category || !reason.trim()) {
      setError('Please select a violation category and provide a reason.');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Please provide at least 10 characters explaining the issue.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await base44.functions.invoke('submitContentReport', {
        content_type: contentType,
        violation_category: category,
        target_user_email: targetUserEmail,
        target_user_name: targetUserName,
        content_preview: contentPreview,
        reason: reason.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setCategory('');
        setReason('');
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Report submission error:', err);
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
      setCategory('');
      setReason('');
      setError('');
      setSuccess(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            Help us keep SurfCoast safe. Report violations or inappropriate behavior.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-semibold text-slate-900">Report Submitted</p>
            <p className="text-sm text-slate-600">
              Thank you. Our team will review this report shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Violation Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {violationCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Details
              </label>
              <Textarea
                placeholder="Describe why you're reporting this content..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-24"
                disabled={submitting}
              />
              <p className="text-xs text-slate-500 mt-1">
                {reason.length}/500 characters
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !category || !reason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { CheckCircle2 } from 'lucide-react';