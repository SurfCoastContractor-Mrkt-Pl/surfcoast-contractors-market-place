import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function PaymentComplianceWarning({ contractor }) {
  if (!contractor || contractor.payment_compliant !== false) {
    return null;
  }

  const graceUntil = contractor.payment_lock_grace_until
    ? new Date(contractor.payment_lock_grace_until)
    : null;
  const daysLeft = graceUntil
    ? Math.ceil((graceUntil - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <div className="flex gap-4 p-4">
        <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-yellow-900 mb-2">
            Payment Compliance Required
          </h4>
          <p className="text-sm text-yellow-800 mb-3">
            Off-platform payment activity was detected on your account. All payments must be processed through SurfCoast.
          </p>
          <div className="flex items-center gap-2 text-sm text-yellow-700 font-medium">
            <Clock className="w-4 h-4" />
            {daysLeft > 0 ? (
              <>Grace period: {daysLeft} days remaining</>
            ) : (
              <>Account functionality restricted until payment processed through platform</>
            )}
          </div>
          <p className="text-xs text-yellow-600 mt-2">
            Once all payments are processed through the SurfCoast platform, your account will be restored to full functionality.
          </p>
        </div>
      </div>
    </Card>
  );
}