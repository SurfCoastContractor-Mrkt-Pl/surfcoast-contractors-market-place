import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
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
        console.error('Error fetching contractors:', err);
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
        alert('Failed to submit quote request');
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Error submitting quote request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Get a Quote</h1>
          <p className="text-lg text-slate-600">Connect with contractors and get detailed quotes for your project</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between gap-4 mb-6">
            {STEPS.map((step, idx) => (
              <div key={idx} className="flex-1">
                <div className={`h-2 rounded-full transition-all ${idx <= currentStep ? 'bg-blue-600' : 'bg-slate-200'}`} />
                <p className={`text-sm font-medium mt-2 ${idx <= currentStep ? 'text-blue-600' : 'text-slate-500'}`}>
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{STEPS[currentStep].title}</h2>
          <p className="text-slate-600 mb-8">{STEPS[currentStep].description}</p>

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