import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

export default function OnboardingProgressIndicator({ currentStep, totalSteps, steps }) {
  const progressPercentage = ((currentStep) / totalSteps) * 100;

  return (
    <div className="mb-8">
      {/* Progress Bar */}
      <div className="w-full bg-slate-700 rounded-full h-2 mb-6 overflow-hidden">
        <div
          className="bg-gradient-to-r from-amber-500 to-amber-600 h-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="relative flex items-center justify-center mb-2">
                {isCompleted ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : isActive ? (
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{stepNumber}</span>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-400 border-2 border-amber-500 flex items-center justify-center text-xs font-bold text-slate-900">
                    {stepNumber}
                  </div>
                )}
              </div>
              <p
                className={`text-xs text-center font-medium ${
                  isActive ? 'text-slate-800' : isCompleted ? 'text-green-600' : 'text-amber-600'
                }`}
                style={{ maxWidth: '80px' }}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>

      {/* Step Counter */}
      <p className="text-center text-sm text-slate-400">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
}