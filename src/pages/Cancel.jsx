import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CreditCard, XCircle } from 'lucide-react';

const DECLINE_REASONS = {
  insufficient_funds: {
    title: 'Insufficient Funds',
    message: 'Your card was declined due to insufficient funds. Please use a different card or add funds to your account and try again.',
    icon: CreditCard,
    color: 'red',
  },
  card_declined: {
    title: 'Card Declined',
    message: 'Your card was declined by your bank. Please try a different card or contact your bank for more information.',
    icon: XCircle,
    color: 'red',
  },
  expired_card: {
    title: 'Card Expired',
    message: 'Your card has expired. Please use a different card.',
    icon: CreditCard,
    color: 'red',
  },
  declined: {
    title: 'Payment Declined',
    message: 'Your payment was declined. This may be due to insufficient funds, card restrictions, or bank policy. Please try a different card.',
    icon: XCircle,
    color: 'red',
  },
};

export default function Cancel() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const reason = params.get('reason');

  const declineInfo = DECLINE_REASONS[reason] || null;
  const isDeclined = !!declineInfo;

  const Icon = declineInfo?.icon || AlertCircle;
  const iconBg = isDeclined ? 'bg-red-100' : 'bg-amber-100';
  const iconColor = isDeclined ? 'text-red-600' : 'text-amber-600';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDeclined ? 'bg-gradient-to-br from-red-50 to-rose-50' : 'bg-gradient-to-br from-amber-50 to-orange-50'}`}>
      <Card className="max-w-md w-full p-8 text-center">
        <div className={`w-16 h-16 rounded-full ${iconBg} flex items-center justify-center mx-auto mb-4`}>
          <Icon className={`w-8 h-8 ${iconColor}`} />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {isDeclined ? declineInfo.title : 'Payment Cancelled'}
        </h1>

        <p className="text-slate-600 mb-6">
          {isDeclined
            ? declineInfo.message
            : 'You cancelled the payment. No charge has been made to your account.'}
        </p>

        {isDeclined && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 text-left space-y-1">
            <p className="font-semibold">Suggestions:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Try a different credit or debit card</li>
              <li>Check your available balance</li>
              <li>Contact your bank to authorize the transaction</li>
              <li>Ensure your card is not restricted for online purchases</li>
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <Button
            onClick={() => navigate(-1)}
            className={`w-full font-semibold ${isDeclined ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-slate-900'}`}
          >
            Try Again
          </Button>
          <Button onClick={() => navigate('/')} variant="outline" className="w-full">
            Return to Home
          </Button>
        </div>
      </Card>
    </div>
  );
}