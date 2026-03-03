import React, { useState } from 'react';
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
import { Upload, X, Loader2, ImageIcon, Trash2 } from 'lucide-react';

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

export default function PortfolioManager({ contractorId, open, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    project_title: '',
    description: '',
    trade_category: '',
    completion_date: '',
    images: [],
  });
  const [uploading, setUploading] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.PortfolioProject.create({
        contractor_id: contractorId,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', contractorId] });
      handleClose();
    },
  });

  const handleClose = () => {
    setFormData({
      project_title: '',
      description: '',
      trade_category: '',
      completion_date: '',
      images: [],
    });
    onClose();
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const uploadedImages = [];

      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedImages.push({
          url: file_url,
          caption: '',
        });
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));
    } catch (error) {
      alert('Failed to upload images. Please try again.');
      console.error('Image upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const updateImageCaption = (index, caption) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? { ...img, caption } : img),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.project_title.trim()) {
      alert('Please enter a project title');
      return;
    }
    if (!formData.description.trim()) {
      alert('Please enter a project description');
      return;
    }
    if (!formData.trade_category) {
      alert('Please select a trade category');
      return;
    }
    if (!formData.completion_date) {
      alert('Please select a completion date');
      return;
    }
    if (formData.images.length === 0) {
      alert('Please upload at least one project image');
      return;
    }

    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Portfolio Project</DialogTitle>
          <DialogDescription>
            Showcase your completed work with images and detailed descriptions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Title */}
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

          {/* Description */}
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

          {/* Trade Category & Date */}
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
            <p className="text-xs text-slate-500 mb-3">Upload before and after photos, progress shots, and final results</p>
            
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
                    <p className="text-sm text-slate-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB each</p>
                  </>
                )}
              </label>
            </div>

            {/* Image Previews */}
            {formData.images.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium text-slate-900">
                  Uploaded Images ({formData.images.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {formData.images.map((img, idx) => (
                    <Card key={idx} className="relative overflow-hidden group">
                      <img
                        src={img.url}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Card>
                  ))}
                </div>
                
                {/* Image Captions */}
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-slate-600 font-medium">Add captions (optional)</p>
                  {formData.images.map((img, idx) => (
                    <div key={idx}>
                      <Input
                        placeholder={`Image ${idx + 1} caption (e.g., "Before the work")`}
                        value={img.caption}
                        onChange={(e) => updateImageCaption(idx, e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Project'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}