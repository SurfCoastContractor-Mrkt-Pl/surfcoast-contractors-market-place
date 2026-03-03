import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, DollarSign } from 'lucide-react';

export default function QuoteFeeDisclosure({ open, onClose, onConfirm, contractorName }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-500" />
            Quick Quote Fee
          </DialogTitle>
          <DialogDescription>One-time charge per quote request</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-slate-700">Quote Request Fee:</span>
              <span className="text-2xl font-bold text-amber-600">$0.75</span>
            </div>
            <p className="text-sm text-slate-600">
              This fee allows {contractorName} to review your project and provide a written estimate.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <h4 className="font-semibold text-slate-900">What you get:</h4>
            <ul className="space-y-1 text-slate-600 ml-2">
              <li className="flex gap-2">
                <span>✓</span>
                <span>Written project estimate from the contractor</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>No back-and-forth messaging required</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Quick response from professionals</span>
              </li>
            </ul>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              You can request quotes from multiple contractors. Each request is a separate $0.75 charge.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900" onClick={onConfirm}>
            Continue ($0.75)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}