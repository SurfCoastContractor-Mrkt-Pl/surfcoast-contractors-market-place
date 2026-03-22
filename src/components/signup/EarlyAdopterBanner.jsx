import React from 'react';
import { AlertCircle, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function EarlyAdopterBanner() {
  return (
    <Card className="mb-6 border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <Zap className="w-6 h-6 text-amber-600 mt-0.5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-900 mb-2">
              🎉 Be Among the First 100 — Get 1 Year Free!
            </h3>
            <p className="text-sm text-amber-800 mb-3">
              Complete your profile now to claim your free membership for one full year. 
              You'll only pay transaction fees — no membership cost. Limited to the first 100 unique registrations.
            </p>
            <div className="flex items-start gap-2 bg-white/60 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900">
                <strong>Claim it or lose it:</strong> Your spot is reserved upon signup, but you must complete your full profile within 24 hours to secure the free year.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}