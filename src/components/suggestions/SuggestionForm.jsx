import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Loader2, Lightbulb } from 'lucide-react';

export default function SuggestionForm({ open, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    submitter_name: '',
    submitter_email: '',
    submitter_type: '',
    category: '',
    suggestion: '',
  });

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Suggestion.create(data),
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ ...formData, admin_read: false });
  };

  const handleClose = () => {
    setSubmitted(false);
    setFormData({ submitter_name: '', submitter_email: '', submitter_type: '', category: '', suggestion: '' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Share a Suggestion
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Thank You!</h3>
            <p className="text-slate-600 text-sm mb-6">
              Your suggestion has been submitted and will be reviewed by our team.
            </p>
            <Button onClick={handleClose} className="bg-amber-500 hover:bg-amber-600 text-slate-900">Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="s_name">Your Name *</Label>
                <Input
                  id="s_name"
                  value={formData.submitter_name}
                  onChange={(e) => setFormData(p => ({ ...p, submitter_name: e.target.value }))}
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="s_email">Your Email *</Label>
                <Input
                  id="s_email"
                  type="email"
                  value={formData.submitter_email}
                  onChange={(e) => setFormData(p => ({ ...p, submitter_email: e.target.value }))}
                  required
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>I am a *</Label>
                <Select value={formData.submitter_type} onValueChange={(v) => setFormData(p => ({ ...p, submitter_type: v }))}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature_request">Feature Request</SelectItem>
                    <SelectItem value="bug_report">Bug Report</SelectItem>
                    <SelectItem value="general_feedback">General Feedback</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="s_body">Your Suggestion *</Label>
              <Textarea
                id="s_body"
                value={formData.suggestion}
                onChange={(e) => setFormData(p => ({ ...p, suggestion: e.target.value }))}
                placeholder="Describe your idea, feedback, or issue in detail..."
                required
                rows={5}
                className="mt-1.5"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
              <Button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                disabled={mutation.isPending || !formData.submitter_type || !formData.category}
              >
                {mutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : 'Submit Suggestion'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}