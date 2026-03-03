import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, HardHat, Loader2, CheckCircle, Plus, X, Upload, AlertTriangle } from 'lucide-react';
import CredentialDocumentsUpload from '@/components/contractor/CredentialDocumentsUpload';

const trades = [
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

export default function BecomeContractor() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [newCert, setNewCert] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [uploadingId, setUploadingId] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    photo_url: '',
    id_document_url: '',
    face_photo_url: '',
    contractor_type: '',
    trade_specialty: '',
    years_experience: '',
    hourly_rate: '',
    location: '',
    bio: '',
    skills: [],
    certifications: [],
    available: true,
    rating: null,
    reviews_count: 0,
    credential_documents: [],
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      // Check if contractor with this email already exists
      const existing = await base44.entities.Contractor.filter({ email: data.email });
      if (existing && existing.length > 0) {
        throw new Error('A contractor profile with this email already exists. Please use a different email or log in to your existing profile.');
      }
      return base44.entities.Contractor.create(data);
    },
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        navigate(createPageUrl('ContractorAccount'));
      }, 2000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      years_experience: formData.years_experience ? Number(formData.years_experience) : null,
      hourly_rate: formData.hourly_rate ? Number(formData.hourly_rate) : null,
    };
    mutation.mutate(data);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addCertification = () => {
    if (newCert.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCert.trim()]
      }));
      setNewCert('');
    }
  };

  const removeCertification = (idx) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== idx)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (idx) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== idx)
    }));
  };

  const [uploadingFace, setUploadingFace] = useState(false);

  const handleIdUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingId(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange('id_document_url', file_url);
    } catch (error) {
      alert('Failed to upload ID document. Please try again.');
      console.error('ID upload error:', error);
    } finally {
      setUploadingId(false);
    }
  };

  const handleFaceUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingFace(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange('face_photo_url', file_url);
    } catch (error) {
      alert('Failed to upload face photo. Please try again.');
      console.error('Face photo upload error:', error);
    } finally {
      setUploadingFace(false);
    }
  };


  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Created!</h2>
          <p className="text-slate-600 mb-4">Your contractor profile is now live. Clients can now find and contact you.</p>
          <p className="text-sm text-slate-500">Redirecting to your account...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-900 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-amber-900 hover:text-slate-900 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
              <HardHat className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Become a Contractor</h1>
              <p className="text-amber-900">Create your professional profile</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          {/* Photo & Basic Info */}
          <Card className="p-6 md:p-8 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="City, State"
                  required
                  className="mt-1.5"
                />
              </div>
            </div>
            </Card>

          {/* Professional Info */}
          <Card className="p-6 md:p-8 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Professional Details</h2>
            
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Contractor Type *</Label>
                  <Select value={formData.contractor_type} onValueChange={(v) => handleChange('contractor_type', v)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trade_specific">Trade Specific</SelectItem>
                      <SelectItem value="general">General Contractor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.contractor_type === 'trade_specific' && (
                  <div>
                    <Label>Trade Specialty</Label>
                    <Select value={formData.trade_specialty} onValueChange={(v) => handleChange('trade_specialty', v)}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select trade" />
                      </SelectTrigger>
                      <SelectContent>
                        {trades.map(trade => (
                          <SelectItem key={trade.id} value={trade.id}>{trade.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="years_experience">Years of Experience</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    value={formData.years_experience}
                    onChange={(e) => handleChange('years_experience', e.target.value)}
                    placeholder="e.g., 10"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => handleChange('hourly_rate', e.target.value)}
                    placeholder="e.g., 75"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">About You</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Tell potential clients about your experience, specialties, and what makes you stand out..."
                  rows={4}
                  className="mt-1.5"
                />
                <p className="text-xs text-slate-500 mt-1">Optional</p>
              </div>

              <div>
                <Label>Skills & Types of Work You Can Do</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="e.g., Kitchen Remodeling, Tile Work"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.skills.map((skill, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-sm">
                        {skill}
                        <button type="button" onClick={() => removeSkill(idx)} className="hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-1">Optional</p>
              </div>

              <div>
                <Label>Certifications & Licenses</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    value={newCert}
                    onChange={(e) => setNewCert(e.target.value)}
                    placeholder="e.g., Licensed Electrician"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                  />
                  <Button type="button" onClick={addCertification} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.certifications.map((cert, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm">
                        {cert}
                        <button type="button" onClick={() => removeCertification(idx)} className="hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <Label className="text-base">Available for Work</Label>
                  <p className="text-sm text-slate-500">Show clients you're ready to take on projects</p>
                </div>
                <Switch
                  checked={formData.available}
                  onCheckedChange={(v) => handleChange('available', v)}
                />
              </div>

              {/* Identity Verification */}
              <div className="p-5 rounded-xl border-2 border-blue-200 bg-blue-50 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900">Identity Verification Required</h3>
                    <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                      You must upload a valid government-issued photo ID or Driver's License, and a clear unobstructed photo of your face. 
                      These are required for verification before your profile is approved.
                    </p>
                  </div>
                </div>

                {/* ID Document Upload */}
                <div className="bg-white rounded-xl border border-blue-200 p-4 space-y-3">
                  <Label className="font-semibold text-slate-800">Government-Issued ID / Driver's License *</Label>
                  <p className="text-xs text-slate-500">Upload a clear photo of your ID. All four corners must be visible.</p>
                  <div className="relative">
                    {formData.id_document_url ? (
                      <div className="relative group">
                        <img src={formData.id_document_url} alt="ID Document" className="w-full max-h-48 object-contain rounded-lg border border-slate-200 bg-slate-50" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-medium">Click to replace</span>
                        </div>
                        <input type="file" accept="image/*" onChange={handleIdUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
                        {uploadingId ? (
                          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-blue-400 mb-2" />
                            <span className="text-sm text-blue-600 font-medium">Upload ID / Driver's License</span>
                            <span className="text-xs text-blue-400 mt-1">JPG, PNG accepted</span>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={handleIdUpload} className="hidden" required={!formData.id_document_url} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Face Photo Upload */}
                <div className="bg-white rounded-xl border border-blue-200 p-4 space-y-3">
                  <Label className="font-semibold text-slate-800">Clear Face Photo *</Label>
                  <p className="text-xs text-slate-500">Upload an unobstructed photo of your face for identity verification.</p>
                  <div className="relative">
                    {formData.face_photo_url ? (
                      <div className="relative group">
                        <img src={formData.face_photo_url} alt="Face Photo" className="w-full max-h-48 object-contain rounded-lg border border-slate-200 bg-slate-50" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-medium">Click to replace</span>
                        </div>
                        <input type="file" accept="image/*" onChange={handleFaceUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
                        {uploadingFace ? (
                          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-blue-400 mb-2" />
                            <span className="text-sm text-blue-600 font-medium">Upload Face Photo</span>
                            <span className="text-xs text-blue-400 mt-1">JPG, PNG accepted</span>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={handleFaceUpload} className="hidden" required={!formData.face_photo_url} />
                      </label>
                    )}
                  </div>
                </div>
                </div>

                {/* Credential Documents */}
              <div>
                <Label className="text-base font-semibold text-slate-900 block mb-1">Credential Documents</Label>
                <p className="text-sm text-slate-500 mb-3">
                  Upload any certificates, academic degrees, diplomas, trade licenses, or contractor licenses. 
                  Contractor licenses must be registered as a sole proprietor. Degrees and diplomas must show the same legal name as your ID on file.
                </p>
                <CredentialDocumentsUpload
                  credentials={formData.credential_documents}
                  onChange={(docs) => handleChange('credential_documents', docs)}
                  legalName={formData.name}
                />
              </div>

              {/* Single-Person Policy */}
              <div className="p-5 rounded-xl border-2 border-red-200 bg-red-50 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <HardHat className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-900">Single-Person Freelancer Policy</h3>
                    <p className="text-sm text-red-700 mt-1 leading-relaxed">
                      By registering on ContractorHub, you confirm that you are a single individual freelancer. 
                      Companies, businesses, partnerships, crews, or any group of two or more persons are <strong>strictly prohibited</strong>. 
                      Any contractor found operating with workers, subcontractors, or associates will be <strong>permanently banned</strong> from the platform without notice.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white border border-red-200 rounded-lg p-3">
                  <input
                    type="checkbox"
                    id="solo_confirm"
                    required
                    className="mt-0.5 w-4 h-4 accent-red-600"
                  />
                  <label htmlFor="solo_confirm" className="text-sm text-red-800 cursor-pointer leading-relaxed">
                    I confirm that I am a single individual and not a company, crew, partnership, or multi-person entity. I understand that violation of this policy will result in a permanent ban from ContractorHub.
                  </label>
                </div>
              </div>
            </div>
          </Card>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold disabled:opacity-50"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Create My Profile'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}