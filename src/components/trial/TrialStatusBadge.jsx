import React from 'react';
import { Clock, Gift } from 'lucide-react';
import { getDaysRemaining, isTrialActive } from '@/lib/trialConfig';

export default function TrialStatusBadge({ trialEndDate, isFoundingMember = false, className = '' }) {
  if (!trialEndDate) return null;

  const daysRemaining = getDaysRemaining(trialEndDate);
  const isActive = isTrialActive(trialEndDate);

  if (!isActive) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 ${className}`}>
        <Clock className="w-3.5 h-3.5" />
        Trial Expired
      </div>
    );
  }

  const label = isFoundingMember
    ? `Founding Member - ${daysRemaining} days remaining`
    : `Free Trial - ${daysRemaining} days remaining`;

  const bgColor = isFoundingMember ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary';

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${bgColor} ${className}`}>
      {isFoundingMember ? (
        <Gift className="w-3.5 h-3.5" />
      ) : (
        <Clock className="w-3.5 h-3.5" />
      )}
      {label}
    </div>
  );
}