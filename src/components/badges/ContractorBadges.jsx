import React from 'react';
import { Card } from '@/components/ui/card';
import { Shield, Hammer, Star, Wrench, Award, Briefcase, Zap, Crown, Trophy, HardHat } from 'lucide-react';

export const BADGE_TIERS = [
  {
    tier: 1,
    name: 'Newcomer',
    threshold: 1,
    description: 'Completed first verified job',
    iconColor: '#78716c',
    metalGradient: ['#a8a29e', '#78716c', '#57534e'],
    borderColor: '#a8a29e',
    bgColor: '#fafaf9',
    textColor: '#44403c',
    labelColor: '#78716c',
    icon: HardHat,
  },
  {
    tier: 2,
    name: 'Rising Star',
    threshold: 3,
    description: 'Completed 3 verified jobs',
    iconColor: '#b45309',
    metalGradient: ['#d97706', '#b45309', '#92400e'],
    borderColor: '#d97706',
    bgColor: '#fffbeb',
    textColor: '#451a03',
    labelColor: '#b45309',
    icon: Star,
  },
  {
    tier: 3,
    name: 'Reliable',
    threshold: 5,
    description: 'Completed 5 verified jobs',
    iconColor: '#b45309',
    metalGradient: ['#f59e0b', '#d97706', '#b45309'],
    borderColor: '#f59e0b',
    bgColor: '#fffbeb',
    textColor: '#451a03',
    labelColor: '#d97706',
    icon: Hammer,
  },
  {
    tier: 4,
    name: 'Skilled Tradesperson',
    threshold: 10,
    description: 'Completed 10 verified jobs',
    iconColor: '#15803d',
    metalGradient: ['#22c55e', '#16a34a', '#15803d'],
    borderColor: '#22c55e',
    bgColor: '#f0fdf4',
    textColor: '#14532d',
    labelColor: '#16a34a',
    icon: Wrench,
  },
  {
    tier: 5,
    name: 'Journeyman',
    threshold: 20,
    description: 'Completed 20 verified jobs',
    iconColor: '#0f766e',
    metalGradient: ['#14b8a6', '#0d9488', '#0f766e'],
    borderColor: '#14b8a6',
    bgColor: '#f0fdfa',
    textColor: '#134e4a',
    labelColor: '#0d9488',
    icon: Briefcase,
  },
  {
    tier: 6,
    name: 'Experienced Pro',
    threshold: 50,
    description: 'Completed 50 verified jobs',
    iconColor: '#1d4ed8',
    metalGradient: ['#3b82f6', '#2563eb', '#1d4ed8'],
    borderColor: '#3b82f6',
    bgColor: '#eff6ff',
    textColor: '#1e3a8a',
    labelColor: '#2563eb',
    icon: Award,
  },
  {
    tier: 7,
    name: 'Expert',
    threshold: 100,
    description: 'Completed 100 verified jobs',
    iconColor: '#6d28d9',
    metalGradient: ['#8b5cf6', '#7c3aed', '#6d28d9'],
    borderColor: '#8b5cf6',
    bgColor: '#f5f3ff',
    textColor: '#3b0764',
    labelColor: '#7c3aed',
    icon: Zap,
  },
  {
    tier: 8,
    name: 'Master Craftsman',
    threshold: 150,
    description: 'Completed 150 verified jobs',
    iconColor: '#7e22ce',
    metalGradient: ['#a855f7', '#9333ea', '#7e22ce'],
    borderColor: '#a855f7',
    bgColor: '#faf5ff',
    textColor: '#3b0764',
    labelColor: '#9333ea',
    icon: Shield,
  },
  {
    tier: 9,
    name: 'Elite Contractor',
    threshold: 200,
    description: 'Completed 200 verified jobs',
    iconColor: '#be123c',
    metalGradient: ['#f43f5e', '#e11d48', '#be123c'],
    borderColor: '#f43f5e',
    bgColor: '#fff1f2',
    textColor: '#4c0519',
    labelColor: '#e11d48',
    icon: Trophy,
  },
  {
    tier: 10,
    name: 'SurfCoast Legend',
    threshold: 300,
    description: 'Completed 300 verified jobs on SurfCoast',
    iconColor: '#92400e',
    metalGradient: ['#fbbf24', '#f59e0b', '#d97706', '#b45309'],
    borderColor: '#f59e0b',
    bgColor: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
    textColor: '#451a03',
    labelColor: '#b45309',
    icon: Crown,
    isLegend: true,
  },
];

export function getEarnedBadges(completedJobsCount = 0) {
  return BADGE_TIERS.filter(b => completedJobsCount >= b.threshold);
}

export function getHighestBadge(completedJobsCount = 0) {
  const earned = getEarnedBadges(completedJobsCount);
  return earned.length > 0 ? earned[earned.length - 1] : null;
}

function BadgeIcon({ badge, size = 56, earned = true }) {
  const Icon = badge.icon;
  const [c1, c2, c3] = badge.metalGradient;
  const gradId = `grad-c-${badge.tier}`;

  if (badge.isLegend) {
    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, #fbbf24, #f59e0b, #d97706, #fbbf24)',
            padding: 2,
            borderRadius: '50%',
            boxShadow: earned ? '0 0 16px 4px rgba(251,191,36,0.5)' : 'none',
          }}
        />
        <div
          className="relative z-10 rounded-full overflow-hidden flex items-center justify-center"
          style={{
            width: size - 6,
            height: size - 6,
            background: 'linear-gradient(145deg, #fef3c7, #fbbf24, #d97706)',
          }}
        >
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a61a047827463e7cdbc1eb/1984e69ad_IMG_8260.jpeg"
            alt="SurfCoast Legend"
            style={{ width: size - 12, height: size - 12, objectFit: 'contain', borderRadius: '50%' }}
          />
        </div>
      </div>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="50%" stopColor={c2} />
          <stop offset="100%" stopColor={c3} />
        </linearGradient>
      </defs>
      {/* Shield shape */}
      <path
        d="M28 4 L48 12 L48 28 C48 40 38 50 28 52 C18 50 8 40 8 28 L8 12 Z"
        fill={`url(#${gradId})`}
        opacity={earned ? 1 : 0.4}
      />
      {/* Inner lighter highlight */}
      <path
        d="M28 9 L43 15.5 L43 28 C43 37.5 36.5 46 28 47.5 C19.5 46 13 37.5 13 28 L13 15.5 Z"
        fill="rgba(255,255,255,0.15)"
      />
      {/* Icon rendered as foreignObject substitute — use text-based icon */}
      <foreignObject x="16" y="16" width="24" height="24">
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <Icon size={20} color="rgba(255,255,255,0.95)" strokeWidth={2} />
        </div>
      </foreignObject>
    </svg>
  );
}

function BadgeItem({ badge, earned, completedJobsCount }) {
  const progress = !earned
    ? Math.min(100, Math.round((completedJobsCount / badge.threshold) * 100))
    : 100;

  const isLegend = badge.isLegend;

  return (
    <div
      className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
        earned ? 'shadow-md' : 'opacity-45 grayscale'
      } ${isLegend && earned ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}`}
      style={{
        borderColor: earned ? badge.borderColor : '#e2e8f0',
        backgroundColor: earned ? (isLegend ? '#fffbeb' : badge.bgColor) : '#f8fafc',
      }}
    >
      {earned && (
        <div
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
          style={{ background: '#16a34a' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      )}

      <BadgeIcon badge={badge} size={52} earned={earned} />

      <div className="text-center">
        <div className="text-xs font-bold" style={{ color: earned ? badge.labelColor : '#94a3b8' }}>
          TIER {badge.tier}
        </div>
        <div className="text-xs font-semibold mt-0.5" style={{ color: earned ? '#1e293b' : '#94a3b8', lineHeight: '1.3' }}>
          {badge.name}
        </div>
        <div className="text-xs mt-0.5" style={{ color: '#94a3b8', fontSize: '10px', lineHeight: '1.3' }}>
          {badge.description}
        </div>
      </div>

      {!earned && (
        <div className="w-full rounded-full h-1 mt-0.5" style={{ background: '#e2e8f0' }}>
          <div
            className="h-1 rounded-full"
            style={{ width: `${progress}%`, background: badge.metalGradient[0] }}
          />
        </div>
      )}
    </div>
  );
}

export default function ContractorBadges({ completedJobsCount = 0, compact = false }) {
  const earned = getEarnedBadges(completedJobsCount);
  const highest = getHighestBadge(completedJobsCount);
  const next = BADGE_TIERS.find(b => b.threshold > completedJobsCount);

  if (compact) {
    if (!highest) return null;
    const Icon = highest.icon;
    return (
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-semibold text-xs"
        style={{ borderColor: highest.borderColor, backgroundColor: highest.bgColor, color: highest.labelColor }}
      >
        <Icon size={12} strokeWidth={2.5} />
        {highest.name}
        <span className="text-slate-400 font-normal">· Tier {highest.tier}</span>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-slate-900">Contractor Achievement Badges</h2>
        </div>
        <div className="text-sm text-slate-500">
          <span className="font-semibold text-slate-700">{completedJobsCount}</span> verified jobs ·{' '}
          <span className="font-semibold text-amber-600">{earned.length}</span>/10 badges
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Badges are awarded when both you and the customer confirm job completion with a <strong>Satisfactory</strong> or higher rating during closeout.
      </p>

      {earned.length === 0 ? (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-sm text-slate-500">
          No badges yet — close out your first verified job to earn your first badge!
        </div>
      ) : (
        <div
          className="flex items-center gap-3 mb-5 p-4 rounded-xl border"
          style={{
            borderColor: highest.borderColor,
            background: highest.isLegend
              ? 'linear-gradient(135deg, #fffbeb, #fef3c7)'
              : highest.bgColor,
          }}
        >
          <BadgeIcon badge={highest} size={48} earned={true} />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: highest.labelColor }}>
              Highest Badge
            </div>
            <div className="text-base font-bold text-slate-900">{highest.name}</div>
            <div className="text-xs text-slate-500">Tier {highest.tier} · {highest.description}</div>
          </div>
        </div>
      )}

      {next && (
        <div className="mb-5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Next: <strong className="text-slate-700">{next.name}</strong></span>
            <span className="font-medium">{completedJobsCount}/{next.threshold} jobs</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(100, Math.round((completedJobsCount / next.threshold) * 100))}%`,
                background: next.metalGradient[0],
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {BADGE_TIERS.map(badge => (
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