import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lock, Unlock, Loader2, Camera, AlertTriangle, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function AccountLockedBanner({ contractor, lockedScope }) {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const photosUploaded = (lockedScope?.after_photo_urls || []).length;
  const remaining = Math.max(0, 5 - photosUploaded);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const newUrls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newUrls.push(file_url);
    }
    const updatedPhotos = [...(lockedScope.after_photo_urls || []), ...newUrls];
    await base44.entities.ScopeOfWork.update(lockedScope.id, { after_photo_urls: updatedPhotos });

    // Auto-unlock if now >= 5 photos
    if (updatedPhotos.length >= 5) {
      await base44.entities.Contractor.update(contractor.id, {
        account_locked: false,
        locked_scope_id: null,
      });
    }

    setUploading(false);
    queryClient.invalidateQueries({ queryKey: ['my-contractor'] });
    queryClient.invalidateQueries({ queryKey: ['locked-scope', contractor.locked_scope_id] });
  };

  return (
    <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
          <Lock className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-red-800">Account Locked — After Photos Required</h3>
          <p className="text-sm text-red-700 mt-1">
            Your account has been locked because after photos were not uploaded within 72 hours of the agreed work date for:
            <strong className="block mt-1">"{lockedScope?.job_title || 'a recent job'}"</strong>
          </p>
        </div>
      </div>

      <div className="bg-white border border-red-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">After Photos Uploaded</span>
          <span className={`text-sm font-bold ${photosUploaded >= 5 ? 'text-green-600' : 'text-red-600'}`}>
            {photosUploaded} / 5
          </span>
        </div>
        <div className="w-full bg-red-100 rounded-full h-2 mb-3">
          <div
            className="bg-red-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(100, (photosUploaded / 5) * 100)}%` }}
          />
        </div>

        {lockedScope?.after_photo_urls?.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {lockedScope.after_photo_urls.map((url, idx) => (
              <img key={idx} src={url} alt={`After ${idx + 1}`} className="aspect-square rounded-lg object-cover w-full" />
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700">
            You need <strong>{remaining} more photo{remaining !== 1 ? 's' : ''}</strong> to unlock your account.
            Upload clear after photos showing completed work.
          </p>
        </div>

        <label className="block">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <Button
            type="button"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            disabled={uploading}
            onClick={(e) => e.currentTarget.previousSibling.click()}
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
            ) : (
              <><Camera className="w-4 h-4 mr-2" /> Upload After Photos to Unlock</>
            )}
          </Button>
        </label>
      </div>

      {photosUploaded >= 5 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-300 rounded-xl">
          <Unlock className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700 font-medium">
            Minimum photos uploaded! Your account is being unlocked — refresh to continue.
          </p>
        </div>
      )}
    </div>
  );
}