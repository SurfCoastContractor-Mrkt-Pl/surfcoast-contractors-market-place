import React, { useRef } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PhotoGalleryUpload({ images, onImagesChange, maxPhotos = 6 }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = React.useState(false);
  const [warning, setWarning] = React.useState('');

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Check total limit
    if (images.length + files.length > maxPhotos) {
      setWarning(`Maximum ${maxPhotos} photos allowed — remove one to add another.`);
      setTimeout(() => setWarning(''), 3000);
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls = await Promise.all(
        files.map(file => base44.integrations.Core.UploadFile({ file }))
      );
      onImagesChange([...images, ...uploadedUrls.map(r => r.file_url)]);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading photos');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      {warning && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          {warning}
        </div>
      )}

      {/* Upload Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxPhotos}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Add Photos
            </>
          )}
        </button>
        <p className="text-sm text-slate-500 mt-2">
          {images.length} / {maxPhotos} photos
        </p>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 group">
              <img
                src={url}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}