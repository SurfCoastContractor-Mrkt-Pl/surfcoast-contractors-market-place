import React from 'react';
import PhotoUploadZone from './PhotoUploadZone';
import { Camera } from 'lucide-react';

const MIN_PHOTOS = 5;

export default function BeforePhotosUpload({ photos, onChange }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Camera className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 space-y-1">
          <p className="font-semibold">Before Photos Required (minimum {MIN_PHOTOS})</p>
          <p>Upload photos of the work area so the contractor can assess conditions beforehand:</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs mt-1">
            <li>Close-up shots showing specific details and problem areas</li>
            <li>At least one wide-angle shot (5+ feet away) showing the full area</li>
            <li>Well-lit, clear images — document pre-work conditions</li>
          </ul>
        </div>
      </div>
      <PhotoUploadZone
        photos={photos}
        onChange={onChange}
        minPhotos={MIN_PHOTOS}
        label="Upload Before Photos"
        hint={`Minimum ${MIN_PHOTOS} photos required`}
        color="blue"
      />
    </div>
  );
}