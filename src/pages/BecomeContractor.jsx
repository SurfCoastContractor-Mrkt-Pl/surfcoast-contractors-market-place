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
id_document_url: z.string().min(1, 'ID document is required'),
face_photo_url: z.string().min(1, 'Face photo is required'),
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
compliance_acknowledged: z.boolean().default(false),
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
  const [journeyStarted, setJourneyStarted] = useState(false);
  const [createdContractor, setCreatedContractor] = useState(null);
  const [showStripeConnect, setShowStripeConnect] = useState(false);
  const [detectionLoading, setDetectionLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadingFace, setUploadingFace] = useState(false);

  // Initialize react-hook-form
  const savedData = localStorage.getItem(STORAGE_KEY);
  const defaultFormData = savedData ? JSON.parse(savedData) : {
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

  const methods = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: defaultFormData
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

  // Track journey start once auth is confirmed and email known
  useEffect(() => {
    if (!authChecked || journeyStarted || isPreview) return;
    base44.auth.me().then(user => {
      if (!user?.email) return;
      setJourneyStarted(true);
      base44.functions.invoke('trackSignupJourney', {
        email: user.email,
        signup_type: 'entrepreneur',
        event: 'started',
        step: 1,
        step_name: 'Basic Info',
        extra_data: { total_steps: 5 },
      }).catch(() => {});
    }).catch(() => {});
  }, [authChecked, journeyStarted, isPreview]);

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

      // Track journey completion
      if (!isPreview && data?.email) {
        base44.functions.invoke('trackSignupJourney', {
          email: data.email,
          signup_type: 'entrepreneur',
          event: 'profile_created',
          step: 5,
          step_name: 'Completed',
          extra_data: {
            total_steps: 5,
            name: data.name,
            phone: data.phone,
            location: data.location,
            line_of_work: data.line_of_work,
            contractor_type: data.contractor_type,
            has_id_document: !!data.id_document_url,
            has_face_photo: !!data.face_photo_url,
            has_credentials: (data.credential_documents?.length ?? 0) > 0,
            compliance_acknowledged: !!data.compliance_acknowledged,
            is_minor: data.is_minor ?? false,
          },
        }).catch(() => {});
      }

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
      5: ['compliance_acknowledged'],
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
      const nextStep = currentStep + 1;
      const stepNames = ['Basic Info', 'Professional', 'Identity', 'Credentials', 'Policies'];
      setCurrentStep(nextStep);
      window.scrollTo(0, 0);

      // Track step advancement
      if (!isPreview) {
        base44.auth.me().then(user => {
          if (!user?.email) return;
          const data = methods.getValues();
          base44.functions.invoke('trackSignupJourney', {
            email: user.email,
            signup_type: 'entrepreneur',
            event: 'step_advanced',
            step: nextStep,
            step_name: stepNames[nextStep - 1] ?? `Step ${nextStep}`,
            extra_data: {
              total_steps: 5,
              name: data.name,
              phone: data.phone,
              location: data.location,
              line_of_work: data.line_of_work,
              contractor_type: data.contractor_type,
              has_id_document: !!data.id_document_url,
              has_face_photo: !!data.face_photo_url,
              is_minor: isMinor,
            },
          }).catch(() => {});
        }).catch(() => {});
      }
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

    // Track all filled vs missing fields for journey
    if (!isPreview) {
      const requiredFields = ['name', 'email', 'phone', 'date_of_birth', 'location', 'contractor_type', 'line_of_work', 'id_document_url', 'face_photo_url'];
      const optionalFields = ['bio', 'hourly_rate', 'fixed_rate', 'years_experience'];
      const allFields = [...requiredFields, ...optionalFields];
      const filled = allFields.filter(f => !!(data[f]));
      const missing = requiredFields.filter(f => !data[f]);
      base44.functions.invoke('trackSignupJourney', {
        email: data.email,
        signup_type: 'entrepreneur',
        event: 'step_advanced',
        step: 5,
        step_name: 'Policies',
        fields_completed: filled,
        fields_missing: missing,
        extra_data: {
          total_steps: 5,
          name: data.name,
          phone: data.phone,
          location: data.location,
          line_of_work: data.line_of_work,
          contractor_type: data.contractor_type,
          has_id_document: !!data.id_document_url,
          has_face_photo: !!data.face_photo_url,
          has_credentials: (data.credential_documents?.length ?? 0) > 0,
          compliance_acknowledged: !!data.compliance_acknowledged,
          is_minor: isMinor,
        },
      }).catch(() => {});
    }

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
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#EBEBEC" }}>

      {isPreview && (
        <div className="text-white text-sm font-semibold py-2 px-4 text-center" style={{ background: designTokens.colors.primary.DEFAULT }}>
          👁 <strong>Admin Preview Mode</strong> — Form interactions work normally but submission will not save any data.
        </div>
      )}

      {/* Ticker */}
      <div style={{ background: "#1A1A1B", padding: "6px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: 11, color: "#e0e0e0" }}>// START YOUR BUSINESS · FREE PROFILE</span>
        <span style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: 11, color: "#ffffff" }}>California · Nationwide</span>
      </div>

      {/* Hero */}
      <div className="px-4 pt-6 pb-6 lg:pt-10 lg:pb-8 max-w-2xl mx-auto w-full">
        <div className="w-12 lg:w-14 h-12 lg:h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-5" style={{ background: designTokens.colors.accent.light, border: `2px solid ${designTokens.colors.accent.DEFAULT}` }}>
          <HardHat className="w-6 lg:w-7 h-6 lg:h-7" style={{ color: designTokens.colors.accent.DEFAULT }} />
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: "#1A1A1B", marginBottom: 12, lineHeight: 1.1, textAlign: "center" }}>Build Your Business — Free to Start</h1>
        <p className="text-sm lg:text-base mb-5" style={{ color: "#333", lineHeight: 1.75, fontStyle: "italic", fontWeight: 700 }}>
          SurfCoast Marketplace is free to join — no credit card, no catch. You create your profile, list what you do, and clients start finding you. When you are ready to communicate with someone who might hire you, a session fee of $1.50 per 10 minutes applies — this keeps both sides serious and filters out spam. When a job is booked and completed through the platform a facilitation fee of 18% applies. If you want more tools to run your business — scheduling, invoicing, analytics, client management — WAVE OS starts at $19 per month and unlocks as you complete jobs. If you are not ready for that yet, the free Basic Dashboard handles the essentials on your phone or laptop from day one.
        </p>

        {/* WAVE OS Unlock Table */}
        <div className="mb-5 rounded-xl overflow-hidden" style={{ border: "0.5px solid #D0D0D2", boxShadow: "3px 3px 0px #5C3500" }}>
          <div style={{ padding: "8px 16px", background: "#FBF5EC", borderBottom: "0.5px solid #D9B88A", fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: 11, color: "#5C3500", letterSpacing: "0.06em" }}>// WAVE OS — Unlock by Jobs Completed</div>
          {[
            { jobs: '5 completed jobs', plan: 'WAVE OS Starter', price: '$19/month' },
            { jobs: '6–49 completed jobs', plan: 'WAVE OS Pro', price: '$39/month' },
            { jobs: '50–99 completed jobs', plan: 'WAVE OS Max', price: '$59/month' },
            { jobs: '100+ jobs + verified license', plan: 'WAVE OS Premium', price: '$100/month' },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderTop: "0.5px solid #EBEBEC", background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
              <span style={{ color: "#333", fontSize: 12, fontStyle: "italic" }}>{row.jobs}</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, color: "#1A1A1B", fontSize: 12 }}>{row.plan}</div>
                <div style={{ fontFamily: "monospace", fontWeight: 700, color: "#5C3500", fontSize: 12 }}>{row.price}</div>
              </div>
            </div>
          ))}
          <div style={{ padding: "8px 16px", background: "#FBF5EC", borderTop: "0.5px solid #D9B88A", fontSize: 11, fontStyle: "italic", color: "#5C3500", fontWeight: 700 }}>
            Already licensed when you sign up? Premium unlocks immediately after documentation is verified.
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-5 rounded-xl overflow-hidden text-xs" style={{ border: "0.5px solid #D0D0D2", boxShadow: "3px 3px 0px #5C3500" }}>
          <div style={{ padding: "8px 16px", background: "#1A1A1B", fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: 11, color: "#F0E0C0", letterSpacing: "0.06em" }}>// HOW WE COMPARE</div>
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f6' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#555', borderBottom: `1px solid ${designTokens.colors.gray[200]}` }}>Feature</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#5C3500', borderBottom: `1px solid ${designTokens.colors.gray[200]}` }}>SurfCoast CMP</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#555', borderBottom: `1px solid ${designTokens.colors.gray[200]}` }}>Angi / HomeAdvisor</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#555', borderBottom: `1px solid ${designTokens.colors.gray[200]}` }}>ServiceTitan</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Free profile', 'Yes — forever', 'No', 'No'],
                  ['Lead fees', 'None — ever', '$15–$120 per lead', 'N/A'],
                  ['Shared leads', 'Never', 'Yes — 6 to 8 contractors', 'N/A'],
                  ['Communication fee', '$1.50 / 10 min session', 'Included in lead cost', 'N/A'],
                  ['Fee model', '18% on completed jobs only', 'Pay per lead', '$5K–$20K/year'],
                  ['Built by a tradesman', 'Yes — C36 plumber', 'No', 'No'],
                  ['Market Shop & vendor tools', 'Yes — WAVEshop OS', 'No', 'No'],
                ].map(([feat, sc, angi, st], i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${designTokens.colors.gray[100]}`, background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '8px 12px', color: '#333', fontWeight: 600 }}>{feat}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', color: '#5C3500', fontWeight: 700 }}>{sc}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', color: '#666' }}>{angi}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', color: '#666' }}>{st}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-5 space-y-3">
          <div style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: 11, color: "#333", letterSpacing: "0.06em" }}>// COMMON QUESTIONS</div>
          {[
            { q: 'How much does it cost to list on SurfCoast?', a: 'Your profile is free and stays free. When you are ready to communicate with a potential client a session fee of $1.50 per 10 minutes applies, or $50 per month for unlimited messaging. The platform takes an 18% facilitation fee only when a job is completed and paid through the platform.' },
            { q: 'Are there lead fees on SurfCoast?', a: 'No lead fees — ever. Angi charges $15 to $120 per lead whether you win or not. SurfCoast does not sell leads at all. Instead a $1.50 per 10-minute communication session fee applies when you are ready to talk to a potential client. This filters out spam and keeps inquiries serious. The 18% facilitation fee only applies when a job actually closes.' },
            { q: 'How is SurfCoast different from HomeAdvisor?', a: 'HomeAdvisor charges $15 to $120 per lead whether the job is won or not and sends that same lead to multiple other entrepreneurs at the same time. The FTC fined HomeAdvisor $7.2 million for misleading entrepreneurs about this. On SurfCoast your profile is free, there are no lead fees, and communication is handled through a $1.50 per 10-minute session. The 18% facilitation fee only comes out when a job is successfully completed.' },
            { q: 'What is the Basic Dashboard?', a: 'The Basic Dashboard is free for every entrepreneur on the platform regardless of whether they subscribe to WAVE OS. It handles your essential job management and payments on both laptop and phone. You never have to upgrade — WAVE OS is always optional.' },
            { q: 'Do I need to be licensed to join?', a: 'No. SurfCoast is built for everyone — licensed professionals, people just starting out, freelancers, creatives, and motivated individuals as young as 13 who are ready to start building something. If you have a skill and the drive, you belong here.' },
          ].map(({ q, a }, i) => (
            <div key={i} style={{ background: "#fff", border: "0.5px solid #D0D0D2", borderRadius: 8, padding: 16, boxShadow: "2px 2px 0px #D9B88A" }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: "#1A1A1B", marginBottom: 6, fontStyle: "italic" }}>{q}</div>
              <div style={{ fontSize: 13, lineHeight: 1.65, color: "#333", fontStyle: "italic", fontWeight: 700 }}>{a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Disclaimer */}
      <div className="max-w-2xl mx-auto w-full px-4 pb-3">
        <div style={{ background: "#1A1A1B", borderRadius: 8, padding: "12px 16px", display: "flex", gap: 10 }}>
          <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#5C3500", fontSize: 13, flexShrink: 0 }}>!</span>
          <p style={{ fontFamily: "monospace", fontSize: 11, color: "#888", margin: 0, fontStyle: "italic", lineHeight: 1.7 }}>
            Connection platform only. SurfCoast does not employ, endorse, or guarantee any entrepreneur or service. You are a fully independent individual solely responsible for your own work, licensing, taxes, and legal compliance. Solo operators only — no companies or multi-person operations permitted.
          </p>
        </div>
      </div>

      {/* Form container */}
      <div className="max-w-2xl mx-auto w-full px-4 pb-12 lg:pb-16" style={{ background: "#EBEBEC" }}>

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
              <OnboardingStep5Policies methods={methods} />
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-2 lg:gap-3 mt-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex-1 py-3 lg:py-4 text-sm lg:text-base font-bold transition-colors min-h-[44px] lg:min-h-[52px]"
                  style={{ border: "0.5px solid #D0D0D2", borderRadius: 8, background: "#fff", color: "#1A1A1B", fontFamily: "monospace", fontStyle: "italic", cursor: "pointer" }}
                >
                  ← Back
                </button>
              )}
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 py-3 lg:py-4 text-sm lg:text-base font-bold transition-all min-h-[44px] lg:min-h-[52px] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "#1A1A1B", color: "#F0E0C0", borderRadius: 8, border: "none", fontFamily: "monospace", fontStyle: "italic", cursor: "pointer", boxShadow: "3px 3px 0px #5C3500" }}
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