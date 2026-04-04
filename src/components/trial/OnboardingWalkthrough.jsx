import React, { useState } from 'react';
import { X, CheckCircle2, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ONBOARDING_STEPS = {
  contractor: [
    {
      title: 'Welcome to SurfCoast!',
      description: 'You\'re now part of a verified community of tradespeople. Let\'s get you started.',
      icon: Zap,
    },
    {
      title: 'Complete Your Profile',
      description: 'Add a photo, bio, and trade details. A complete profile gets 5x more visibility.',
      action: 'Go to Profile',
      actionPath: '/ContractorAccount',
    },
    {
      title: 'Browse Jobs',
      description: 'Find quality jobs from verified clients in your area. Set your own rates.',
      action: 'Find Jobs',
      actionPath: '/Jobs',
    },
    {
      title: 'Build Your Reputation',
      description: 'Complete jobs, earn reviews, and unlock badges. Trust is everything here.',
      action: 'Learn More',
      actionPath: '/About',
    },
  ],
  customer: [
    {
      title: 'Welcome to SurfCoast!',
      description: 'Find verified, trusted tradespeople for your projects. Easy, secure, transparent.',
      icon: Zap,
    },
    {
      title: 'Post Your First Job',
      description: 'Describe your project, set a budget, and get quotes from verified professionals.',
      action: 'Post a Job',
      actionPath: '/PostJob',
    },
    {
      title: 'Review Quotes',
      description: 'Compare proposals, check reviews, and hire the right professional for your needs.',
      action: 'Learn More',
      actionPath: '/About',
    },
    {
      title: 'Track Progress',
      description: 'Monitor your projects in real-time with photos, updates, and secure payments.',
      action: 'Get Started',
      actionPath: '/Dashboard',
    },
  ],
};

export default function OnboardingWalkthrough({ userType = 'contractor', onDismiss = null }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [open, setOpen] = useState(true);
  const steps = ONBOARDING_STEPS[userType] || ONBOARDING_STEPS.contractor;
  const step = steps[currentStep];
  const Icon = step.icon || CheckCircle2;

  const handleClose = () => {
    setOpen(false);
    onDismiss?.();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-1 hover:bg-muted rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-bold">{step.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-center text-muted-foreground">{step.description}</p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'bg-primary w-6'
                    : idx < currentStep
                    ? 'bg-primary w-2'
                    : 'bg-muted w-2'
                }`}
              />
            ))}
          </div>

          {/* Action Button */}
          <div className="space-y-3">
            {step.actionPath && (
              <a
                href={step.actionPath}
                className="w-full block px-4 py-3 rounded-lg bg-primary text-white font-semibold text-center hover:opacity-90 transition-opacity"
              >
                {step.action}
              </a>
            )}
            <button
              onClick={handleNext}
              className="w-full px-4 py-3 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-colors"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}