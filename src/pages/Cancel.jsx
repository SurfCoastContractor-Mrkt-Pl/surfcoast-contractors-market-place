import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Cancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Cancelled</h1>
        <p className="text-slate-600 mb-6">
          You cancelled the payment. No charge has been made to your account.
        </p>
        <div className="space-y-2">
          <Button onClick={() => navigate(-1)} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold">
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