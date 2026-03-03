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

const CATEGORIES = [
  { id: 'power_tools', name: 'Power Tools' },
  { id: 'hand_tools', name: 'Hand Tools' },
  { id: 'safety_equipment', name: 'Safety Equipment' },
  { id: 'heavy_machinery', name: 'Heavy Machinery' },
  { id: 'specialty_tools', name: 'Specialty Tools' },
  { id: 'other', name: 'Other' }
];

export default function EquipmentManager({ contractorId, open, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    photo_url: '',
    available: true
  });
  const [uploading, setUploading] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Equipment.create({
      ...data,
      contractor_id: contractorId,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment', contractorId] });
      setFormData({ name: '', category: '', description: '', photo_url: '', available: true });
      onClose();
    }
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, photo_url: res.file_url }));
    } catch (error) {
      console.error('Photo upload failed:', error);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      alert('Please fill in required fields');
      return;
    }
    await createMutation.mutateAsync(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Equipment or Tool</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Equipment Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., DeWalt Cordless Drill"
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700">Currently Available</span>
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brand, model, condition, specifications..."
              className="mt-1.5 h-20"
            />
          </div>

          <div>
            <Label className="block mb-2">Equipment Photo</Label>
            {formData.photo_url ? (
              <div className="relative group">
                <img src={formData.photo_url} alt="Equipment" className="w-full max-h-48 object-contain rounded-lg border border-slate-200 bg-slate-50" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Click to replace</span>
                </div>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600 font-medium">Upload equipment photo</span>
                    <span className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
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
                <>Add Equipment</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}