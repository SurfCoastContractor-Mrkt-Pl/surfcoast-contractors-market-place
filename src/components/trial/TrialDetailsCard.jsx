import React from 'react';
import { Gift, Users, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDaysRemaining, isTrialActive } from '@/lib/trialConfig';

export default function TrialDetailsCard({
  isFoundingMember = false,
  trialEndDate = null,
  successfulReferrals = 0,
  onReferralShare = null,
}) {
  const daysRemaining = getDaysRemaining(trialEndDate);
  const isActive = isTrialActive(trialEndDate);

  if (!isActive) {
    return (
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-700">Trial Expired</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">Your trial period has ended. Subscribe to continue using the platform.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isFoundingMember ? (
            <>
              <Gift className="w-5 h-5 text-secondary" />
              Founding Member Access
            </>
          ) : (
            <>
              <Clock className="w-5 h-5 text-primary" />
              Free Trial
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Days Remaining */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium text-foreground">Days Remaining</span>
          <span className="text-2xl font-bold text-primary">{daysRemaining}</span>
        </div>

        {/* Founding Member Info */}
        {isFoundingMember && (
          <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
            <p className="text-sm text-secondary font-semibold">🎉 Founding Member Perk</p>
            <p className="text-xs text-muted-foreground mt-1">Full access to all features for 1 year. Thank you for being an early supporter!</p>
          </div>
        )}

        {/* Referral Bonus (Non-Founding Members) */}
        {!isFoundingMember && (
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-primary flex items-center gap-2">
                <Users className="w-4 h-4" />
                Extend Your Trial
              </p>
              <span className="text-xs font-bold bg-primary text-white px-2 py-1 rounded-full">
                {successfulReferrals}/5
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Refer 5 friends who complete signup to extend your trial by up to 5 days.
            </p>
            {onReferralShare && (
              <button
                onClick={onReferralShare}
                className="w-full px-3 py-2 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5" />
                Share Referral Link
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}