import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ComplianceAppealForm({ contractor, violationType, onSubmit }) {
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setEvidence((prev) => [...prev, file_url]);
    } catch (error) {
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitAppeal = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for your appeal');
      return;
    }

    try {
      setSubmitting(true);
      await base44.entities.ComplianceAppeal.create({
        contractor_id: contractor.id,
        contractor_email: contractor.email,
        violation_type: violationType,
        appeal_reason: reason,
        evidence_urls: evidence,
        submitted_at: new Date().toISOString(),
      });

      alert('Appeal submitted successfully. Admins will review within 2-3 business days.');
      setReason('');
      setEvidence([]);
      onSubmit && onSubmit();
    } catch (error) {
      alert('Failed to submit appeal');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const violationDescriptions = {
    payment_compliance:
      'Appeal off-platform payment detection by explaining the situation and providing evidence of corrective action.',
    minor_hours:
      'Appeal your account lock by explaining extenuating circumstances for exceeding the 20-hour weekly limit.',
    after_photo:
      'Appeal your account lock by uploading the missing after photos and explaining the delay.',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Compliance Appeal</CardTitle>
        <CardDescription>{violationDescriptions[violationType]}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Appeal Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain your situation and why your account should be unlocked..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Upload Evidence (Optional)
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-slate-400 transition">
            <input
              type="file"
              multiple
              onChange={(e) => {
                for (const file of e.target.files) {
                  handleFileUpload(file);
                }
              }}
              disabled={uploading}
              className="hidden"
              id="evidence-upload"
            />
            <label htmlFor="evidence-upload" className="cursor-pointer">
              <Upload className="w-6 h-6 mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-600">
                {uploading ? 'Uploading...' : 'Click to upload photos, documents, or receipts'}
              </p>
            </label>
          </div>

          {evidence.length > 0 && (
            <div className="mt-3 space-y-2">
              {evidence.map((url, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-sm text-slate-600 truncate">File {idx + 1}</span>
                  <button
                    onClick={() => setEvidence((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 flex gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            Admins will review your appeal within 2-3 business days. Please be thorough and provide any relevant evidence.
          </p>
        </div>

        <Button
          onClick={handleSubmitAppeal}
          disabled={submitting || !reason.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {submitting ? 'Submitting...' : 'Submit Appeal'}
        </Button>
      </CardContent>
    </Card>
  );
}