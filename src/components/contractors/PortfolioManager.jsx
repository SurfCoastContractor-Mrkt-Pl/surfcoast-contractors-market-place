import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Upload, X, Loader2, Trash2 } from 'lucide-react';

const TRADE_OPTIONS = [
  { id: 'electrician', name: 'Electrician' },
  { id: 'plumber', name: 'Plumber' },
  { id: 'carpenter', name: 'Carpenter' },
  { id: 'hvac', name: 'HVAC Technician' },
  { id: 'mason', name: 'Mason' },
  { id: 'roofer', name: 'Roofer' },
  { id: 'painter', name: 'Painter' },
  { id: 'welder', name: 'Welder' },
  { id: 'tiler', name: 'Tiler' },
  { id: 'landscaper', name: 'Landscaper' },
  { id: 'other', name: 'Other' },
];

const EMPTY_FORM = {
  project_title: '',
  description: '',
  trade_category: '',
  completion_date: '',
  images: [],
};

// project prop = existing project for editing, null for new
export default function PortfolioManager({ contractorId, open, onClose, project = null }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);

  const isEditing = !!project;

  // Populate form when editing
  useEffect(() => {
    if (open) {
      if (project) {
        setFormData({
          project_title: project.project_title || '',
          description: project.description || '',
          trade_category: project.trade_category || '',
          completion_date: project.completion_date || '',
          images: project.images || [],
        });
      } else {
        setFormData(EMPTY_FORM);
      }
    }
  }, [open, project]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        return base44.entities.PortfolioProject.update(project.id, data);
      } else {
        return base44.entities.PortfolioProject.create({ contractor_id: contractorId, ...data });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', contractorId] });
      onClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.PortfolioProject.delete(project.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', contractorId] });
      onClose();
    },
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    e.target.value = '';

    setUploading(true);
    const uploadedImages = [];
    const failed = [];

    for (const file of files) {
      try {
        const result = await base44.integrations.Core.UploadFile({ file });
        const url = result?.file_url || result?.url;
        if (url) {
          uploadedImages.push({ url, caption: '' });
        } else {
          failed.push(file.name);
        }
      } catch (err) {
        console.error('Upload failed for', file.name, err);
        failed.push(file.name);
      }
    }

    if (uploadedImages.length > 0) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedImages] }));
    }
    if (failed.length > 0) {
      alert(`Failed to upload: ${failed.join(', ')}. Please try again.`);
    }
    setUploading(false);
  };

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const updateImageCaption = (index, caption) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? { ...img, caption } : img),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.project_title.trim()) { alert('Please enter a project title'); return; }
    if (!formData.description.trim()) { alert('Please enter a project description'); return; }
    if (!formData.trade_category) { alert('Please select a trade category'); return; }
    if (!formData.completion_date) { alert('Please select a completion date'); return; }
    if (formData.images.length === 0) { alert('Please upload at least one project image'); return; }
    saveMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (window.confirm('Delete this project? This cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{isEditing ? 'Edit Portfolio Project' : 'Add Portfolio Project'}</DialogTitle>
          <DialogDescription>
            Showcase your completed work with images and detailed descriptions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto flex-1 pr-1">
          <div>
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Kitchen Remodel, Electrical Upgrade"
              value={formData.project_title}
              onChange={(e) => setFormData(prev => ({ ...prev, project_title: e.target.value }))}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="description">Project Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the project scope, challenges overcome, materials used, and final results..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="mt-1.5"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Trade Category *</Label>
              <Select
                value={formData.trade_category}
                onValueChange={(v) => setFormData(prev => ({ ...prev, trade_category: v }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select trade" />
                </SelectTrigger>
                <SelectContent>
                  {TRADE_OPTIONS.map(trade => (
                    <SelectItem key={trade.id} value={trade.id}>{trade.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Completion Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.completion_date}
                onChange={(e) => setFormData(prev => ({ ...prev, completion_date: e.target.value }))}
                className="mt-1.5"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label>Project Images *</Label>
            <p className="text-xs text-slate-500 mb-2">Upload before and after photos, progress shots, and final results</p>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-amber-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer block">
                {uploading ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB each</p>
                  </>
                )}
              </label>
            </div>

            {formData.images.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium text-slate-900">Images ({formData.images.length})</p>
                <div className="grid grid-cols-3 gap-3">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img.url}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <Input
                        placeholder="Caption (optional)"
                        value={img.caption}
                        onChange={(e) => updateImageCaption(idx, e.target.value)}
                        className="mt-1 text-xs h-7 px-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-shrink-0 pt-2 flex items-center justify-between gap-2">
            <div>
              {isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={saveMutation.isPending}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600"
                disabled={saveMutation.isPending || uploading}
              >
                {saveMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isEditing ? 'Saving...' : 'Adding...'}</>
                ) : (
                  isEditing ? 'Save Changes' : 'Add Project'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}