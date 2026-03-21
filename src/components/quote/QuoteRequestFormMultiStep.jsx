import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const STEPS = [
  { id: 1, title: 'Project Details', description: 'Tell us about your project' },
  { id: 2, title: 'Upload Photos', description: 'Show us what you\'re working with' },
  { id: 3, title: 'Schedule', description: 'When do you need this done?' },
  { id: 4, title: 'Review', description: 'Confirm and send' },
];

export default function QuoteRequestFormMultiStep({ contractorId, contractorName, contractorEmail, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const [formData, setFormData] = useState({
    jobTitle: '',
    jobDescription: '',
    photos: [],
    photoUrls: [],
    startDate: '',
    timeline: '',
    visitorName: '',
    visitorEmail: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingPhotos(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const response = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(response.file_url);
      }
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...files],
        photoUrls: [...prev.photoUrls, ...uploadedUrls],
      }));
    } catch (err) {
      console.error('Photo upload failed:', err);
      alert('Failed to upload photos. Please try again.');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      photoUrls: prev.photoUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.visitorName || !formData.visitorEmail || !formData.jobTitle || !formData.jobDescription) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // Create a payment record for the quote request
      const payment = await base44.entities.Payment.create({
        payer_email: formData.visitorEmail,
        payer_name: formData.visitorName,
        payer_type: 'customer',
        amount: 1.75,
        status: 'confirmed',
        purpose: 'Quote request',
        contractor_email: contractorEmail,
      });

      // Create the quote request
      const quoteRequest = await base44.entities.QuoteRequest.create({
        contractor_id: contractorId,
        contractor_name: contractorName,
        contractor_email: contractorEmail,
        customer_email: formData.visitorEmail,
        customer_name: formData.visitorName,
        job_title: formData.jobTitle,
        work_description: formData.jobDescription,
        payment_id: payment.id,
        status: 'pending',
      });

      // Send notification email to contractor
      try {
        await base44.integrations.Core.SendEmail({
          to: contractorEmail,
          subject: `New Quote Request from ${formData.visitorName}`,
          body: `
You have received a new quote request from ${formData.visitorName} (${formData.visitorEmail}).

Project: ${formData.jobTitle}
Description: ${formData.jobDescription}

Timeline: ${formData.timeline || 'Not specified'}
Start Date: ${formData.startDate || 'Not specified'}

Please log in to your dashboard to view and respond to this quote request.
          `,
        });
      } catch (err) {
        console.error('Email notification failed:', err);
      }

      onSuccess?.({ quoteRequest, payment });
    } catch (err) {
      console.error('Quote request submission failed:', err);
      alert('Failed to submit quote request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      return formData.jobTitle && formData.jobDescription && formData.visitorName && formData.visitorEmail;
    }
    if (currentStep === 2) {
      return formData.photoUrls.length > 0;
    }
    if (currentStep === 3) {
      return formData.timeline || formData.startDate;
    }
    return true;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  currentStep >= step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-1 w-12 mx-2 transition-all ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">{STEPS[currentStep - 1].title}</h2>
          <p className="text-slate-600 mt-1">{STEPS[currentStep - 1].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 mb-6">
        {/* Step 1: Project Details */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Your Name *</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.visitorName}
                onChange={(e) => handleInputChange('visitorName', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Your Email *</label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={formData.visitorEmail}
                onChange={(e) => handleInputChange('visitorEmail', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Project Title *</label>
              <input
                type="text"
                placeholder="e.g., Kitchen Renovation, Electrical Work"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Project Description *</label>
              <textarea
                placeholder="Describe your project in detail. What needs to be done? Any specific requirements?"
                value={formData.jobDescription}
                onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                rows="5"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Step 2: Photo Upload */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">Upload Project Photos *</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm font-medium text-slate-600">Click to upload or drag and drop</span>
                <span className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 10MB</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhotos}
                  className="hidden"
                />
              </label>
            </div>

            {uploadingPhotos && (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading photos...</span>
              </div>
            )}

            {formData.photoUrls.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-900 mb-3">Uploaded Photos ({formData.photoUrls.length})</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {formData.photoUrls.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                      <button
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Schedule */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Preferred Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Project Timeline</label>
              <select
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select timeline...</option>
                <option value="urgent">Urgent (within 1 week)</option>
                <option value="soon">Soon (1-2 weeks)</option>
                <option value="flexible">Flexible (1-4 weeks)</option>
                <option value="no_rush">No rush (1+ months)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Project</p>
                <p className="text-sm text-slate-900 font-medium">{formData.jobTitle}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Description</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{formData.jobDescription}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">Contact</p>
                  <p className="text-sm text-slate-700">{formData.visitorName}</p>
                  <p className="text-xs text-slate-600">{formData.visitorEmail}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">Timeline</p>
                  <p className="text-sm text-slate-700">{formData.timeline || 'Not specified'}</p>
                  {formData.startDate && (
                    <p className="text-xs text-slate-600">{new Date(formData.startDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              {formData.photoUrls.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Photos Attached</p>
                  <p className="text-sm text-slate-700">{formData.photoUrls.length} photo(s)</p>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-600">
              By submitting this quote request, you agree to share your contact information with {contractorName}.
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceedToNextStep()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Send Quote Request
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}