import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function PayoutBreakdown({ scope, role }) {
  if (role !== 'contractor' || !scope) return null;

  const totalCost = scope.cost_type === 'hourly' 
    ? (scope.cost_amount || 0) * (scope.estimated_hours || 0)
    : (scope.cost_amount || 0);

  const platformFeePercentage = scope.platform_fee_percentage || 3;
  const platformFeeAmount = scope.platform_fee_amount || (totalCost * platformFeePercentage / 100);
  const payoutAmount = scope.contractor_payout_amount || (totalCost - platformFeeAmount);

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-lg">Your Payout Breakdown</CardTitle>
        <CardDescription>What you'll receive after platform facilitation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-700">Job Total:</span>
            <span className="font-semibold text-slate-900">${totalCost.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center text-red-700 bg-red-100 px-3 py-2 rounded-lg">
            <span>Platform Facilitation Fee ({platformFeePercentage}%):</span>
            <span className="font-semibold">-${platformFeeAmount.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center bg-green-100 px-3 py-2 rounded-lg border border-green-300">
            <span className="font-semibold text-green-900">Your Payout:</span>
            <span className="font-bold text-lg text-green-900">${payoutAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-2 text-xs text-slate-600 bg-slate-100 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            The 3% platform facilitation fee covers payment processing, dispute resolution, review verification, and support — ensuring safe, reliable transactions for both parties.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}