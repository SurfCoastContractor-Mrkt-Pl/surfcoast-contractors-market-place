import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Loader2, Shield } from 'lucide-react';

export default function IdentityVerification({ contractor, onVerified }) {
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(null);

  const startVerificationMutation = useMutation({
    mutationFn: async () => {
      const resp = await base44.functions.invoke('initializeIdentityVerification', {});
      return resp?.data || resp;
    },
    onSuccess: (data) => {
      if (data?.verification_url) {
        window.open(data.verification_url, '_blank');
      }
    },
    onError: (error) => {
      setVerificationError(error.message || 'Failed to start verification');
    }
  });

  const completeVerificationMutation = useMutation({
    mutationFn: async (sessionId) => {
      const resp = await base44.functions.invoke('completeIdentityVerification', {
        sessionId
      });
      return resp?.data || resp;
    },
    onSuccess: (data) => {
      if (data?.success) {
        onVerified();
      } else {
        setVerificationError(data?.message || 'Verification failed');
      }
    },
    onError: (error) => {
      setVerificationError(error.message || 'Verification check failed');
    }
  });

  const isVerified = contractor?.identity_verified;

  return (
    <Card className={`p-6 ${isVerified ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-slate-900">Identity Verification</h3>
            {isVerified && (
              <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </Badge>
            )}
          </div>

          {isVerified ? (
            <div className="space-y-2">
              <p className="text-sm text-green-800">
                Your identity has been verified. You can now accept payments and access all contractor features.
              </p>
              <p className="text-xs text-green-700">
                Verification completed on {new Date(contractor.updated_date).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-blue-900">
                <strong>Required:</strong> Verify your identity to accept payments and build trust with customers. This takes about 2 minutes.
              </p>

              <div className="p-3 bg-white border border-blue-200 rounded-lg space-y-3">
                <div className="flex gap-2">
                  <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-700">
                    <p className="font-medium mb-1">What we verify:</p>
                    <ul className="text-xs text-slate-600 space-y-1 ml-4 list-disc">
                      <li>Government-issued ID (Driver's License, Passport)</li>
                      <li>Your identity matches your profile</li>
                      <li>Age verification (must be 18+)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {verificationError && (
                <div className="flex gap-2 p-3 bg-white border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-700">{verificationError}</p>
                    <button
                      onClick={() => setVerificationError(null)}
                      className="text-xs text-red-600 hover:text-red-700 mt-1 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              <Button
                onClick={() => startVerificationMutation.mutate()}
                disabled={startVerificationMutation.isPending || verifying}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {startVerificationMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Start Identity Verification
                  </>
                )}
              </Button>

              <p className="text-xs text-blue-700 text-center">
                Powered by Stripe Identity — Your data is secure and compliant with KYC regulations
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}