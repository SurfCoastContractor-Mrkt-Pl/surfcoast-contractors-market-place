import React from 'react';
import PhotoUploadZone from './PhotoUploadZone';
import { ImagePlus } from 'lucide-react';

export default function AfterPhotosUpload({ photos, onChange, agreedWorkDate }) {
  const deadlineDate = agreedWorkDate
    ? new Date(new Date(agreedWorkDate).getTime() + 72 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
        <ImagePlus className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div className="text-sm text-purple-800 space-y-1">
          <p className="font-semibold">After Photos — Required within 72 hours</p>
          <p>Upload after photos to document the completed work. These protect both parties.</p>
          {deadlineDate && (
            <p className="text-xs bg-purple-100 rounded px-2 py-1 mt-1">
              📅 Due by: <strong>{deadlineDate}</strong>
            </p>
          )}
        </div>
      </div>
      <PhotoUploadZone
        photos={photos}
        onChange={onChange}
        label="Upload After Photos"
        hint="Document completed work conditions"
        color="purple"
      />
    </div>
  );
}