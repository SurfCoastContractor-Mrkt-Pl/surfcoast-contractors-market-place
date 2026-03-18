import React from 'react';
import { differenceInDays, parseISO } from 'date-fns';

/**
 * Subtle trial status badge for the customer dashboard header.
 * Shows "✓ Free Trial — X days left" when active, "Trial ended" when expired.
 */
export default function TrialBadge({ profile }) {
  if (!profile?.trial_ends_at) return null;

  const daysLeft = differenceInDays(parseISO(profile.trial_ends_at), new Date());
  const isActive = profile.trial_active && daysLeft >= 0;

  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
        ✓ Free Trial — {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
      </span>
    );
  }

  // Expired
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
      Trial ended
    </span>
  );
}