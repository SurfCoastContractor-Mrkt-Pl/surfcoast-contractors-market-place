import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, Sparkles } from 'lucide-react';

export default function LittlesUploadModal({ userEmail, userType }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    child_name: '',
    child_age: '',
    title: '',
    description: ''
  });
  const [photoUrls, setPhotoUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  const createShowcaseMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.LittlesShowcase.create(data);
    },
    onSuccess: () => {
      setOpen(false);
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({ child_name: '', child_age: '', title: '', description: '' });
    setPhotoUrls([]);
    setPreviewUrls([]);
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];

      for (const file of files) {
        // Create FormData for file upload
        const formDataFile = new FormData();
        formDataFile.append('file', file);

        const response = await base44.integrations.Core.UploadFile({
          file: file
        });

        if (response.file_url) {
          uploadedUrls.push(response.file_url);
          
          // Create preview
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewUrls(prev => [...prev, reader.result]);
          };
          reader.readAsDataURL(file);
        }
      }

      setPhotoUrls(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.child_name || !formData.title || photoUrls.length === 0) {
      alert('Please fill in child name, title, and add at least one photo');
      return;
    }

    createShowcaseMutation.mutate({
      user_email: userEmail,
      user_type: userType,
      child_name: formData.child_name,
      child_age: parseInt(formData.child_age) || null,
      title: formData.title,
      description: formData.description,
      photo_urls: photoUrls,
      is_active: true
    });
  };

  const isLoading = createShowcaseMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="gap-2 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
        >
          <Sparkles className="w-4 h-4" />
          Littles Showcase
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            Welcome to the Littles Showcase
          </DialogTitle>
          <DialogDescription>
            Share your child's creativity, art, crafts, and innovations with our community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Child Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Child's Name *</label>
              <Input
                placeholder="e.g., Emma, Liam"
                value={formData.child_name}
                onChange={(e) => setFormData({ ...formData, child_name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Age</label>
              <Input
                type="number"
                placeholder="e.g., 7"
                min="0"
                max="18"
                value={formData.child_age}
                onChange={(e) => setFormData({ ...formData, child_age: e.target.value })}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Title *</label>
            <Input
              placeholder="e.g., My First Painting, Building a Treehouse"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Description</label>
            <Textarea
              placeholder="Tell us about this creation! What was the inspiration? What did they learn?"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Photos *</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors bg-slate-50">
              <label className="cursor-pointer block">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {uploading ? 'Uploading...' : 'Click to upload or drag photos'}
                  </span>
                  <span className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB each</span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Photo Preview */}
          {(photoUrls.length > 0 || previewUrls.length > 0) && (
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Photos ({photoUrls.length})
              </label>
              <div className="grid grid-cols-4 gap-3">
                {previewUrls.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-slate-200"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 Tip: Include photos of your child with you! Community photos showing parents and children working together are especially appreciated.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || photoUrls.length === 0}
            className="gap-2 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
          >
            {isLoading ? 'Sharing...' : 'Share Showcase'}
            <Sparkles className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}