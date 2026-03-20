import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PricingDisclosure({ userType = 'contractor' }) {
  if (userType === 'contractor') {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <span className="font-semibold">Facilitation Fees:</span> SurfCoast charges a sliding scale fee on completed jobs (2-15% based on your annual earnings tier). This fee is deducted from your payout. Your tier advances automatically as you earn more throughout the year.
        </AlertDescription>
      </Alert>
    );
  }

  if (userType === 'vendor') {
    return (
      <Alert className="bg-green-50 border-green-200">
        <AlertCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-900">
          <span className="font-semibold">Vendor Fees:</span> Choose between $35/month (unlimited listings, no transaction fees) or 5% facilitation fee per sale. You can switch models at the start of your next billing cycle.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-purple-50 border-purple-200">
      <AlertCircle className="h-4 w-4 text-purple-600" />
      <AlertDescription className="text-purple-900">
        <span className="font-semibold">Communication Fees:</span> Direct messaging has small one-time fees ($1.50 limited, $1.75 quote request) or $50/month for unlimited messaging.
      </AlertDescription>
    </Alert>
  );
}