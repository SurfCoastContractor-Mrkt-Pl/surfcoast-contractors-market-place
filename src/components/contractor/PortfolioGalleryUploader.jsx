import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Trash2, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function PortfolioGalleryUploader({ contractor, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Contractor.update(contractor.id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['contractor', contractor.id] });
      onUpdate?.(result);
    },
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    e.target.value = '';
    setUploading(true);

    const currentImages = contractor.portfolio_images || [];
    const newImages = [...currentImages];
    const failed = [];

    for (const file of files) {
      try {
        const result = await base44.integrations.Core.UploadFile({ file });
        const url = result?.file_url || result?.url;
        if (url) {
          newImages.push(url);
        } else {
          failed.push(file.name);
        }
      } catch (err) {
        console.error('Upload failed for', file.name, err);
        failed.push(file.name);
      }
    }

    if (newImages.length > currentImages.length) {
      await updateMutation.mutateAsync({ portfolio_images: newImages });
    }

    if (failed.length > 0) {
      alert(`Failed to upload: ${failed.join(', ')}. Please try again with a smaller file or different format.`);
    }

    setUploading(false);
  };

  const deleteImage = async (index) => {
    const images = contractor.portfolio_images || [];
    const updated = images.filter((_, i) => i !== index);
    await updateMutation.mutateAsync({ portfolio_images: updated });
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
        <input
          type="file"
          id="gallery-upload"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading || updateMutation.isPending}
          className="hidden"
        />
        <label htmlFor="gallery-upload" className="cursor-pointer block">
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-900 mb-1">
            {uploading ? 'Uploading...' : 'Click to upload images'}
          </p>
          <p className="text-xs text-slate-500">PNG, JPG, WebP up to 10MB each</p>
        </label>
      </div>

      {(contractor.portfolio_images || []).length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-900 mb-3">
            {contractor.portfolio_images.length} image{contractor.portfolio_images.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {contractor.portfolio_images.map((url, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={url}
                  alt={`Portfolio ${idx + 1}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <button
                  onClick={() => deleteImage(idx)}
                  disabled={updateMutation.isPending}
                  className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}