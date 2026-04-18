import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, X, Upload, CheckCircle2, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { logError } from '@/components/utils/logError';

export default function ContractorProfileEditor({ contractor, currentUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [authError, setAuthError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (contractor) {
      setEditData({
        name: contractor.name || '',
        phone: contractor.phone || '',
        location: contractor.location || '',
        bio: contractor.bio || '',
        rate_type: contractor.rate_type || 'hourly',
        hourly_rate: contractor.hourly_rate || '',
        fixed_rate: contractor.fixed_rate || '',
        fixed_rate_details: contractor.fixed_rate_details || '',
        photo_url: contractor.photo_url || '',
        face_photo_url: contractor.face_photo_url || '',
        date_of_birth: contractor.date_of_birth || '',
        skills: contractor.skills || [],
      });
    }
  }, [contractor]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      // Validate rate values
      if (data.rate_type === 'hourly' && (data.hourly_rate <= 0 || data.hourly_rate > 999)) {
        throw new Error('Hourly rate must be between $0.01 and $999');
      }
      if (data.rate_type === 'fixed' && (data.fixed_rate <= 0 || data.fixed_rate > 999999)) {
        throw new Error('Fixed rate must be between $0.01 and $999,999');
      }
      if (data.phone && !/^[\d\-\+\(\)\s]+$/.test(data.phone)) {
        throw new Error('Phone number is invalid');
      }
      if (data.location && data.location.length > 100) {
        throw new Error('Location must be 100 characters or less');
      }
      if (data.bio && data.bio.length > 1000) {
        throw new Error('Bio must be 1000 characters or less');
      }
      // Clean up empty string number fields so they don't fail DB validation
      const cleanData = { ...data };
      if (cleanData.hourly_rate === '' || cleanData.hourly_rate === null) cleanData.hourly_rate = null;
      if (cleanData.fixed_rate === '' || cleanData.fixed_rate === null) cleanData.fixed_rate = null;
      return base44.entities.Contractor.update(contractor.id, cleanData);
    },
    onSuccess: () => {
      // Invalidate all variants of the contractor query key
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'my-contractor' });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'contractor-own' });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
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

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [facePhotoPreview, setFacePhotoPreview] = useState(null);
  const [facePhotoUploading, setFacePhotoUploading] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setPhotoError('File is too large. Maximum size is 8MB.');
      return;
    }
    setPhotoError('');
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoUploading(true);
    const response = await base44.integrations.Core.UploadFile({ file });
    setEditData(prev => ({ ...prev, photo_url: response.file_url }));
    setPhotoUploading(false);
  };

  const handleFacePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFacePhotoPreview(URL.createObjectURL(file));
    setFacePhotoUploading(true);
    const response = await base44.integrations.Core.UploadFile({ file });
    setEditData(prev => ({ ...prev, face_photo_url: response.file_url }));
    setFacePhotoUploading(false);
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed || (editData.skills || []).includes(trimmed)) return;
    setEditData(prev => ({ ...prev, skills: [...(prev.skills || []), trimmed] }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skill) => {
    setEditData(prev => ({ ...prev, skills: (prev.skills || []).filter(s => s !== skill) }));
  };

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  // Verify user owns this contractor profile
  if (currentUser && contractor?.email !== currentUser.email) {
    return (
      <Card className="p-6 border border-red-200 bg-red-50">
        <div className="text-red-700 text-sm font-semibold">Unauthorized: You can only edit your own profile.</div>
      </Card>
    );
  }

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
        <div className="space-y-4">
          {/* Profile Photo */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Profile Photo</Label>

            {/* Guidance Card */}
            <div className="mb-3 rounded-lg p-3 bg-amber-50 text-xs text-slate-700 space-y-1" style={{ border: '1px solid #d4a843' }}>
              <div className="font-semibold text-slate-800 mb-1">📸 Photo requirements</div>
              <div className="flex items-start gap-1.5"><span className="text-green-600 font-bold shrink-0">✓</span><span>Full face visible — no sunglasses, no hat, no obstructions</span></div>
              <div className="flex items-start gap-1.5"><span className="text-green-600 font-bold shrink-0">✓</span><span>Face-only or full body both accepted</span></div>
              <div className="flex items-start gap-1.5"><span className="text-green-600 font-bold shrink-0">✓</span><span>Professional headshot style — good lighting, clean background</span></div>
              <div className="flex items-start gap-1.5"><span className="text-green-600 font-bold shrink-0">✓</span><span>Work uniform is great — clean and professional</span></div>
              <div className="flex items-start gap-1.5"><span className="text-red-500 font-bold shrink-0">✗</span><span>No group photos, blurry shots, or tool-only images</span></div>
            </div>

            <div className="flex items-center gap-3">
              {/* Square preview */}
              {(photoPreview || editData.photo_url) && (
                <div className="relative shrink-0">
                  <img
                    src={photoPreview || editData.photo_url}
                    alt="Profile preview"
                    className="w-20 h-20 rounded-lg object-cover border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => { setEditData(prev => ({ ...prev, photo_url: '' })); setPhotoPreview(null); }}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-4 cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors flex-1">
               {photoUploading ? (
                 <>
                   <div className="w-5 h-5 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin mb-1.5" />
                   <span className="text-sm font-medium text-slate-700">Uploading...</span>
                 </>
               ) : (
                 <>
                   <Upload className="w-5 h-5 text-slate-400 mb-1.5" />
                   <span className="text-sm font-medium text-slate-700">{editData.photo_url ? 'Change' : 'Upload'} Photo</span>
                   <span className="text-xs text-slate-500">JPG, PNG, WEBP — max 8MB</span>
                 </>
               )}
               <input
                 type="file"
                 accept="image/jpeg,image/png,image/webp"
                 onChange={handlePhotoUpload}
                 className="hidden"
                 disabled={photoUploading}
               />
              </label>
            </div>
            {photoError && <p className="text-xs text-red-500 mt-1">{photoError}</p>}
          </div>

          {/* Name */}
          <div>
            <Label className="text-sm font-medium">Name</Label>
            <Input
              value={editData.name || ''}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              maxLength="100"
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
              maxLength="20"
              className="mt-1"
            />
          </div>

          {/* Location */}
          <div>
            <Label className="text-sm font-medium">Location</Label>
            <Input
              value={editData.location || ''}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              maxLength="100"
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
                min="0.01"
                max="999"
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
                  min="0.01"
                  max="999999"
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
                  maxLength="500"
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
              maxLength="1000"
              className="mt-1 resize-none"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <Label className="text-sm font-medium">Date of Birth</Label>
            <input
              type="date"
              value={editData.date_of_birth || ''}
              onChange={(e) => setEditData({ ...editData, date_of_birth: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Skills */}
          <div>
            <Label className="text-sm font-medium">Skills</Label>
            <div className="mt-1 flex flex-wrap gap-1.5 mb-2">
              {(editData.skills || []).map(skill => (
                <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-800 font-medium">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-blue-400 hover:text-red-500 ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="e.g. Pipe Installation, Water Heaters..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="button" onClick={handleAddSkill} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md text-sm text-slate-700 font-medium flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Face Photo */}
          <div>
            <Label className="text-sm font-medium">Identity Face Photo</Label>
            <p className="text-xs text-slate-500 mb-2">Clear, unobstructed photo of your face for identity verification.</p>
            <div className="flex items-center gap-3">
              {(facePhotoPreview || editData.face_photo_url) && (
                <div className="relative shrink-0">
                  <img
                    src={facePhotoPreview || editData.face_photo_url}
                    alt="Face photo preview"
                    className="w-20 h-20 rounded-lg object-cover border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => { setEditData(prev => ({ ...prev, face_photo_url: '' })); setFacePhotoPreview(null); }}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors flex-1">
                {facePhotoUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin mb-1.5" />
                    <span className="text-sm font-medium text-slate-700">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-slate-400 mb-1.5" />
                    <span className="text-sm font-medium text-slate-700">{editData.face_photo_url ? 'Change' : 'Upload'} Face Photo</span>
                    <span className="text-xs text-slate-500">JPG, PNG — max 8MB</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFacePhotoUpload}
                  className="hidden"
                  disabled={facePhotoUploading}
                />
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              className="text-white"
              style={{backgroundColor: '#1E5A96'}}
              disabled={updateMutation.isPending || photoUploading || facePhotoUploading}
            >
              {updateMutation.isPending ? 'Saving...' : photoUploading || facePhotoUploading ? 'Uploading photo...' : 'Save Changes'}
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
          {saveSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              Profile saved successfully!
            </div>
          )}
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