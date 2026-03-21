import React from 'react';
import { CheckCircle, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QuoteRequestSuccessModal({ contractorName, contractorEmail, visitorEmail, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 sm:p-8 shadow-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Sent!</h2>
          <p className="text-slate-600 mb-6">
            Your quote request has been sent to <span className="font-semibold">{contractorName}</span>
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">You'll be notified</p>
                <p className="text-xs text-slate-600">A confirmation email will be sent to {visitorEmail}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">Expect a response</p>
                <p className="text-xs text-slate-600">Most contractors respond within 24-48 hours</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-6">
            You've been charged $1.75 for this quote request. This fee grants you access to communicate directly with the contractor.
          </p>

          <Button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700">
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}