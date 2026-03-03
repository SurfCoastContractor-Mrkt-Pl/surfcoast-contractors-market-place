import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Upload, Loader2, X } from 'lucide-react';

const TRADES = [
  'electrician', 'plumber', 'carpenter', 'hvac', 'mason',
  'roofer', 'painter', 'welder', 'tiler', 'landscaper', 'other'
];

export default function PortfolioManager({ contractorId, open, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    project_title: '',
    description: '',
    trade_category: '',
    completion_date: '',
    images: []
  });
  const [uploadingImages, setUploadingImages] = useState([]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PortfolioProject.create({
      ...data,
      contractor_id: contractorId,
      images: uploadingImages.map(img => ({ url: img.url, caption: img.caption || '' }))
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', contractorId] });
      setFormData({ project_title: '', description: '', trade_category: '', completion_date: '', images: [] });
      setUploadingImages([]);
      onClose();
    }
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      try {
        const res = await base44.integrations.Core.UploadFile({ file });
        setUploadingImages(prev => [...prev, { url: res.file_url, caption: '' }]);
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }
  };

  const handleRemoveImage = (index) => {
    setUploadingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.project_title || !formData.description || !formData.trade_category || !formData.completion_date) {
      alert('Please fill in all required fields');
      return;
    }
    await createMutation.mutateAsync(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Portfolio Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              value={formData.project_title}
              onChange={(e) => setFormData({ ...formData, project_title: e.target.value })}
              placeholder="e.g., Kitchen Renovation"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="description">Project Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the project, challenges, and results..."
              className="mt-1.5 h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trade">Trade Category *</Label>
              <Select value={formData.trade_category} onValueChange={(value) => setFormData({ ...formData, trade_category: value })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select trade" />
                </SelectTrigger>
                <SelectContent>
                  {TRADES.map(trade => (
                    <SelectItem key={trade} value={trade} className="capitalize">
                      {trade}
                    </SelectItem>
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
                onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label className="block mb-2">Project Images</Label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-slate-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-input"
              />
              <label htmlFor="image-input" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-slate-400" />
                <span className="text-sm text-slate-600">Click to upload or drag and drop</span>
                <span className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB each</span>
              </label>
            </div>

            {uploadingImages.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadingImages.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <img src={img.url} alt={`Upload ${idx}`} className="h-16 w-16 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <Input
                        placeholder="Image caption (optional)"
                        value={img.caption}
                        onChange={(e) => {
                          setUploadingImages(prev => [
                            ...prev.slice(0, idx),
                            { ...prev[idx], caption: e.target.value },
                            ...prev.slice(idx + 1)
                          ]);
                        }}
                        className="text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-2 hover:bg-red-100 rounded"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="flex-1 bg-amber-500 hover:bg-amber-600">
              {createMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : (
                <>Add to Portfolio</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}