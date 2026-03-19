import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, HardHat, Loader2, CheckCircle, Plus, X, Upload, AlertTriangle, MapPin } from 'lucide-react';
import CredentialDocumentsUpload from '@/components/contractor/CredentialDocumentsUpload';
import MinorConsentUpload from '@/components/contractor/MinorConsentUpload';
import LineOfWorkSelector from '@/components/contractor/LineOfWorkSelector';
import ComplianceAcknowledgment from '@/components/contractor/ComplianceAcknowledgment';
import { reverseGeocodeLocation, getUserLocation } from '@/components/location/geolocationUtils';

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
  const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
  const [authChecked, setAuthChecked] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isPreview) { setAuthChecked(true); return; }
    base44.auth.me().then(user => {
      if (!user) {
        base44.auth.redirectToLogin(window.location.pathname);
      } else {
        setAuthChecked(true);
      }
    }).catch(() => {
      base44.auth.redirectToLogin(window.location.pathname);
    });
  }, [isPreview]);
  const [createdContractor, setCreatedContractor] = useState(null);
  const [newCert, setNewCert] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [uploadingId, setUploadingId] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    photo_url: '',
    id_document_url: '',
    face_photo_url: '',
    contractor_type: '',
    trade_specialty: '',
    line_of_work: '',
    line_of_work_other: '',
    years_experience: '',
    rate_type: 'hourly',
    hourly_rate: '',
    fixed_rate: '',
    fixed_rate_details: '',
    location: '',
    bio: '',
    skills: [],
    certifications: [],
    available: true,
    rating: null,
    reviews_count: 0,
    credential_documents: [],
    parental_consent_docs: {},
  });
  const [dobError, setDobError] = useState('');
  const [detectionLoading, setDetectionLoading] = useState(false);

  const getAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birth = new Date(dob);
    return today.getFullYear() - birth.getFullYear() - (
      today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0
    );
  };

  const age = getAge(formData.date_of_birth);
  const isMinor = age !== null && age < 18;

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isPreview) {
        // Preview mode: don't submit, just simulate success
        return new Promise(resolve => setTimeout(resolve, 800));
      }
      // Verify authenticated user and link to their User account
      try {
        const user = await base44.auth.me();
        if (!user?.email) {
          throw new Error('You must be logged in to create a contractor profile');
        }
        
        // Check if contractor already exists for this user
        const existing = await base44.entities.Contractor.filter({ email: user.email });
        if (existing && existing.length > 0) {
          throw new Error('A contractor profile for your account already exists');
        }
      } catch (err) {
        throw err;
      }
      return base44.entities.Contractor.create(data);
    },
    onSuccess: (data) => {
      setCreatedContractor(data);

      base44.analytics.track({
        eventName: 'contractor_profile_created',
        properties: {
          contractor_type: data?.contractor_type,
          line_of_work: data?.line_of_work,
          is_minor: data?.is_minor ?? false,
          has_credentials: (data?.credential_documents?.length ?? 0) > 0,
          location: data?.location,
        },
      });

      // If compliance_acknowledged is already true, skip to dashboard
      if (data?.compliance_acknowledged) {
        base44.analytics.track({ eventName: 'contractor_onboarding_completed' });
        setSuccess(true);
        setTimeout(() => {
          navigate(createPageUrl('ContractorAccount'));
        }, 2000);
      } else {
        // Show compliance acknowledgment screen
        base44.analytics.track({ eventName: 'contractor_onboarding_compliance_shown' });
        setSuccess(true);
      }
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date_of_birth) {
      setDobError('Date of birth is required');
      return;
    }
    if (age === null || age < 13) {
       setDobError('You must be at least 13 years old to register as a contractor');
       return;
     }
     if (!formData.line_of_work) {
       setDobError('Please select your line of work');
       return;
     }
     if (formData.line_of_work === 'other' && !formData.line_of_work_other?.trim()) {
       setDobError('Please specify your line of work');
       return;
     }
    if (isMinor) {
      const pd = formData.parental_consent_docs;
      if (!pd?.parent_name || !pd?.parent_email || !pd?.parent_phone) {
        setDobError('Please fill in parent/guardian contact information');
        return;
      }
      if (!pd?.parental_consent_form_url || !pd?.child_id_url || !pd?.parent_id_url ||
          !pd?.proof_of_relationship_url || !pd?.child_proof_of_residence_url || !pd?.parent_proof_of_residence_url) {
        setDobError('Please upload all required parental consent documents');
        return;
      }
    }
    
    if (!isPreview) {
      // Verify user is authenticated before submitting
      try {
        const user = await base44.auth.me();
        if (!user?.email) {
          setDobError('You must be logged in to create a contractor profile');
          return;
        }
      } catch (err) {
        setDobError('Failed to verify your account');
        return;
      }
    }
    
    setDobError('');

    base44.analytics.track({
      eventName: 'contractor_onboarding_form_submitted',
      properties: {
        contractor_type: formData.contractor_type,
        line_of_work: formData.line_of_work,
        is_minor: isMinor,
        has_id_doc: !!formData.id_document_url,
        has_face_photo: !!formData.face_photo_url,
        skills_count: formData.skills.length,
        certs_count: formData.certifications.length,
      },
    });

    const data = {
      ...formData,
      is_minor: isMinor,
      years_experience: formData.years_experience ? Number(formData.years_experience) : null,
      hourly_rate: formData.rate_type === 'hourly' && formData.hourly_rate ? Number(formData.hourly_rate) : null,
      fixed_rate: formData.rate_type === 'fixed' && formData.fixed_rate ? Number(formData.fixed_rate) : null,
      fixed_rate_details: formData.rate_type === 'fixed' ? formData.fixed_rate_details : null,
      line_of_work_other: formData.line_of_work === 'other' ? formData.line_of_work_other : null,
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

  const detectLocation = async () => {
    setDetectionLoading(true);
    try {
      const userLoc = await getUserLocation();
      if (userLoc) {
        const locationStr = await reverseGeocodeLocation(userLoc.lat, userLoc.lon);
        if (locationStr) {
          handleChange('location', locationStr);
        }
      }
    } catch (error) {
      console.error('Location detection error:', error);
    } finally {
      setDetectionLoading(false);
    }
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


  const BG_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b5d136d5baa9e2c5f01224/f64fccdce_generated_image.png";

  if (!authChecked) {
    return (
      <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"#0a1628" }}>
        <div style={{ width:"32px", height:"32px", border:"3px solid rgba(255,255,255,0.2)", borderTop:"3px solid #d97706", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (success && createdContractor) {
    if (!createdContractor.compliance_acknowledged) {
      return (
        <ComplianceAcknowledgment
          contractorId={createdContractor.id}
          contractorLocation={createdContractor.location}
          onComplete={() => {
            base44.analytics.track({ eventName: 'contractor_onboarding_compliance_accepted' });
            base44.analytics.track({ eventName: 'contractor_onboarding_completed' });
            setSuccess(false);
            setTimeout(() => {
              navigate(createPageUrl('ContractorAccount'));
            }, 1000);
          }}
        />
      );
    }

    return (
      <div style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0a1628" }}>
        <div style={{ position:"fixed", inset:0, backgroundImage:`url(${BG_IMAGE})`, backgroundSize:"cover", backgroundPosition:"center top", zIndex:0 }} />
        <div style={{ position:"fixed", inset:0, background:"linear-gradient(to bottom, rgba(10,22,40,0.75) 0%, rgba(10,22,40,0.85) 100%)", zIndex:1 }} />
        <div style={{ position:"relative", zIndex:2, background:"rgba(10,22,40,0.6)", backdropFilter:"blur(20px)", border:"1px solid rgba(217,119,6,0.3)", borderRadius:"20px", padding:"48px 40px", maxWidth:"440px", width:"90%", textAlign:"center" }}>
          <div style={{ width:"64px", height:"64px", borderRadius:"50%", background:"rgba(217,119,6,0.15)", border:"2px solid rgba(217,119,6,0.4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
            <CheckCircle style={{ width:"32px", height:"32px", color:"#d97706" }} />
          </div>
          <h2 style={{ fontSize:"26px", fontWeight:"800", color:"#ffffff", margin:"0 0 12px", letterSpacing:"-0.5px" }}>Profile Created!</h2>
          <p style={{ color:"rgba(255,255,255,0.7)", marginBottom:"8px", lineHeight:"1.6" }}>Your contractor profile is now live. Clients can now find and contact you.</p>
          <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)" }}>Redirecting to your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column", fontFamily:"'Inter','Segoe UI',sans-serif", overflowX:"hidden", background:"#0a1628" }}>
      <div style={{ position:"fixed", inset:0, backgroundImage:`url(${BG_IMAGE})`, backgroundSize:"cover", backgroundPosition:"center top", backgroundRepeat:"no-repeat", zIndex:0 }} />
      <div style={{ position:"fixed", inset:0, background:"linear-gradient(to bottom, rgba(10,22,40,0.7) 0%, rgba(10,22,40,0.6) 40%, rgba(10,22,40,0.85) 100%)", zIndex:1 }} />

      {/* Header */}
      <header style={{ position:"relative", zIndex:10, display:"flex", alignItems:"center", padding:"12px 16px", background:"rgba(10,22,40,0.5)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <Link to={createPageUrl('Home')} style={{ display:'flex', flexDirection:'column', gap:'2px', textDecoration:'none' }}>
          <span style={{ fontSize:"clamp(14px, 4vw, 17px)", fontWeight:"800", color:"#ffffff", letterSpacing:"-0.5px", lineHeight:1 }}>SurfCoast</span>
          <span style={{ fontSize:"clamp(7px, 2vw, 10px)", fontWeight:"700", letterSpacing:"1.5px", color:"rgba(255,255,255,0.6)", textTransform:"uppercase", lineHeight:1, marginLeft:"8px" }}>MARKETPLACE</span>
        </Link>
        <div style={{ marginLeft:"auto", display:"flex", gap:"8px", alignItems:"center" }}>
          <button onClick={() => navigate(-1)} style={{ color:"rgba(255,255,255,0.7)", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"20px", padding:"6px 14px", fontSize:"13px", fontWeight:"600", cursor:"pointer", display:"flex", alignItems:"center", gap:"6px" }}>
            <ArrowLeft style={{ width:"14px", height:"14px" }} /> Back
          </button>
        </div>
      </header>

      {isPreview && (
        <div style={{ position:"relative", zIndex:10, background:"rgba(29,111,164,0.9)", backdropFilter:"blur(8px)", color:"#fff", fontSize:"13px", fontWeight:"600", padding:"8px 16px", textAlign:"center", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
          👁 <strong>Admin Preview Mode</strong> — Form interactions work normally but submission will not save any data.
        </div>
      )}

      {/* Hero */}
      <div style={{ position:"relative", zIndex:2, textAlign:"center", padding:"40px 16px 32px", maxWidth:"700px", margin:"0 auto", width:"100%" }}>
        <div style={{ width:"56px", height:"56px", borderRadius:"16px", background:"rgba(217,119,6,0.15)", border:"2px solid rgba(217,119,6,0.4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <HardHat style={{ width:"28px", height:"28px", color:"#d97706" }} />
        </div>
        <h1 style={{ fontSize:"clamp(28px, 5vw, 48px)", fontWeight:"800", color:"#ffffff", margin:"0 0 12px", lineHeight:1.1, letterSpacing:"-1px", textShadow:"0 2px 24px rgba(0,0,0,0.5)" }}>Become a Contractor</h1>
        <p style={{ fontSize:"clamp(14px, 2.5vw, 17px)", color:"rgba(255,255,255,0.7)", margin:"0 0 24px", lineHeight:1.6 }}>Create your professional profile and start earning — free to join, get paid securely.</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"16px", justifyContent:"center" }}>
          {["Free to join", "Identity verified platform", "Direct client connections", "3% facilitation fee only"].map(item => (
            <span key={item} style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"13px", color:"rgba(255,255,255,0.75)" }}>
              <CheckCircle style={{ width:"14px", height:"14px", color:"#4ade80", flexShrink:0 }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Form container */}
      <div style={{ position:"relative", zIndex:2, maxWidth:"720px", margin:"0 auto", width:"100%", padding:"0 16px 48px" }}>
        <style>{`
          .contractor-form label { color: rgba(255,255,255,0.85) !important; }
          .contractor-form .text-slate-500 { color: rgba(255,255,255,0.45) !important; }
          .contractor-form .text-slate-900 { color: #ffffff !important; }
          .contractor-form .bg-slate-50 { background: rgba(255,255,255,0.05) !important; border-color: rgba(255,255,255,0.1) !important; }
          .contractor-form input, .contractor-form textarea, .contractor-form select { background: rgba(255,255,255,0.07) !important; border-color: rgba(255,255,255,0.2) !important; color: #fff !important; }
          .contractor-form input::placeholder, .contractor-form textarea::placeholder { color: rgba(255,255,255,0.35) !important; }
          .contractor-form .bg-amber-50 { background: rgba(217,119,6,0.12) !important; border-color: rgba(217,119,6,0.4) !important; }
          .contractor-form .bg-amber-50 * { color: rgba(255,200,100,0.9) !important; }
          .contractor-form .bg-red-50 { background: rgba(220,38,38,0.12) !important; border-color: rgba(220,38,38,0.4) !important; }
          .contractor-form .bg-red-50 * { color: rgba(255,160,160,0.9) !important; }
          .contractor-form .bg-blue-50 { background: rgba(29,111,164,0.15) !important; border-color: rgba(29,111,164,0.4) !important; }
          .contractor-form .bg-blue-50 * { color: rgba(150,210,255,0.9) !important; }
          .contractor-form .bg-white { background: rgba(255,255,255,0.06) !important; }
          .contractor-form .bg-white * { color: rgba(255,255,255,0.85) !important; }
          .contractor-form .bg-amber-100 { background: rgba(217,119,6,0.2) !important; }
          .contractor-form .text-amber-700 { color: #fbbf24 !important; }
          .contractor-form .bg-slate-100 { background: rgba(255,255,255,0.08) !important; }
          .contractor-form .text-slate-700 { color: rgba(255,255,255,0.8) !important; }
          .contractor-form .border-slate-200 { border-color: rgba(255,255,255,0.15) !important; }
          .contractor-form [data-radix-select-trigger] { background: rgba(255,255,255,0.07) !important; border-color: rgba(255,255,255,0.2) !important; color: #fff !important; }
        `}</style>
        <form onSubmit={handleSubmit} className="contractor-form">
          {/* Photo & Basic Info */}
          <div style={{ background:"rgba(10,22,40,0.55)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"16px", padding:"28px", marginBottom:"16px" }}>
            <h2 style={{ fontSize:"16px", fontWeight:"700", color:"#ffffff", marginBottom:"20px", paddingBottom:"12px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>Basic Information</h2>
            
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
              <div>
                <Label htmlFor="dob">Date of Birth * <span className="text-slate-400 font-normal">(must be 13+)</span></Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => { handleChange('date_of_birth', e.target.value); setDobError(''); }}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                  className="mt-1.5"
                />
                {dobError && <p className="text-xs text-red-600 mt-1">{dobError}</p>}
                {isMinor && (
                  <p className="text-xs text-orange-600 mt-1 font-medium">⚠ Parental consent required — see section below</p>
                )}
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
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="location">Location *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={detectLocation}
                    disabled={detectionLoading}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    {detectionLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Detecting...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3 h-3 mr-1" />
                        Auto-Detect
                      </>
                    )}
                  </Button>
                </div>
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
          </div>

          {/* Professional Info */}
          <div style={{ background:"rgba(10,22,40,0.55)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"16px", padding:"28px", marginBottom:"16px" }}>
            <h2 style={{ fontSize:"16px", fontWeight:"700", color:"#ffffff", marginBottom:"20px", paddingBottom:"12px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>Professional Details</h2>
            
            <div className="space-y-6">
              <div>
                <LineOfWorkSelector
                  value={formData.line_of_work}
                  customValue={formData.line_of_work_other}
                  onChange={(v) => handleChange('line_of_work', v)}
                  onCustomChange={(v) => handleChange('line_of_work_other', v)}
                />
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
                  <Label htmlFor="rate_type">Rate Type</Label>
                  <Select value={formData.rate_type} onValueChange={(v) => handleChange('rate_type', v)}>
                    <SelectTrigger id="rate_type" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly Rate</SelectItem>
                      <SelectItem value="fixed">Fixed Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.rate_type === 'hourly' && (
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
              )}

              {formData.rate_type === 'fixed' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="fixed_rate">Fixed Rate ($)</Label>
                    <Input
                      id="fixed_rate"
                      type="number"
                      value={formData.fixed_rate}
                      onChange={(e) => handleChange('fixed_rate', e.target.value)}
                      placeholder="e.g., 500"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fixed_rate_details">Fixed Rate Details</Label>
                    <Textarea
                      id="fixed_rate_details"
                      value={formData.fixed_rate_details}
                      onChange={(e) => handleChange('fixed_rate_details', e.target.value)}
                      placeholder="Describe what your fixed rate covers (e.g., full bathroom renovation, includes materials and labor...)"
                      rows={3}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              )}

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

                {/* Trade license hold notice */}
                {formData.certifications.some(c => /licen/i.test(c)) && (
                  <div className="mt-3 p-4 rounded-xl border-2 border-amber-300 bg-amber-50 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Trade License — Verification Hold</p>
                      <p className="text-sm text-amber-700 mt-0.5 leading-relaxed">
                        Because you've listed a trade license, your profile will be placed on a temporary hold pending admin review. 
                        You may receive a phone call or email from our team to gather additional proof of licensing before your profile is approved. 
                        This process typically takes 1–3 business days.
                      </p>
                    </div>
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

              {/* Minor Parental Consent Section */}
              {isMinor && (
                <MinorConsentUpload
                  data={formData.parental_consent_docs}
                  onChange={(docs) => handleChange('parental_consent_docs', docs)}
                  location={formData.location}
                  age={age}
                />
              )}

              {/* Platform Fee Disclosure */}
              <div className="p-5 rounded-xl border-2 border-amber-200 bg-amber-50 space-y-3">
                <div>
                  <h3 className="font-bold text-amber-900 mb-2">Platform Facilitation Fee</h3>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    We charge a 3% facilitation fee on completed jobs. This covers payment processing, dispute resolution, review verification, and customer support that protects both you and your clients. When you complete a $1,000 job, you'll receive $970 after the fee.
                  </p>
                </div>
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
                    I confirm that I am a single individual and not a company, crew, partnership, or multi-person entity. I understand that violation of this policy will result in a permanent ban from SurfCoast Contractor Market Place.
                  </label>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            style={{ width:"100%", padding:"16px", borderRadius:"12px", border:"none", fontSize:"16px", fontWeight:"700", cursor:mutation.isPending ? "not-allowed" : "pointer", transition:"all 0.2s", minHeight:"52px", background:"linear-gradient(135deg, #d97706 0%, #b45309 100%)", color:"#fff", opacity:mutation.isPending ? 0.7 : 1, display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", boxShadow:"0 4px 24px rgba(217,119,6,0.35)" }}
          >
            {mutation.isPending ? (
              <>
                <Loader2 style={{ width:"18px", height:"18px", animation:"spin 0.8s linear infinite" }} />
                Creating Profile...
              </>
            ) : (
              'Create My Profile →'
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div style={{ position:"relative", zIndex:2, display:"flex", flexWrap:"wrap", justifyContent:"center", alignItems:"center", gap:"8px", padding:"12px 24px", background:"rgba(10,22,40,0.75)", borderTop:"1px solid rgba(255,255,255,0.07)", fontSize:"12px", color:"rgba(255,255,255,0.35)" }}>
        <span>© 2026 SurfCoast Marketplace</span>
        <span style={{ color:"rgba(255,255,255,0.15)" }}>·</span>
        <Link to="/Terms" style={{ color:"rgba(255,255,255,0.4)", textDecoration:"none" }}>Terms</Link>
        <span style={{ color:"rgba(255,255,255,0.15)" }}>·</span>
        <Link to="/PrivacyPolicy" style={{ color:"rgba(255,255,255,0.4)", textDecoration:"none" }}>Privacy</Link>
      </div>
    </div>
  );
}