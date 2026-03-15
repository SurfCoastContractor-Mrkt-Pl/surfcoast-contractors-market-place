import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, X, Upload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { logError } from '@/components/utils/logError';

export default function ContractorProfileEditor({ contractor }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (contractor) {
      setEditData({
        name: contractor.name || '',
        email: contractor.email || '',
        phone: contractor.phone || '',
        location: contractor.location || '',
        bio: contractor.bio || '',
        rate_type: contractor.rate_type || 'hourly',
        hourly_rate: contractor.hourly_rate || '',
        fixed_rate: contractor.fixed_rate || '',
        fixed_rate_details: contractor.fixed_rate_details || '',
        photo_url: contractor.photo_url || '',
      });
    }
  }, [contractor]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Contractor.update(contractor.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-contractor'] });
      setIsEditing(false);
    },
    onError: (error) => {
      logError({
        error_type: 'profile_setup',
        severity: 'high',
        user_email: contractor?.email,
        user_type: 'contractor',
        action: 'Save contractor profile',
        error_message: error.message || 'Failed to save contractor profile',
        context: { contractor_id: contractor?.id },
      });
    },
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const response = await base44.integrations.Core.UploadFile({ file });
      setEditData({ ...editData, photo_url: response.file_url });
    }
  };

  const handleSave = async () => {
    // Sync name to the User entity so the Users table stays consistent
    if (editData.name?.trim()) {
      await base44.auth.updateMe({ full_name: editData.name.trim() });
    }
    updateMutation.mutate(editData);
  };

  if (!contractor) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
         <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
         {!isEditing && (
           <Button
             variant="outline"
             size="sm"
             onClick={() => setIsEditing(true)}
             className="gap-1.5"
           >
             <Edit2 className="w-4 h-4" />
             Edit Profile
           </Button>
         )}
       </div>

      {isEditing ? (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {/* Profile Photo */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Profile Photo</Label>
            <div className="mt-2 flex items-center gap-4">
              {editData.photo_url && (
                <div className="relative">
                  <img src={editData.photo_url} alt="Profile" className="w-20 h-20 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setEditData({ ...editData, photo_url: '' })}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-4 cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors flex-1">
                <Upload className="w-5 h-5 text-slate-400 mb-2" />
                <span className="text-sm font-medium text-slate-700">{editData.photo_url ? 'Change' : 'Upload'} Photo</span>
                <span className="text-xs text-slate-500">JPG, PNG up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <Label className="text-sm font-medium">Name</Label>
            <Input
              value={editData.name || ''}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Email */}
          <div>
            <Label className="text-sm font-medium">Email</Label>
            <Input
              type="email"
              value={editData.email || ''}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Phone */}
          <div>
            <Label className="text-sm font-medium">Phone</Label>
            <Input
              type="tel"
              value={editData.phone || ''}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Location */}
          <div>
            <Label className="text-sm font-medium">Location</Label>
            <Input
              value={editData.location || ''}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Rate Type */}
          <div>
            <Label className="text-sm font-medium">Rate Type</Label>
            <Select
              value={editData.rate_type || 'hourly'}
              onValueChange={(v) => setEditData({ ...editData, rate_type: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly Rate</SelectItem>
                <SelectItem value="fixed">Fixed Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hourly Rate */}
          {editData.rate_type !== 'fixed' && (
            <div>
              <Label className="text-sm font-medium">Hourly Rate ($)</Label>
              <Input
                type="number"
                value={editData.hourly_rate || ''}
                onChange={(e) => setEditData({ ...editData, hourly_rate: parseFloat(e.target.value) })}
                className="mt-1"
                min="0"
                step="5"
              />
            </div>
          )}

          {/* Fixed Rate */}
          {editData.rate_type === 'fixed' && (
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Fixed Rate ($)</Label>
                <Input
                  type="number"
                  value={editData.fixed_rate || ''}
                  onChange={(e) => setEditData({ ...editData, fixed_rate: parseFloat(e.target.value) })}
                  className="mt-1"
                  min="0"
                  placeholder="e.g., 500"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Fixed Rate Details</Label>
                <Textarea
                  value={editData.fixed_rate_details || ''}
                  onChange={(e) => setEditData({ ...editData, fixed_rate_details: e.target.value })}
                  placeholder="Describe what your fixed rate covers (e.g., full bathroom renovation, includes materials and labor...)"
                  rows={3}
                  className="mt-1 resize-none"
                />
              </div>
            </div>
          )}

          {/* Bio */}
          <div>
            <Label className="text-sm font-medium">Bio</Label>
            <Textarea
              value={editData.bio || ''}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              placeholder="Tell customers about yourself..."
              rows={4}
              className="mt-1 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              className="text-white"
              style={{backgroundColor: '#1E5A96'}}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={updateMutation.isPending}
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {contractor.photo_url && (
            <div>
              <img src={contractor.photo_url} alt={contractor.name} className="w-20 h-20 rounded-lg object-cover" />
            </div>
          )}
          <div>
            <div className="text-xs text-slate-500 font-medium">NAME</div>
            <div className="text-sm text-slate-900">{contractor.name}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">EMAIL</div>
            <div className="text-sm text-slate-900">{contractor.email}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">PHONE</div>
            <div className="text-sm text-slate-900">{contractor.phone || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">LOCATION</div>
            <div className="text-sm text-slate-900">{contractor.location || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">RATE</div>
            {contractor.rate_type === 'fixed' ? (
              <div>
                <div className="text-sm text-slate-900">${contractor.fixed_rate || '—'} (fixed)</div>
                {contractor.fixed_rate_details && (
                  <div className="text-xs text-slate-500 mt-1 whitespace-pre-wrap">{contractor.fixed_rate_details}</div>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-900">${contractor.hourly_rate || '—'}/hr</div>
            )}
          </div>
          {contractor.bio && (
            <div>
              <div className="text-xs text-slate-500 font-medium">BIO</div>
              <div className="text-sm text-slate-900 whitespace-pre-wrap">{contractor.bio}</div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}