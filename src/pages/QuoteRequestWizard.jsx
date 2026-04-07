import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { getErrorMessage, logError } from '@/lib/errorHandler';
import QuoteWizardStep1 from '@/components/quote/QuoteWizardStep1';
import QuoteWizardStep2 from '@/components/quote/QuoteWizardStep2';
import QuoteWizardStep3 from '@/components/quote/QuoteWizardStep3';
import QuoteWizardStep4 from '@/components/quote/QuoteWizardStep4';

const STEPS = [
  { title: 'Project Details', description: 'Tell us about your project' },
  { title: 'Select Trade', description: 'Choose the type of work needed' },
  { title: 'Add Photos', description: 'Show us what needs to be done' },
  { title: 'Review & Submit', description: 'Confirm and send your request' }
];

export default function QuoteRequestWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [contractors, setContractors] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    jobTitle: '',
    description: '',
    budget: '',
    timeline: '',
    contractorId: '',
    contractorName: '',
    contractorEmail: '',
    customerName: '',
    customerEmail: '',
    workDescription: '',
    photos: [],
    tradeCategory: ''
  });

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const data = await base44.entities.Contractor.list();
        setContractors(data || []);
      } catch (err) {
        logError('QuoteRequestWizard.fetchContractors', err);
        setError('Unable to load contractors. Please refresh and try again.');
      }
    };
    fetchContractors();
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('submitQuoteRequest', {
        jobTitle: formData.jobTitle,
        description: formData.description,
        budget: formData.budget,
        timeline: formData.timeline,
        contractorId: formData.contractorId,
        contractorName: formData.contractorName,
        contractorEmail: formData.contractorEmail,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        workDescription: formData.workDescription,
        photos: formData.photos,
        tradeCategory: formData.tradeCategory
      });

      if (response.data?.success) {
        navigate('/Success?type=quote');
      } else {
        setError('Failed to submit quote request. Please try again.');
      }
    } catch (err) {
      logError('QuoteRequestWizard.handleSubmit', err);
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
    shadow: "3px 3px 0px #5C3500",
  };
  const mono = { fontFamily: "monospace", fontWeight: 700, fontStyle: "italic" };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingTop: 32, paddingBottom: 32, paddingLeft: 16, paddingRight: 16, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 768, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <button
            onClick={() => navigate('/')}
            style={{ ...mono, fontSize: 12, color: T.muted, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 24, padding: 0 }}
          >
            <ChevronLeft style={{ width: 16, height: 16 }} /> Back
          </button>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", fontWeight: 800, color: T.dark, margin: "0 0 8px 0", fontStyle: "italic" }}>Get a Quote</h1>
          <p style={{ fontSize: 16, color: T.muted, fontStyle: "italic" }}>Connect with contractors and get detailed quotes for your project</p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
            {STEPS.map((step, idx) => (
              <div key={idx} style={{ flex: 1 }}>
                <div style={{ height: 2, borderRadius: 999, background: idx <= currentStep ? T.amber : T.border }} />
                <p style={{ ...mono, fontSize: 11, marginTop: 8, color: idx <= currentStep ? T.amber : T.muted }}>
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{ background: "#FBF5EC", border: "0.5px solid #D9B88A", borderRadius: 8, padding: 14, marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ fontSize: 16, marginTop: 2 }}>⚠️</div>
            <div>
              <p style={{ color: T.amber, fontWeight: 700, fontSize: 13, marginBottom: 8, fontStyle: "italic" }}>{error}</p>
              <button
                onClick={() => setError(null)}
                style={{ ...mono, fontSize: 12, color: T.amber, background: "none", border: "none", cursor: "pointer" }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div style={{ background: T.card, border: "0.5px solid " + T.border, borderRadius: 10, boxShadow: T.shadow, padding: 32, marginBottom: 32 }}>
          <h2 style={{ fontSize: "clamp(1.4rem, 4vw, 1.8rem)", fontWeight: 800, color: T.dark, margin: "0 0 8px 0", fontStyle: "italic" }}>{STEPS[currentStep].title}</h2>
          <p style={{ color: T.muted, marginBottom: 32, fontStyle: "italic" }}>{STEPS[currentStep].description}</p>

          {currentStep === 0 && (
            <QuoteWizardStep1 formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 1 && (
            <QuoteWizardStep2 formData={formData} setFormData={setFormData} contractors={contractors} />
          )}
          {currentStep === 2 && (
            <QuoteWizardStep3 formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 3 && (
            <QuoteWizardStep4 formData={formData} contractors={contractors} />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            onClick={handlePrev}
            disabled={currentStep === 0}
            variant="outline"
            className="px-6"
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
          </Button>

          {currentStep === STEPS.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting || !formData.contractorId}
              className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
              ) : (
                <>Submit Quote Request</>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isStepValid(currentStep, formData)}
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function isStepValid(step, formData) {
  switch (step) {
    case 0:
      return formData.jobTitle && formData.description && formData.customerName && formData.customerEmail;
    case 1:
      return formData.contractorId && formData.tradeCategory;
    case 2:
      return formData.photos && formData.photos.length > 0;
    case 3:
      return true;
    default:
      return false;
  }
}