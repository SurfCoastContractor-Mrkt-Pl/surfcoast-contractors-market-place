import React, { useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function QuoteWizardStep3({ formData, setFormData }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = React.useState(false);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      const uploadedUrls = [];
      for (const file of files) {
        // Convert file to base64 for upload
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const response = await base44.integrations.Core.UploadFile({
              file: event.target.result
            });
            uploadedUrls.push(response.file_url);

            if (uploadedUrls.length === files.length) {
              setFormData(prev => ({
                ...prev,
                photos: [...prev.photos, ...uploadedUrls]
              }));
              setUploading(false);
            }
          } catch (err) {
            console.error('Upload error:', err);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('File selection error:', err);
      setUploading(false);
    }
  };

  const handleRemovePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
      >
        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <p className="text-lg font-semibold text-slate-900 mb-1">Upload Photos</p>
        <p className="text-slate-600 text-sm mb-4">Click to select images or drag and drop</p>
        <p className="text-xs text-slate-500">JPEG, PNG up to 5MB each</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
      </div>

      {uploading && (
        <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-blue-600 font-medium">Uploading photos...</span>
        </div>
      )}

      {/* Photo Gallery */}
      {formData.photos.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-4">
            Uploaded Photos ({formData.photos.length})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {formData.photos.map((photo, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={photo}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
        📸 <strong>Pro tip:</strong> Include multiple angles and close-ups of the area that needs work. Clear photos help contractors provide more accurate quotes!
      </p>
    </div>
  );
}