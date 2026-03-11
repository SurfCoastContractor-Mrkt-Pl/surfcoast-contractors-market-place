import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Upload, X, Loader2 } from 'lucide-react';

const DISPUTE_CATEGORIES = [
  { value: 'payment_issue', label: 'Payment Issue' },
  { value: 'work_quality', label: 'Work Quality' },
  { value: 'timeline_delay', label: 'Timeline Delay' },
  { value: 'communication_problem', label: 'Communication Problem' },
  { value: 'contract_breach', label: 'Contract Breach' },
  { value: 'safety_concern', label: 'Safety Concern' },
  { value: 'other', label: 'Other' }
];

export default function DisputeInitiationForm({ scope, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [evidenceUrls, setEvidenceUrls] = useState([]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setEvidenceFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!category || !title || !description) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Upload evidence files if any
      let uploadedUrls = [...evidenceUrls];
      for (const file of evidenceFiles) {
        const fileData = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(fileData)));
        const uploadResponse = await base44.integrations.Core.UploadFile({
          file: base64
        });
        uploadedUrls.push(uploadResponse.file_url);
      }

      // Submit dispute
      const response = await base44.functions.invoke('submitDisputeWithPaymentPause', {
        initiator_type: scope.customer_email ? 'customer' : 'contractor',
        respondent_email: scope.contractor_email || scope.customer_email,
        respondent_name: scope.contractor_name || scope.customer_name,
        respondent_type: scope.contractor_email ? 'contractor' : 'customer',
        category,
        severity,
        title,
        description,
        evidence_urls: uploadedUrls,
        scope_id: scope.id,
        job_id: scope.job_id
      });

      if (response.data.success) {
        onSuccess(response.data.dispute_id);
        onClose();
      }
    } catch (error) {
      console.error('Dispute submission error:', error);
      alert('Failed to submit dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!scope} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            File a Dispute
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Scope Summary */}
          <Card className="bg-slate-50">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-2">This dispute is for:</p>
              <p className="font-semibold">{scope?.job_title || 'Project'}</p>
              <p className="text-xs text-slate-500 mt-1">
                Scope ID: {scope?.id}
              </p>
            </CardContent>
          </Card>

          {/* Dispute Details */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Category *</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dispute category" />
                </SelectTrigger>
                <SelectContent>
                  {DISPUTE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Severity</label>
              <Select value={severity} onValueChange={setSeverity}>
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

            <div>
              <label className="text-sm font-medium mb-2 block">Title *</label>
              <Input
                placeholder="Brief title of the dispute"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description *</label>
              <Textarea
                placeholder="Provide detailed explanation of the issue and what you expect as resolution..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-32"
              />
            </div>

            {/* Evidence Upload */}
            <div>
              <label className="text-sm font-medium mb-2 block">Evidence & Documentation</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                <input
                  type="file"
                  id="evidence-upload"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <label htmlFor="evidence-upload" className="cursor-pointer">
                  <div className="flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900">
                    <Upload className="w-5 h-5" />
                    <span>Click to upload evidence (photos, documents, etc.)</span>
                  </div>
                </label>
              </div>

              {/* File List */}
              {evidenceFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-slate-600">Selected files:</p>
                  {evidenceFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                      <span className="text-xs text-slate-700">{file.name}</span>
                      <button
                        onClick={() => removeFile(idx)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              <p className="font-medium mb-1">⚠️ Important</p>
              <ul className="text-xs space-y-1">
                <li>• Filing a dispute will automatically pause related payments</li>
                <li>• An admin will review and contact both parties</li>
                <li>• Provide clear evidence to support your case</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  File Dispute
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}