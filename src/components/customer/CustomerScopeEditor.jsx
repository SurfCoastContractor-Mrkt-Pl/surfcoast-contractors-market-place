import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Loader2, CheckCircle2 } from 'lucide-react';

export default function CustomerScopeEditor({ job, userEmail, userName }) {
  const [details, setDetails] = useState('');
  const [photoUrls, setPhotoUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (files) => {
      const urls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        urls.push(file_url);
      }
      return urls;
    },
    onSuccess: (urls) => {
      setPhotoUrls(prev => [...prev, ...urls]);
      setUploading(false);
    },
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    uploadMutation.mutate(files);
  };

  const removePhoto = (idx) => {
    setPhotoUrls(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!details.trim()) {
      alert('Please describe what needs to be done');
      return;
    }

    try {
      setSuccess(false);
      await base44.entities.ScopeOfWork.create({
        job_id: job.id,
        customer_name: userName,
        customer_email: userEmail,
        job_title: job.title,
        customer_scope_details: details,
        customer_scope_photo_urls: photoUrls,
        scope_summary: '',
        cost_type: 'fixed',
        cost_amount: 0,
        status: 'pending_approval',
      });

      setSuccess(true);
      setDetails('');
      setPhotoUrls([]);
      queryClient.invalidateQueries({ queryKey: ['job-customer-scope', job.id] });

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert(`Error saving scope: ${error.message}`);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-50 border-blue-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Your Scope of Work</h3>
          <p className="text-sm text-slate-500 mt-1">Describe what needs to be done. Contractors can see this after paying to view your details.</p>
        </div>
        {success && <CheckCircle2 className="w-5 h-5 text-green-600" />}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">What needs to be done?</label>
          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe the work in detail. Include specific areas, materials, issues to fix, etc."
            rows={5}
            className="resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Upload Photos (Optional)</label>
          <p className="text-xs text-slate-500 mb-2">Photos help contractors understand the scope better</p>

          {photoUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              {photoUrls.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img src={url} alt={`Scope ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            ) : (
              <>
                <Upload className="w-5 h-5 text-blue-500 mb-1" />
                <span className="text-sm text-blue-600 font-medium">Click to upload photos</span>
                <span className="text-xs text-blue-400">JPG, PNG accepted</span>
              </>
            )}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!details.trim() || uploading}
          >
            Save Scope Details
          </Button>
        </div>
      </div>
    </Card>
  );
}