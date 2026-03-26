import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { logError } from '@/lib/errorHandler';
import { ArrowLeft, HardHat, Loader2, CheckCircle, ChevronRight } from 'lucide-react';
import ComplianceAcknowledgment from '@/components/contractor/ComplianceAcknowledgment';
import StripeConnectOnboarding from '@/components/contractor/StripeConnectOnboarding';
import OnboardingProgressIndicator from '@/components/contractor/OnboardingProgressIndicator';
import OnboardingStep1BasicInfo from '@/components/contractor/OnboardingStep1BasicInfo';
import OnboardingStep2Professional from '@/components/contractor/OnboardingStep2Professional';
import OnboardingStep3Identity from '@/components/contractor/OnboardingStep3Identity';
import OnboardingStep4Credentials from '@/components/contractor/OnboardingStep4Credentials';
import OnboardingStep5Policies from '@/components/contractor/OnboardingStep5Policies';
import { reverseGeocodeLocation, getUserLocation } from '@/components/location/geolocationUtils';



const ONBOARDING_STEPS = ['Basic Info', 'Professional', 'Identity', 'Credentials', 'Policies'];

export default function BecomeContractor() {
  const navigate = useNavigate();
  const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
  const [authChecked, setAuthChecked] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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
  const [showStripeConnect, setShowStripeConnect] = useState(false);
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
  const [uploadingFace, setUploadingFace] = useState(false);

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

      if (data?.compliance_acknowledged) {
        // Compliance done — go to Stripe Connect step
        base44.analytics.track({ eventName: 'contractor_onboarding_compliance_shown' });
        setShowStripeConnect(true);
      } else {
        // Show compliance acknowledgment screen first
        base44.analytics.track({ eventName: 'contractor_onboarding_compliance_shown' });
        setSuccess(true);
      }
    },
  });

  const validateStep = (step) => {
    switch (step) {
      case 1: // Basic Info
        if (!formData.name?.trim()) {
          setDobError('Full name is required');
          return false;
        }
        if (!formData.date_of_birth) {
          setDobError('Date of birth is required');
          return false;
        }
        if (age === null || age < 13) {
          setDobError('You must be at least 13 years old to register as a contractor');
          return false;
        }
        if (!formData.location?.trim()) {
          setDobError('Location is required');
          return false;
        }
        setDobError('');
        return true;

      case 2: // Professional
        if (!formData.line_of_work) {
          setDobError('Please select your line of work');
          return false;
        }
        if (formData.line_of_work === 'other' && !formData.line_of_work_other?.trim()) {
          setDobError('Please specify your line of work');
          return false;
        }
        setDobError('');
        return true;

      case 3: // Identity
        if (!formData.id_document_url) {
          setDobError('Government-issued ID is required');
          return false;
        }
        if (!formData.face_photo_url) {
          setDobError('Face photo is required');
          return false;
        }
        setDobError('');
        return true;

      case 4: // Credentials (skip for minors unless they have docs)
        if (isMinor) {
          const pd = formData.parental_consent_docs;
          if (!pd?.parent_name || !pd?.parent_email || !pd?.parent_phone) {
            setDobError('Please fill in parent/guardian contact information');
            return false;
          }
          if (!pd?.parental_consent_form_url || !pd?.child_id_url || !pd?.parent_id_url ||
              !pd?.proof_of_relationship_url || !pd?.child_proof_of_residence_url || !pd?.parent_proof_of_residence_url) {
            setDobError('Please upload all required parental consent documents');
            return false;
          }
        }
        setDobError('');
        return true;

      case 5: // Policies
        setDobError('');
        return true;

      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) {
      return;
    }

    if (!isPreview) {
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
    setDobError('');
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

  const handleIdUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingId(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange('id_document_url', file_url);
    } catch (error) {
      setDobError('Failed to upload ID document. Please try again.');
      logError('BecomeContractor.handleIdUpload', error);
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
      setDobError('Failed to upload face photo. Please try again.');
      logError('BecomeContractor.handleFaceUpload', error);
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

  // Step: Stripe Connect Payout Setup
  if (showStripeConnect && createdContractor) {
    return (
      <StripeConnectOnboarding
        contractor={createdContractor}
        onComplete={() => {
          base44.analytics.track({ eventName: 'contractor_onboarding_stripe_connect_completed' });
          base44.analytics.track({ eventName: 'contractor_onboarding_completed' });
          navigate(createPageUrl('ContractorAccount'));
        }}
      />
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
            // After compliance → show Stripe Connect step
            setShowStripeConnect(true);
            setSuccess(false);
          }}
        />
      );
    }

    // Compliance already done, go straight to Stripe Connect
    return (
      <StripeConnectOnboarding
        contractor={createdContractor}
        onComplete={() => {
          base44.analytics.track({ eventName: 'contractor_onboarding_stripe_connect_completed' });
          base44.analytics.track({ eventName: 'contractor_onboarding_completed' });
          navigate(createPageUrl('ContractorAccount'));
        }}
      />
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
          {["Free to join", "Identity verified platform", "Direct client connections", "18% facilitation fee only"].map(item => (
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

        {/* Progress Indicator */}
        <OnboardingProgressIndicator 
          currentStep={currentStep} 
          totalSteps={ONBOARDING_STEPS.length} 
          steps={ONBOARDING_STEPS}
        />

        <form onSubmit={currentStep === ONBOARDING_STEPS.length ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }} className="contractor-form">
          {/* STEP 1: Basic Info */}
          {currentStep === 1 && (
            <OnboardingStep1BasicInfo
              formData={formData}
              dobError={dobError}
              detectionLoading={detectionLoading}
              onFieldChange={handleChange}
              onDetectLocation={detectLocation}
              age={age}
              isMinor={isMinor}
            />
          )}

          {/* STEP 2: Professional Info */}
          {currentStep === 2 && (
            <OnboardingStep2Professional
              formData={formData}
              onFieldChange={handleChange}
            />
          )}

          {/* STEP 3: Identity Verification */}
          {currentStep === 3 && (
            <OnboardingStep3Identity
              formData={formData}
              uploadingId={uploadingId}
              uploadingFace={uploadingFace}
              onIdUpload={handleIdUpload}
              onFaceUpload={handleFaceUpload}
            />
          )}

          {/* STEP 4: Credentials & Parental Consent */}
          {currentStep === 4 && (
            <OnboardingStep4Credentials
              formData={formData}
              onFieldChange={handleChange}
              isMinor={isMinor}
              age={age}
            />
          )}

          {/* STEP 5: Policies & Fee Disclosure */}
          {currentStep === 5 && (
            <OnboardingStep5Policies />
          )}

          {/* Error Message */}
          {dobError && (
            <div className="p-4 mb-6 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{dobError}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                style={{ flex: 1, padding:"16px", borderRadius:"12px", border:"1px solid rgba(255,255,255,0.2)", fontSize:"16px", fontWeight:"700", cursor:"pointer", transition:"all 0.2s", minHeight:"52px", background:"rgba(255,255,255,0.07)", color:"#fff" }}
              >
                ← Back
              </button>
            )}
            <button
              type="submit"
              disabled={mutation.isPending}
              style={{ flex: 1, padding:"16px", borderRadius:"12px", border:"none", fontSize:"16px", fontWeight:"700", cursor:mutation.isPending ? "not-allowed" : "pointer", transition:"all 0.2s", minHeight:"52px", background:"linear-gradient(135deg, #d97706 0%, #b45309 100%)", color:"#fff", opacity:mutation.isPending ? 0.7 : 1, display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", boxShadow:"0 4px 24px rgba(217,119,6,0.35)" }}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 style={{ width:"18px", height:"18px", animation:"spin 0.8s linear infinite" }} />
                  Creating Profile...
                </>
              ) : currentStep === ONBOARDING_STEPS.length ? (
                'Create My Profile →'
              ) : (
                <>Next <ChevronRight style={{ width:"18px", height:"18px" }} /></>
              )}
            </button>
          </div>
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