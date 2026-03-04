import React from 'react';
import { Card } from '@/components/ui/card';
import { Heart } from 'lucide-react';

export const CUSTOMER_BADGE_TIERS = [
  {
    tier: 1,
    name: 'First Timer',
    threshold: 1,
    description: 'First verified job closed out',
    color: 'from-slate-500 to-slate-400',
    border: 'border-slate-400',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    emoji: '🌱',
  },
  {
    tier: 2,
    name: 'Loyal Customer',
    threshold: 3,
    description: '3 verified jobs closed out',
    color: 'from-amber-600 to-amber-500',
    border: 'border-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    emoji: '🤝',
  },
  {
    tier: 3,
    name: 'Trusted Client',
    threshold: 5,
    description: '5 verified jobs closed out',
    color: 'from-orange-500 to-orange-400',
    border: 'border-orange-400',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    emoji: '⭐',
  },
  {
    tier: 4,
    name: 'Verified Customer',
    threshold: 10,
    description: '10 verified jobs closed out',
    color: 'from-green-600 to-green-500',
    border: 'border-green-500',
    bg: 'bg-green-50',
    text: 'text-green-800',
    emoji: '✅',
  },
  {
    tier: 5,
    name: 'Repeat Client',
    threshold: 20,
    description: '20 verified jobs closed out',
    color: 'from-teal-600 to-teal-500',
    border: 'border-teal-500',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    emoji: '🔄',
  },
  {
    tier: 6,
    name: 'Dedicated Customer',
    threshold: 50,
    description: '50 verified jobs closed out',
    color: 'from-blue-600 to-blue-500',
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    emoji: '💙',
  },
  {
    tier: 7,
    name: 'Platinum Member',
    threshold: 100,
    description: '100 verified jobs closed out',
    color: 'from-violet-600 to-violet-500',
    border: 'border-violet-500',
    bg: 'bg-violet-50',
    text: 'text-violet-800',
    emoji: '💎',
  },
  {
    tier: 8,
    name: 'Community Pillar',
    threshold: 150,
    description: '150 verified jobs closed out',
    color: 'from-purple-700 to-purple-500',
    border: 'border-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    emoji: '🏛️',
  },
  {
    tier: 9,
    name: 'Elite Patron',
    threshold: 200,
    description: '200 verified jobs closed out',
    color: 'from-rose-600 to-pink-500',
    border: 'border-rose-500',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    emoji: '👑',
  },
  {
    tier: 10,
    name: 'SurfCoast Legend',
    threshold: 300,
    description: '300 verified jobs closed out on SurfCoast',
    color: 'from-amber-500 via-yellow-400 to-amber-300',
    border: 'border-yellow-400',
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
    text: 'text-amber-900',
    emoji: '🌊',
  },
];

export function getEarnedCustomerBadges(count = 0) {
  return CUSTOMER_BADGE_TIERS.filter(b => count >= b.threshold);
}

export function getHighestCustomerBadge(count = 0) {
  const earned = getEarnedCustomerBadges(count);
  return earned.length > 0 ? earned[earned.length - 1] : null;
}

function BadgeItem({ badge, earned, completedJobsCount }) {
  const progress = !earned
    ? Math.min(100, Math.round((completedJobsCount / badge.threshold) * 100))
    : 100;

  return (
    <div className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
      earned
        ? `${badge.border} ${badge.bg} shadow-sm`
        : 'border-slate-200 bg-slate-50 opacity-50 grayscale'
    }`}>
      {earned && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-md`}>
        <span className="text-2xl">{badge.emoji}</span>
      </div>
      <div className="text-center">
        <div className={`text-xs font-bold ${earned ? badge.text : 'text-slate-400'}`}>
          Tier {badge.tier}
        </div>
        <div className={`text-sm font-semibold ${earned ? 'text-slate-800' : 'text-slate-400'}`}>
          {badge.name}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">{badge.description}</div>
      </div>
      {!earned && (
        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
          <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

export default function CustomerBadges({ completedJobsCount = 0 }) {
  const earned = getEarnedCustomerBadges(completedJobsCount);
  const highest = getHighestCustomerBadge(completedJobsCount);
  const next = CUSTOMER_BADGE_TIERS.find(b => b.threshold > completedJobsCount);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" />
          <h2 className="text-lg font-semibold text-slate-900">Customer Loyalty Badges</h2>
        </div>
        <div className="text-sm text-slate-500">
          <span className="font-semibold text-slate-700">{completedJobsCount}</span> verified jobs · <span className="font-semibold text-amber-600">{earned.length}</span>/10 badges
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Badges are awarded when both you and the contractor confirm job completion with a <strong>Satisfactory</strong> or higher rating during closeout.
      </p>

      {earned.length === 0 ? (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-sm text-slate-500">
          No badges yet — close out your first verified job to earn your first badge!
        </div>
      ) : (
        <div className="flex items-center gap-3 mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="text-3xl">{highest.emoji}</span>
          <div>
            <div className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Highest Badge</div>
            <div className="text-base font-bold text-slate-900">{highest.name}</div>
            <div className="text-xs text-slate-500">Tier {highest.tier} · {highest.description}</div>
          </div>
        </div>
      )}

      {next && (
        <div className="mb-4 text-xs text-slate-500 flex items-center gap-2">
          <span>Next badge: <strong>{next.name}</strong> at {next.threshold} jobs</span>
          <div className="flex-1 bg-slate-200 rounded-full h-1.5">
            <div
              className="bg-amber-400 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.round((completedJobsCount / next.threshold) * 100))}%` }}
            />
          </div>
          <span>{completedJobsCount}/{next.threshold}</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {CUSTOMER_BADGE_TIERS.map(badge => (
          <BadgeItem
            key={badge.tier}
            badge={badge}
            earned={completedJobsCount >= badge.threshold}
            completedJobsCount={completedJobsCount}
          />
        ))}
      </div>
    </Card>
  );
}