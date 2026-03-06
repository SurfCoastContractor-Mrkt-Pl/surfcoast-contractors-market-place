import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, HelpCircle, CheckCircle2, AlertCircle, Upload, X } from 'lucide-react';
import { logError } from '@/components/utils/logError';

const TRADES = [
  'electrician', 'plumber', 'carpenter', 'hvac', 'mason', 'roofer',
  'painter', 'welder', 'tiler', 'landscaper', 'other'
];

const TRADE_LABELS = {
  electrician: 'Electrician', plumber: 'Plumber', carpenter: 'Carpenter',
  hvac: 'HVAC Technician', mason: 'Mason', roofer: 'Roofer', painter: 'Painter',
  welder: 'Welder', tiler: 'Tiler', landscaper: 'Landscaper', other: 'Other'
};

export default function CustomerProfileEditor({ profile, userEmail, onAskAgent }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    location: '',
    bio: '',
    photo_url: '',
    preferred_contractor_types: [],
    preferred_trades: [],
  });
  const [dobError, setDobError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Verify profile exists in database
  const { data: verifiedProfile } = useQuery({
    queryKey: ['verified-profile', userEmail],
    queryFn: () => base44.entities.CustomerProfile.filter({ email: userEmail }),
    enabled: !!userEmail,
    select: (data) => data?.[0] || null,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        location: profile.location || '',
        bio: profile.bio || '',
        photo_url: profile.photo_url || '',
        preferred_contractor_types: profile.preferred_contractor_types || [],
        preferred_trades: profile.preferred_trades || [],
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (profile?.id) {
        return base44.entities.CustomerProfile.update(profile.id, data);
      } else {
        return base44.entities.CustomerProfile.create({
          email: userEmail,
          ...data,
        });
      }
    },
    onSuccess: () => {
      setSaveSuccess(true);
      setSaveError('');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['customer-profile', userEmail] });
      queryClient.invalidateQueries({ queryKey: ['verified-profile', userEmail] });
      setTimeout(() => setSaveSuccess(false), 5000);
    },
    onError: (error) => {
      setSaveError(error.message || 'Failed to save profile');
      setTimeout(() => setSaveError(''), 5000);
      logError({
        error_type: 'profile_setup',
        severity: 'high',
        user_email: userEmail,
        user_type: 'customer',
        action: 'Save customer profile',
        error_message: error.message || 'Failed to save profile',
      });
    },
  });

  const validateAge = (dob) => {
    if (!dob) return 'Date of birth is required';
    const today = new Date();
    const birth = new Date(dob);
    const age = today.getFullYear() - birth.getFullYear() - (
      today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0
    );
    if (age < 18) return 'You must be at least 18 years old to use this platform';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      alert('Please enter your full name');
      return;
    }
    if (!formData.location.trim()) {
      alert('Please enter your location');
      return;
    }
    const ageErr = validateAge(formData.date_of_birth);
    if (ageErr) {
      setDobError(ageErr);
      return;
    }
    setDobError('');
    
    // Verify user is authenticated before saving
    try {
      const user = await base44.auth.me();
      if (!user?.email) {
        setSaveError('You must be logged in to save your profile');
        return;
      }
      // Pass authenticated email to ensure proper linkage
      updateMutation.mutate({ ...formData, email: user.email });
    } catch (err) {
      setSaveError('Failed to verify your account');
    }
  };

  const toggleContractorType = (type) => {
    setFormData(prev => ({
      ...prev,
      preferred_contractor_types: prev.preferred_contractor_types.includes(type)
        ? prev.preferred_contractor_types.filter(t => t !== type)
        : [...prev.preferred_contractor_types, type]
    }));
  };

  const toggleTrade = (trade) => {
    setFormData(prev => ({
      ...prev,
      preferred_trades: prev.preferred_trades.includes(trade)
        ? prev.preferred_trades.filter(t => t !== trade)
        : [...prev.preferred_trades, trade]
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const response = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, photo_url: response.file_url }));
    }
  };

  return (
    <Card className={`p-6 border-2 transition-colors ${verifiedProfile ? 'border-green-200 bg-green-50' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-slate-900">Profile Setup</h2>
            {verifiedProfile && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-green-700">VERIFIED</span>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {verifiedProfile ? '✓ Profile saved and verified in system' : 'Complete your profile to get started'}
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              Edit
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onAskAgent}
            className="gap-1.5 text-amber-600 hover:bg-amber-50"
          >
            <HelpCircle className="w-4 h-4" />
            Need Help?
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="mb-4 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-700">Profile Saved Successfully!</p>
            <p className="text-xs text-green-600">Your profile has been verified and saved in the system.</p>
          </div>
        </div>
      )}

      {saveError && (
        <div className="mb-4 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Save Failed</p>
            <p className="text-xs text-red-600">{saveError}</p>
          </div>
        </div>
      )}

      {!verifiedProfile || isEditing ? (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Profile Photo</h3>
          <div className="flex items-center gap-4">
            {formData.photo_url && (
              <div className="relative">
                <img src={formData.photo_url} alt="Profile" className="w-20 h-20 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, photo_url: '' }))}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="flex-1">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-4 cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors">
                <Upload className="w-5 h-5 text-slate-400 mb-2" />
                <span className="text-sm font-medium text-slate-700">{formData.photo_url ? 'Change' : 'Upload'} Photo</span>
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
        </div>

        {/* Basic Info */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Your full name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="dob">Date of Birth * <span className="text-slate-400 font-normal">(must be 18+)</span></Label>
              <Input
                id="dob"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, date_of_birth: e.target.value }));
                  setDobError('');
                }}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                className="mt-1.5"
              />
              {dobError && <p className="text-xs text-red-600 mt-1">{dobError}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="City, State"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">About You</Label>
              <Textarea
                id="bio"
                placeholder="Tell contractors about your project style and preferences..."
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Contractor Preferences</h3>
          
          <div className="mb-5">
            <Label className="text-sm font-medium text-slate-900 mb-3 block">
              Preferred Contractor Types
            </Label>
            <div className="space-y-2">
              {['general', 'trade_specific'].map(type => (
                <div key={type} className="flex items-center">
                  <Checkbox
                    id={`type-${type}`}
                    checked={formData.preferred_contractor_types.includes(type)}
                    onCheckedChange={() => toggleContractorType(type)}
                    className="rounded"
                  />
                  <label
                    htmlFor={`type-${type}`}
                    className="ml-3 text-sm text-slate-700 cursor-pointer"
                  >
                    {type === 'general' ? 'General Contractors' : 'Trade Specialists'}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-900 mb-3 block">
              Preferred Trade Specialties
            </Label>
            <div className="grid sm:grid-cols-2 gap-3">
              {TRADES.map(trade => (
                <div key={trade} className="flex items-center">
                  <Checkbox
                    id={`trade-${trade}`}
                    checked={formData.preferred_trades.includes(trade)}
                    onCheckedChange={() => toggleTrade(trade)}
                    className="rounded"
                  />
                  <label
                    htmlFor={`trade-${trade}`}
                    className="ml-3 text-sm text-slate-700 cursor-pointer"
                  >
                    {TRADE_LABELS[trade]}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className={`w-full ${verifiedProfile ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-500 hover:bg-amber-600'}`}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : verifiedProfile ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </>
          )}
        </Button>
      </form>
      ) : (
       <div className="space-y-6">
         {formData.photo_url && (
           <div>
             <h3 className="font-semibold text-slate-900 mb-4">Profile Photo</h3>
             <img src={formData.photo_url} alt="Profile" className="w-24 h-24 rounded-lg object-cover" />
           </div>
         )}
         <div>
           <h3 className="font-semibold text-slate-900 mb-4">Personal Information</h3>
           <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500 font-medium">FULL NAME</div>
                <div className="text-sm text-slate-900">{formData.full_name}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">DATE OF BIRTH</div>
                <div className="text-sm text-slate-900">{formData.date_of_birth ? new Date(formData.date_of_birth).toLocaleDateString() : '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">PHONE</div>
                <div className="text-sm text-slate-900">{formData.phone || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">LOCATION</div>
                <div className="text-sm text-slate-900">{formData.location}</div>
              </div>
              {formData.bio && (
                <div>
                  <div className="text-xs text-slate-500 font-medium">ABOUT YOU</div>
                  <div className="text-sm text-slate-900 whitespace-pre-wrap">{formData.bio}</div>
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Contractor Preferences</h3>
            <div className="space-y-2">
              {formData.preferred_contractor_types.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 font-medium">CONTRACTOR TYPES</div>
                  <div className="text-sm text-slate-900">
                    {formData.preferred_contractor_types.map(t => t === 'general' ? 'General Contractors' : 'Trade Specialists').join(', ')}
                  </div>
                </div>
              )}
              {formData.preferred_trades.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 font-medium">PREFERRED TRADES</div>
                  <div className="text-sm text-slate-900">
                    {formData.preferred_trades.map(t => TRADE_LABELS[t]).join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-amber-500 hover:bg-amber-600 w-full"
          >
            Edit Profile
          </Button>
        </div>
      )}
    </Card>
  );
}