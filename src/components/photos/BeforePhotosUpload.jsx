import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, X, CheckCircle, AlertTriangle } from 'lucide-react';

const MIN_PHOTOS = 5;

export default function BeforePhotosUpload({ photos, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
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

  const remaining = Math.max(0, MIN_PHOTOS - photos.length);
  const isSatisfied = photos.length >= MIN_PHOTOS;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Camera className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 space-y-1">
          <p className="font-semibold">Before Photos Required (minimum {MIN_PHOTOS})</p>
          <p>Please upload at least {MIN_PHOTOS} photos of the work area so the contractor can assess conditions beforehand:</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs mt-1">
            <li>Take some photos <strong>up close</strong> showing specific details and problem areas</li>
            <li>Take at least one photo from <strong>5 feet away or further</strong> showing the full area</li>
            <li>Ensure photos are well-lit and clearly show existing conditions</li>
          </ul>
          <p className="text-xs text-blue-600 mt-1">These images document pre-work conditions for both parties. You may upload more than {MIN_PHOTOS} photos.</p>
        </div>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {photos.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 group">
              <img src={url} alt={`Before ${idx + 1}`} className="w-full h-full object-cover" />
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

      {/* Status bar */}
      <div className={`flex items-center gap-2 p-2.5 rounded-lg text-sm ${isSatisfied ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
        {isSatisfied ? (
          <><CheckCircle className="w-4 h-4 shrink-0" /> {photos.length} photos uploaded — requirement met{photos.length > MIN_PHOTOS ? ` (${photos.length - MIN_PHOTOS} extra)` : '!'}</>
        ) : (
          <><AlertTriangle className="w-4 h-4 shrink-0" /> {photos.length} of {MIN_PHOTOS} required photos uploaded — {remaining} more needed</>
        )}
      </div>

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
          className="w-full border-dashed border-2 border-slate-300 hover:border-amber-400 hover:bg-amber-50"
          disabled={uploading}
          onClick={(e) => e.currentTarget.previousSibling.click()}
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
          ) : (
            <><Camera className="w-4 h-4 mr-2" /> {photos.length === 0 ? 'Upload Before Photos' : 'Add More Photos'}</>
          )}
        </Button>
      </label>
    </div>
  );
}