import React from 'react';
import { differenceInDays, parseISO } from 'date-fns';

/**
 * Subtle "✓ Free Trial — X days left" badge for the customer dashboard header.
 */
export default function TrialBadge({ profile }) {
  if (!profile?.trial_ends_at || !profile?.trial_active) return null;

  const daysLeft = differenceInDays(parseISO(profile.trial_ends_at), new Date());
  if (daysLeft < 0) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
      ✓ Free Trial — {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
    </span>
  );
}