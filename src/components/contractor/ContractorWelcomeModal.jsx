import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Lightbulb, ArrowRight, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function ContractorWelcomeModal({ open, onClose, onStartWithAgent }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            Welcome to SurfCoast Contractor Market Place!
          </DialogTitle>
          <div className="sr-only">New contractor welcome dialog</div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-slate-700">
              Your contractor profile is ready. Let's get you set up to browse jobs and connect with customers.
            </p>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 text-sm">What's next?</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Complete your profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Browse available jobs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <div className="flex items-start gap-1.5">
                    <span>Respond to quote requests</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-slate-400 mt-0.5 cursor-help flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent className="text-xs max-w-xs">
                          Customers will send you estimate requests—respond to grow your business
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <div className="flex items-start gap-1.5">
                    <span>Message customers ($1.50/session or $50/month)</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-slate-400 mt-0.5 cursor-help flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent className="text-xs max-w-xs">
                          Both you and customers pay $1.50 for 10-minute sessions, or $50/month for unlimited messaging
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
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