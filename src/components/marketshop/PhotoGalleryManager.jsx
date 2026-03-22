import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PhotoGalleryManager({ shop, onUpdate }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [warning, setWarning] = useState('');
  const [deleting, setDeleting] = useState(null);
  
  const images = shop.gallery_images || [];
  const maxPhotos = 6;

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

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
      const newImages = [...images, ...uploadedUrls.map(r => r.file_url)];
      console.log('Uploaded URLs:', uploadedUrls);
      console.log('New images array:', newImages);
      await base44.entities.MarketShop.update(shop.id, { gallery_images: newImages });
      onUpdate({ gallery_images: newImages });
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading photos: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (index) => {
    setDeleting(index);
    try {
      const newImages = images.filter((_, i) => i !== index);
      await base44.entities.MarketShop.update(shop.id, { gallery_images: newImages });
      onUpdate({ gallery_images: newImages });
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting photo');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <ImageIcon className="w-5 h-5" />
        Photo Gallery
      </h2>

      {warning && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          {warning}
        </div>
      )}

      {/* Upload Button */}
      <div className="mb-6">
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
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 group">
              <img
                src={url}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete(idx)}
                disabled={deleting === idx}
                className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 disabled:opacity-50 text-white rounded transition-colors opacity-0 group-hover:opacity-100"
              >
                {deleting === idx ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="py-12 text-center">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No photos yet. Upload up to 6 images to showcase your booth.</p>
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