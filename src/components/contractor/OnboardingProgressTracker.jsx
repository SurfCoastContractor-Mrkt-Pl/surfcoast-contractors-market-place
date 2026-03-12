import React from 'react';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const STEPS = [
  { id: 1, name: 'Basic Info', description: 'Name, email, location' },
  { id: 2, name: 'Identity Verify', description: 'Photo & ID upload' },
  { id: 3, name: 'Professional Details', description: 'Skills & experience' },
  { id: 4, name: 'Portfolio', description: 'Add work samples' },
  { id: 5, name: 'Payment Setup', description: 'Stripe account' },
  { id: 6, name: 'Launch Profile', description: 'Go live & start earning' }
];

export default function OnboardingProgressTracker({ currentStep = 1 }) {
  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="font-serif text-lg font-bold text-slate-900 mb-4">
        Profile Setup Progress
      </h3>

      <Progress value={progress} className="mb-6" />

      <p className="text-sm text-slate-600 mb-6 font-medium">
        Step {currentStep} of {STEPS.length} • {Math.round(progress)}% Complete
      </p>

      <div className="space-y-3">
        {STEPS.map((step) => {
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isLocked = currentStep < step.id;

          return (
            <div key={step.id} className="flex items-start gap-3">
              {isComplete ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : isCurrent ? (
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">{step.id}</span>
                </div>
              ) : isLocked ? (
                <Lock className="w-6 h-6 text-slate-300 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-6 h-6 text-slate-300 flex-shrink-0 mt-0.5" />
              )}
              <div className={isLocked ? 'opacity-50' : ''}>
                <p className={`font-medium ${isCurrent ? 'text-blue-600' : 'text-slate-900'}`}>
                  {step.name}
                </p>
                <p className="text-xs text-slate-600">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {currentStep === STEPS.length && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-semibold text-green-900">
            🎉 Profile Complete! Your profile is now live and visible to customers.
          </p>
        </div>
      )}
    </div>
  );
}