import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { logError } from '@/lib/errorHandler';
import { designTokens } from '@/lib/designTokens';
import { HardHat, Loader2, CheckCircle, ChevronRight } from 'lucide-react';
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


  if (!authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div style={{ width:"32px", height:"32px", border:"3px solid rgba(0,0,0,0.1)", borderTop:"3px solid #d97706", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
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
            setShowStripeConnect(true);
            setSuccess(false);
          }}
        />
      );
    }

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
    <div className="min-h-screen flex flex-col" style={{ fontFamily: designTokens.typography.fontFamily.base }}>

      {isPreview && (
        <div className="text-white text-sm font-semibold py-2 px-4 text-center" style={{ background: designTokens.colors.primary.DEFAULT }}>
          👁 <strong>Admin Preview Mode</strong> — Form interactions work normally but submission will not save any data.
        </div>
      )}

      {/* Hero */}
      <div className="text-center px-4 pt-6 pb-6 lg:pt-10 lg:pb-8 max-w-2xl mx-auto w-full">
        <div className="w-12 lg:w-14 h-12 lg:h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-5" style={{ background: designTokens.colors.accent.light, border: `2px solid ${designTokens.colors.accent.DEFAULT}` }}>
          <HardHat className="w-6 lg:w-7 h-6 lg:h-7" style={{ color: designTokens.colors.accent.DEFAULT }} />
        </div>
        <h1 className="text-2xl lg:text-5xl font-extrabold mb-2 lg:mb-3 leading-tight tracking-tight" style={{ color: designTokens.colors.gray[900] }}>Become a Contractor</h1>
        <p className="text-sm lg:text-lg mb-4 lg:mb-6 leading-relaxed" style={{ color: designTokens.colors.gray[600] }}>Create your professional profile and start earning — free to join, get paid securely.</p>
        <div className="flex flex-wrap gap-4 justify-center">
          {["Free to join", "Identity verified platform", "Direct client connections", "18% facilitation fee only"].map(item => (
            <span key={item} className="flex items-center gap-1.5 text-sm" style={{ color: designTokens.colors.gray[700] }}>
              <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: designTokens.colors.success }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Form container */}
      <div className="max-w-2xl mx-auto w-full px-4 pb-12 lg:pb-16">

        {/* Progress Indicator */}
        <OnboardingProgressIndicator
          currentStep={currentStep}
          totalSteps={ONBOARDING_STEPS.length}
          steps={ONBOARDING_STEPS}
        />

        <form onSubmit={currentStep === ONBOARDING_STEPS.length ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }}>
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
          {currentStep === 2 && (
            <OnboardingStep2Professional
              formData={formData}
              onFieldChange={handleChange}
            />
          )}
          {currentStep === 3 && (
            <OnboardingStep3Identity
              formData={formData}
              uploadingId={uploadingId}
              uploadingFace={uploadingFace}
              onIdUpload={handleIdUpload}
              onFaceUpload={handleFaceUpload}
            />
          )}
          {currentStep === 4 && (
            <OnboardingStep4Credentials
              formData={formData}
              onFieldChange={handleChange}
              isMinor={isMinor}
              age={age}
            />
          )}
          {currentStep === 5 && (
            <OnboardingStep5Policies />
          )}

          {/* Error Message */}
          {dobError && (
            <div className="p-4 mb-6 rounded-xl flex items-start gap-3" style={{ background: '#fee2e2', border: `1px solid #fecaca` }}>
              <span className="text-lg leading-none">⚠</span>
              <p className="text-sm flex-1" style={{ color: '#991b1b' }}>{dobError}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-2 lg:gap-3 mt-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex-1 py-3 lg:py-4 rounded-xl text-sm lg:text-base font-bold transition-colors min-h-[44px] lg:min-h-[52px]"
                style={{ border: `1px solid ${designTokens.colors.gray[300]}`, background: designTokens.colors.white, color: designTokens.colors.gray[700] }}
              >
                ← Back
              </button>
            )}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-3 lg:py-4 rounded-xl text-sm lg:text-base font-bold text-white transition-all min-h-[44px] lg:min-h-[52px] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${designTokens.colors.accent.DEFAULT} 0%, ${designTokens.colors.accent.dark} 100%)`, boxShadow: `0 4px 20px ${designTokens.colors.accent.light}55` }}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Profile...
                </>
              ) : currentStep === ONBOARDING_STEPS.length ? (
                'Create My Profile →'
              ) : (
                <>Next <ChevronRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}