import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import AIProfileGenerator from '@/components/contractor/AIProfileGenerator';
import { reverseGeocodeLocation, getUserLocation } from '@/components/location/geolocationUtils';

const formSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  photo_url: z.string().optional().default(''),
  id_document_url: z.string().optional().default(''),
  face_photo_url: z.string().optional().default(''),
  contractor_type: z.string().min(1, 'Please select a contractor type'),
  trade_specialty: z.string().optional().default(''),
  line_of_work: z.string().min(1, 'Please select your line of work'),
  line_of_work_other: z.string().optional().default(''),
  years_experience: z.string().optional().default(''),
  rate_type: z.enum(['hourly', 'fixed']).default('hourly'),
  hourly_rate: z.string().optional().default(''),
  fixed_rate: z.string().optional().default(''),
  fixed_rate_details: z.string().optional().default(''),
  location: z.string().min(1, 'Location is required'),
  bio: z.string().optional().default(''),
  skills: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  available: z.boolean().default(true),
  rating: z.number().nullable().optional(),
  reviews_count: z.number().default(0),
  credential_documents: z.array(z.object({}).passthrough()).default([]),
  parental_consent_docs: z.record(z.any()).optional().default({}),
});



const ONBOARDING_STEPS = ['Basic Info', 'Professional', 'Identity', 'Credentials', 'Policies'];
const STORAGE_KEY = 'contractor_onboarding_data';

export default function BecomeContractor() {
  const navigate = useNavigate();
  const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
  const [authChecked, setAuthChecked] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [createdContractor, setCreatedContractor] = useState(null);
  const [showStripeConnect, setShowStripeConnect] = useState(false);
  const [detectionLoading, setDetectionLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadingFace, setUploadingFace] = useState(false);

  // Initialize react-hook-form
  const methods = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {
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
      };
    }
  });

  const { watch, getValues } = methods;
  const formData = watch();

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

  // Auto-save form data to localStorage
  useEffect(() => {
    const subscription = watch((data) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

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
        return new Promise(resolve => setTimeout(resolve, 800));
      }
      try {
        const user = await base44.auth.me();
        if (!user?.email) {
          throw new Error('You must be logged in to create a contractor profile');
        }
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
      localStorage.removeItem(STORAGE_KEY);

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
        base44.analytics.track({ eventName: 'contractor_onboarding_compliance_shown' });
        setShowStripeConnect(true);
      } else {
        base44.analytics.track({ eventName: 'contractor_onboarding_compliance_shown' });
        setSuccess(true);
      }
    },
  });

  const validateStepFields = (step) => {
    const fields = {
      1: ['name', 'date_of_birth', 'location'],
      2: ['line_of_work'],
      3: ['id_document_url', 'face_photo_url'],
      4: isMinor ? ['parental_consent_docs'] : [],
      5: [],
    };

    return fields[step] || [];
  };

  const handleNextStep = async () => {
    const fieldsToValidate = validateStepFields(currentStep);
    const isValid = await methods.trigger(fieldsToValidate);

    if (isValid) {
      if (currentStep === 1 && age !== null && age < 13) {
        methods.setError('date_of_birth', { message: 'You must be at least 13 years old' });
        return;
      }
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

  const handleSubmit = async (data) => {
    if (!isPreview) {
      try {
        const user = await base44.auth.me();
        if (!user?.email) {
          methods.setError('email', { message: 'You must be logged in' });
          return;
        }
      } catch (err) {
        methods.setError('email', { message: 'Failed to verify your account' });
        return;
      }
    }

    base44.analytics.track({
      eventName: 'contractor_onboarding_form_submitted',
      properties: {
        contractor_type: data.contractor_type,
        line_of_work: data.line_of_work,
        is_minor: isMinor,
        has_id_doc: !!data.id_document_url,
        has_face_photo: !!data.face_photo_url,
        skills_count: data.skills.length,
        certs_count: data.certifications.length,
      },
    });

    const submitData = {
      ...data,
      is_minor: isMinor,
      years_experience: data.years_experience ? Number(data.years_experience) : null,
      hourly_rate: data.rate_type === 'hourly' && data.hourly_rate ? Number(data.hourly_rate) : null,
      fixed_rate: data.rate_type === 'fixed' && data.fixed_rate ? Number(data.fixed_rate) : null,
      fixed_rate_details: data.rate_type === 'fixed' ? data.fixed_rate_details : null,
      line_of_work_other: data.line_of_work === 'other' ? data.line_of_work_other : null,
    };
    mutation.mutate(submitData);
  };



  const detectLocation = async () => {
    setDetectionLoading(true);
    try {
      const userLoc = await getUserLocation();
      if (userLoc) {
        const locationStr = await reverseGeocodeLocation(userLoc.lat, userLoc.lon);
        if (locationStr) {
          methods.setValue('location', locationStr);
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
      methods.setValue('id_document_url', file_url);
    } catch (error) {
      methods.setError('id_document_url', { message: 'Failed to upload ID document' });
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
      methods.setValue('face_photo_url', file_url);
    } catch (error) {
      methods.setError('face_photo_url', { message: 'Failed to upload face photo' });
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

        <FormProvider {...methods}>
          <form onSubmit={currentStep === ONBOARDING_STEPS.length ? methods.handleSubmit(handleSubmit) : (e) => { e.preventDefault(); handleNextStep(); }}>
            {currentStep === 1 && (
              <OnboardingStep1BasicInfo
                formData={formData}
                detectionLoading={detectionLoading}
                onDetectLocation={detectLocation}
                age={age}
                isMinor={isMinor}
                methods={methods}
              />
            )}
            {currentStep === 2 && (
              <>
                <OnboardingStep2Professional
                  formData={formData}
                  methods={methods}
                />
                <AIProfileGenerator formData={formData} onBioGenerated={(bio) => methods.setValue('bio', bio)} />
              </>
            )}
            {currentStep === 3 && (
              <OnboardingStep3Identity
                formData={formData}
                uploadingId={uploadingId}
                uploadingFace={uploadingFace}
                onIdUpload={handleIdUpload}
                onFaceUpload={handleFaceUpload}
                methods={methods}
              />
            )}
            {currentStep === 4 && (
              <OnboardingStep4Credentials
                formData={formData}
                isMinor={isMinor}
                age={age}
                methods={methods}
              />
            )}
            {currentStep === 5 && (
              <OnboardingStep5Policies />
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
        </FormProvider>
      </div>

    </div>
  );
}