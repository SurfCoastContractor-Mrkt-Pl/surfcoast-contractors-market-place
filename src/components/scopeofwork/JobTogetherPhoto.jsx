import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, CheckCircle2, Loader2, Users } from 'lucide-react';

export default function JobTogetherPhoto({ scopeId, value, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.ScopeOfWork.update(scopeId, { job_together_photo_url: file_url });
    onChange(file_url);
    setUploading(false);
  };

  return (
    <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <Users className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="font-semibold text-amber-900 text-sm">📸 Take a photo together!</p>
          <p className="text-xs text-amber-700">
            Snap a photo with your {value ? 'new connection' : 'customer/contractor'} on-site. It becomes the thumbnail for this completed job on both profiles — a personal touch that builds trust with future clients!
          </p>
        </div>
      </div>

      {value ? (
        <div className="space-y-2">
          <img src={value} alt="Job together photo" className="w-full h-40 object-cover rounded-lg border-2 border-amber-200" />
          <div className="flex items-center gap-1.5 text-xs text-green-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Photo uploaded — this is your job thumbnail!
          </div>
          <label className="cursor-pointer text-xs text-amber-600 underline">
            Replace photo
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-amber-300 rounded-xl cursor-pointer bg-white hover:bg-amber-50 transition-colors">
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          ) : (
            <>
              <Camera className="w-6 h-6 text-amber-400 mb-1" />
              <span className="text-sm text-amber-700 font-medium">Upload Together Photo</span>
              <span className="text-xs text-amber-500">JPG or PNG — optional but encouraged!</span>
            </>
          )}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      )}
    </div>
  );
}