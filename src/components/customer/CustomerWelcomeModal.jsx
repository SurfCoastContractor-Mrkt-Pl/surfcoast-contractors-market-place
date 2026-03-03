import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Lightbulb, ArrowRight } from 'lucide-react';

export default function CustomerWelcomeModal({ open, onClose, onStartWithAgent }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            Welcome to ContractorHub!
          </DialogTitle>
          <div className="sr-only">New customer welcome dialog</div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-slate-700">
              Your customer account is ready. Let's get you set up to find contractors and post jobs.
            </p>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 text-sm">What's next?</h4>
              <ul className="space-y-1.5 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Complete your profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Browse contractors or post a job</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Message contractors ($1.50 per project or $20/month)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={onStartWithAgent}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Get Started with AI Assistant
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Set Up Manually
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <p className="text-xs text-slate-400 text-center">
            The AI assistant can help guide you through setup. You can close it anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}