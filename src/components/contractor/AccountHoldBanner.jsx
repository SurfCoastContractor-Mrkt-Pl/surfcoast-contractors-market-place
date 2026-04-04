import React from 'react';
import { AlertCircle, Clock, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAccountHoldStatus, daysUntilPhotoDeadline } from '@/lib/accountHoldLogic';

/**
 * Account Hold Banner
 * Displays warnings if contractor account is locked or restricted
 */
export default function AccountHoldBanner({ contractor, scopes = [] }) {
  const holdStatus = getAccountHoldStatus(contractor, scopes);

  if (!holdStatus.isLocked) return null;

  return (
    <div className="space-y-3 mb-6">
      {holdStatus.reasons.map((reason, idx) => (
        <Card key={idx} className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">
                  {reason.type === 'missing_after_photos' ? '⚠️ Account Locked' : '⏸️ Account Restricted'}
                </h3>
                <p className="text-sm text-red-800 mb-3">{reason.message}</p>
                
                {reason.type === 'missing_after_photos' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-100"
                    onClick={() => {
                      // Navigate to scope detail to upload photos
                      window.location.href = `/ProjectManagement?scope=${reason.scopeId}`;
                    }}
                  >
                    Upload Photos Now
                  </Button>
                )}
                
                {reason.type === 'pending_rating' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-100"
                    onClick={() => {
                      window.location.href = `/ProjectManagement?scope=${reason.scopeId}`;
                    }}
                  >
                    Submit Rating
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}