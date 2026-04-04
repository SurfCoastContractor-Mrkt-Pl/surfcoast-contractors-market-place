/**
 * WAVE OS Tier Eligibility Gate
 * Displays eligibility status and blocks checkout if contractor doesn't meet requirements
 */

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Lock, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function WaveOSTierGate({
  stripeProductId,
  contractorEmail,
  onEligible,
  onIneligible,
  children,
}) {
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const checkEligibility = async () => {
      try {
        const response = await base44.functions.invoke('validateWaveOSTierEligibility', {
          stripeProductId,
          contractorEmail,
        });

        setEligibility(response.data);
        if (response.data.eligible) {
          onEligible?.(response.data);
        } else {
          onIneligible?.(response.data);
        }
      } catch (error) {
        console.error('Eligibility check failed:', error);
        setEligibility({ eligible: false, reason: 'Unable to verify eligibility.' });
        onIneligible?.({ eligible: false, reason: error.message });
      } finally {
        setLoading(false);
      }
    };

    if (stripeProductId && contractorEmail) {
      checkEligibility();
    }
  }, [stripeProductId, contractorEmail, onEligible, onIneligible]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!eligibility) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 text-center text-sm text-muted-foreground">
        Unable to verify tier eligibility.
      </div>
    );
  }

  if (eligibility.eligible) {
    return (
      <>
        <div className="flex items-center gap-2 bg-secondary/10 border border-secondary rounded-lg p-3 mb-4">
          <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
          <span className="text-sm text-foreground font-medium">You're eligible for this WAVE OS tier!</span>
        </div>
        {children}
      </>
    );
  }

  // Ineligible
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-destructive/10 border border-destructive rounded-lg p-4">
        <Lock className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-foreground mb-1">Tier Locked</h3>
          <p className="text-sm text-muted-foreground">{eligibility.reason}</p>
        </div>
      </div>

      {/* Show progress if jobs-gated */}
      {eligibility.jobsRequired > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Progress to Unlock</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>{eligibility.completedJobsCount} / {eligibility.jobsRequired} jobs</span>
            <span>{Math.round((eligibility.completedJobsCount / eligibility.jobsRequired) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${Math.min(100, Math.round((eligibility.completedJobsCount / eligibility.jobsRequired) * 100))}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* HIS License note */}
      {eligibility.reason?.includes('H.I.S.') && (
        <div className="bg-card border border-border rounded-lg p-4 text-sm">
          <p className="text-muted-foreground">
            To add your H.I.S. license, go to your contractor profile and upload it under "Credentials".
          </p>
        </div>
      )}
    </div>
  );
}