import React, { useState } from 'react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ImagePlus, Loader2, X, CheckCircle, Info } from 'lucide-react';

export default function AfterPhotosUpload({ photos, onChange, agreedWorkDate }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    // Validate files
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        e.target.value = '';
        return;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`File "${file.name}" must be JPEG, PNG, or WebP.`);
        e.target.value = '';
        return;
      }
    }
    
    setUploading(true);
    const uploaded = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploaded.push(file_url);
    }
    onChange([...photos, ...uploaded]);
    setUploading(false);
    e.target.value = '';
  };

  const removePhoto = (idx) => {
    onChange(photos.filter((_, i) => i !== idx));
  };

  const deadlineDate = agreedWorkDate
    ? new Date(new Date(agreedWorkDate).getTime() + 72 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
        <ImagePlus className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div className="text-sm text-purple-800 space-y-1">
          <p className="font-semibold">After Photos — Required from Contractor</p>
          <p>After photos must be uploaded within <strong>72 hours</strong> of the agreed work date to document completed conditions.</p>
          {deadlineDate && (
            <p className="text-xs bg-purple-100 rounded px-2 py-1 mt-1">
              📅 Based on your agreed date, after photos are due by: <strong>{deadlineDate}</strong>
            </p>
          )}
          <p className="text-xs text-purple-600 mt-1">These photos protect both parties and serve as the official completion record.</p>
        </div>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {photos.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 group">
              <img src={url} alt={`After ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs rounded px-1">{idx + 1}</div>
            </div>
          ))}
        </div>
      )}

      {photos.length > 0 && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg text-sm bg-green-50 border border-green-200 text-green-700">
          <CheckCircle className="w-4 h-4 shrink-0" /> {photos.length} after photo{photos.length > 1 ? 's' : ''} uploaded
        </div>
      )}

      <label className="block">
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed border-2 border-slate-300 hover:border-purple-400 hover:bg-purple-50"
          disabled={uploading}
          onClick={(e) => e.currentTarget.previousSibling.click()}
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
          ) : (
            <><ImagePlus className="w-4 h-4 mr-2" /> {photos.length === 0 ? 'Upload After Photos' : 'Add More After Photos'}</>
          )}
        </Button>
      </label>
    </div>
  );
}