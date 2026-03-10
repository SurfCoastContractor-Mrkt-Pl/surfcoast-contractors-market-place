import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Upload } from 'lucide-react';

export default function DisputeSubmissionForm({ open, onClose, scope = null }) {
  const [formData, setFormData] = useState({
    respondent_email: '',
    respondent_name: '',
    respondent_type: '',
    category: '',
    severity: 'medium',
    title: '',
    description: '',
    evidence_urls: []
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('submitDispute', {
        ...formData,
        scope_id: scope?.id || null,
        job_id: scope?.job_id || null,
        job_title: scope?.job_title || null
      });
      return response.data;
    },
    onSuccess: (data) => {
      setError('');
      setFormData({
        respondent_email: '',
        respondent_name: '',
        respondent_type: '',
        category: '',
        severity: 'medium',
        title: '',
        description: '',
        evidence_urls: []
      });
      onClose();
      alert(`Dispute ${data.dispute_number} submitted successfully. An admin will review it shortly.`);
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to submit dispute');
    }
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const result = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(result.file_url);
      }
      setFormData(prev => ({
        ...prev,
        evidence_urls: [...prev.evidence_urls, ...uploadedUrls]
      }));
    } catch (err) {
      setError('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>File a Dispute</DialogTitle>
          <DialogDescription>
            Report an issue with a contractor or customer. Our admin team will review and mediate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Respondent Name *</label>
              <Input
                value={formData.respondent_name}
                onChange={(e) => setFormData({ ...formData, respondent_name: e.target.value })}
                placeholder="Name of the other party"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email *</label>
              <Input
                value={formData.respondent_email}
                onChange={(e) => setFormData({ ...formData, respondent_email: e.target.value })}
                placeholder="their@email.com"
                type="email"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Their Type *</label>
              <Select value={formData.respondent_type} onValueChange={(value) => setFormData({ ...formData, respondent_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Severity *</label>
              <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Category *</label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment_issue">Payment Issue</SelectItem>
                <SelectItem value="work_quality">Work Quality</SelectItem>
                <SelectItem value="timeline_delay">Timeline Delay</SelectItem>
                <SelectItem value="communication_problem">Communication Problem</SelectItem>
                <SelectItem value="contract_breach">Contract Breach</SelectItem>
                <SelectItem value="safety_concern">Safety Concern</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief summary of the issue"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide detailed information about the dispute"
              className="h-32"
            />
            <p className="text-xs text-slate-500 mt-1">{formData.description.length}/3000 characters</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Supporting Evidence</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="evidence-upload"
              />
              <label htmlFor="evidence-upload" className="cursor-pointer">
                <Upload className="w-5 h-5 mx-auto mb-2 text-slate-400" />
                <p className="text-sm text-slate-600">Click to upload photos or documents</p>
              </label>
            </div>
            {formData.evidence_urls.length > 0 && (
              <p className="text-sm text-slate-600 mt-2">{formData.evidence_urls.length} file(s) uploaded</p>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || uploading || !formData.respondent_name || !formData.respondent_email || !formData.category || !formData.title || !formData.description}
              className="bg-red-600 hover:bg-red-700"
            >
              {mutation.isPending ? 'Submitting...' : 'Submit Dispute'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}