import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';

export default function StripePayoutSetup({ contractor, onSetupComplete }) {
  const [showWarning, setShowWarning] = useState(false);

  const setupMutation = useMutation({
    mutationFn: async () => {
      const resp = await base44.functions.invoke('createStripeConnectOnboarding', {});
      return resp?.data || resp;
    },
    onSuccess: (data) => {
      if (data?.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      }
    }
  });

  const isSetupComplete = contractor?.stripe_account_charges_enabled;

  return (
    <Card className={`p-6 ${isSetupComplete ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-slate-900">Stripe Payout Setup</h3>
            {isSetupComplete && (
              <div className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ready
              </div>
            )}
          </div>

          {isSetupComplete ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-700">
                Your Stripe Connect account is set up and ready to receive payouts.
              </p>
              <p className="text-xs text-slate-600">
                Account: <span className="font-mono text-slate-700">{contractor?.stripe_connected_account_id}</span>
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setupMutation.mutate()}
                disabled={setupMutation.isPending}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                View Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-orange-800">
                <strong>Required:</strong> Set up Stripe payouts to receive payment from customers. This must be completed before you can accept paid jobs.
              </p>

              {!showWarning ? (
                <Button
                  onClick={() => setShowWarning(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={setupMutation.isPending}
                >
                  {setupMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Opening...
                    </>
                  ) : (
                    'Set Up Stripe Payouts'
                  )}
                </Button>
              ) : (
                <div className="p-3 bg-white border border-orange-200 rounded-lg space-y-3">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-700">
                      You'll be redirected to Stripe to complete identity verification. This usually takes a few minutes.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setupMutation.mutate()}
                      disabled={setupMutation.isPending}
                      className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
                    >
                      {setupMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Redirecting...
                        </>
                      ) : (
                        'Continue to Stripe'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowWarning(false)}
                      disabled={setupMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}