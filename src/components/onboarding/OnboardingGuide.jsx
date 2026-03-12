import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, Clock, DollarSign, Star, MessageSquare } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function OnboardingGuide({ open, onClose, userType = 'customer' }) {
  const [step, setStep] = useState(0);

  const customerSteps = [
    {
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      title: "1. Browse Professionals (Free)",
      description: "View profiles, ratings, and portfolios. No cost, no commitment. Get familiar with available talent.",
      time: "5 min"
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
      title: "2. Send a Quote Request ($1.75)",
      description: "Describe your project. Contractors respond with detailed quotes. Compare options side-by-side.",
      time: "10 min wait"
    },
    {
      icon: <DollarSign className="w-6 h-6 text-blue-600" />,
      title: "3. Agree & Pay",
      description: "Once you agree on price, pay securely. We hold funds until work is complete & approved.",
      time: "instant"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-blue-600" />,
      title: "4. Get Work Done",
      description: "Contractor starts immediately. Message in-app. Request changes if needed. Release payment when satisfied.",
      time: "varies"
    },
    {
      icon: <Star className="w-6 h-6 text-blue-600" />,
      title: "5. Leave a Review",
      description: "Rate your experience. Help other customers find great professionals.",
      time: "2 min"
    }
  ];

  const contractorSteps = [
    {
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      title: "1. Create Profile (10 min)",
      description: "Add your trade, experience, hourly rate, location, and a professional photo.",
      time: "10 min"
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
      title: "2. Get Verified",
      description: "Quick identity check (driver's license + selfie). Boosts credibility & appears in more searches.",
      time: "24 hrs"
    },
    {
      icon: <Star className="w-6 h-6 text-blue-600" />,
      title: "3. Add Portfolio",
      description: "Upload photos of past work. Portfolios get 3x more job requests.",
      time: "15 min"
    },
    {
      icon: <DollarSign className="w-6 h-6 text-blue-600" />,
      title: "4. Start Getting Booked",
      description: "Customers send quote requests & direct job offers. Respond fast to get more work.",
      time: "realtime"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-blue-600" />,
      title: "5. Earn & Grow",
      description: "Get paid securely after work completion. Build reviews & reputation for more bookings.",
      time: "ongoing"
    }
  ];

  const steps = userType === 'customer' ? customerSteps : contractorSteps;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-slate-900">
            {userType === 'customer' ? 'How to Get Quotes in 5 Minutes' : 'How to Start Earning in 1 Hour'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Steps */}
        <div className="p-8">
          <div className="space-y-6">
            {steps.map((stepItem, idx) => (
              <div 
                key={idx}
                className={`p-6 rounded-xl border-2 transition-all ${
                  step === idx 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">{stepItem.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg mb-2">
                      {stepItem.title}
                    </h3>
                    <p className="text-slate-600 mb-3">{stepItem.description}</p>
                    <p className="text-xs text-slate-500 font-medium">⏱ {stepItem.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tips */}
          <div className="mt-10 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="font-semibold text-slate-900 mb-3">💡 Pro Tips for Success</p>
            {userType === 'customer' ? (
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ Be detailed in project descriptions (photos help!)</li>
                <li>✓ Set a realistic budget range</li>
                <li>✓ Respond quickly to quotes for faster service</li>
                <li>✓ Read contractor reviews & portfolios before choosing</li>
              </ul>
            ) : (
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ Add 3+ portfolio photos (3x more inquiries)</li>
                <li>✓ Respond to inquiries within 2 hours</li>
                <li>✓ Be transparent about pricing & timeline</li>
                <li>✓ Feature your listing for guaranteed visibility</li>
              </ul>
            )}
          </div>

          {/* CTA */}
          <div className="mt-10 flex gap-3">
            {userType === 'customer' ? (
              <>
                <Link to={createPageUrl('FindContractors')} className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    Browse Contractors Now
                  </Button>
                </Link>
                <button onClick={onClose} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Close
                  </Button>
                </button>
              </>
            ) : (
              <>
                <Link to={createPageUrl('BecomeContractor')} className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    Start Your Profile
                  </Button>
                </Link>
                <button onClick={onClose} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Close
                  </Button>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}