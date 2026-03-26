import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Shield, ChevronRight, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { BADGE_TIERS, getHighestBadge, getEarnedBadges } from '@/components/badges/ContractorBadges';

// Field Ops requires at least Tier 3 "Reliable" badge (5 unique customers)
// Tiers 1-2 are locked/greyed out — visible but not accessible
// Top-tier access (Tier 6+) also requires HIS license number

const FIELDOPS_TIERS = [
  {
    tier: 1,
    name: 'Newcomer',
    badgeRequired: 1,
    description: 'First unique customer',
    features: ['View assigned jobs', 'Basic job status'],
    locked: true, // Always locked - just greyed preview
  },
  {
    tier: 2,
    name: 'Rising Star',
    badgeRequired: 3,
    description: '3 unique customers',
    features: ['View assigned jobs', 'Basic job status', 'View schedule'],
    locked: true,
  },
  {
    tier: 3,
    name: 'Reliable',
    badgeRequired: 5,
    description: '5 unique customers',
    features: ['Full job management', 'Schedule view', 'Invoice tracking', 'Photo uploads'],
    unlocksTier: true,
  },
  {
    tier: 4,
    name: 'Skilled Tradesperson',
    badgeRequired: 10,
    description: '10 unique customers',
    features: ['All Tier 3 features', 'Field messaging', 'Completion requests'],
    unlocksTier: true,
  },
  {
    tier: 5,
    name: 'Journeyman Pro',
    badgeRequired: 20,
    description: '20 unique customers',
    features: ['All Tier 4 features', 'Advanced invoicing', 'Priority support'],
    unlocksTier: true,
  },
  {
    tier: 6,
    name: 'Residential Wave Pro',
    badgeRequired: 50,
    description: '50 unique customers + HIS License',
    features: ['All Tier 5 features', 'Residential Wave module', 'Full Field Ops suite'],
    requiresHIS: true,
    unlocksTier: true,
  },
];

function TierCard({ tierDef, uniqueCustomersCount, isUnlocked, isActive, isHISRequired, hasHIS }) {
  const badgeInfo = BADGE_TIERS.find(b => b.tier === tierDef.tier);
  const progress = Math.min(100, Math.round((uniqueCustomersCount / tierDef.badgeRequired) * 100));
  const missingHIS = isHISRequired && !hasHIS;

  return (
    <div className={`rounded-2xl border p-4 transition-all ${
      isActive
        ? 'border-blue-500 bg-blue-900/20'
        : isUnlocked && !missingHIS
        ? 'border-slate-600 bg-slate-800/60'
        : 'border-slate-800 bg-slate-900/40 opacity-50 grayscale'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isUnlocked && !missingHIS ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <Lock className="w-4 h-4 text-slate-600" />
          )}
          <span className={`text-xs font-bold uppercase tracking-wider ${
            isActive ? 'text-blue-400' : isUnlocked ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Badge Tier {tierDef.tier}
          </span>
        </div>
        {isActive && (
          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold">Active</span>
        )}
      </div>

      <p className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-white' : 'text-slate-600'}`}>
        {tierDef.name}
      </p>
      <p className="text-slate-500 text-xs mb-3">{tierDef.description}</p>

      <ul className="space-y-1 mb-3">
        {tierDef.features.map((f, i) => (
          <li key={i} className={`text-xs flex items-center gap-1.5 ${isUnlocked ? 'text-slate-300' : 'text-slate-700'}`}>
            <div className={`w-1 h-1 rounded-full flex-shrink-0 ${isUnlocked ? 'bg-blue-400' : 'bg-slate-700'}`} />
            {f}
          </li>
        ))}
      </ul>

      {isHISRequired && (
        <div className={`text-xs px-2 py-1.5 rounded-lg flex items-center gap-1.5 mb-3 ${
          hasHIS ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
        }`}>
          {hasHIS ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          HIS License: {hasHIS ? 'Verified ✓' : 'Required — add in your profile'}
        </div>
      )}

      {!isUnlocked && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Progress</span>
            <span>{uniqueCustomersCount}/{tierDef.badgeRequired} customers</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full">
            <div
              className="h-1.5 rounded-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function FieldOpsAccessGate({ contractor }) {
  const uniqueCustomersCount = contractor?.unique_customers_count || 0;
  const highestBadge = getHighestBadge(uniqueCustomersCount);
  const highestBadgeTier = highestBadge?.tier || 0;
  const hasHIS = !!contractor?.his_license_number;

  // Minimum badge tier required to access Field Ops at all = Tier 3 (5 unique customers)
  const MIN_BADGE_TIER = 3;
  const hasAccess = highestBadgeTier >= MIN_BADGE_TIER;
  const nextRequired = BADGE_TIERS.find(b => b.threshold > uniqueCustomersCount);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
          <Shield className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-white text-2xl font-bold mb-2">Field Ops</h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
          Field Ops is an optional service available as you grow on the SurfCoast platform.
          Earn badges by completing verified jobs to unlock access.
        </p>
      </div>

      {/* Current Badge Status */}
      <div className={`rounded-2xl border p-4 mb-6 ${
        hasAccess ? 'border-green-700 bg-green-900/20' : 'border-slate-700 bg-slate-900'
      }`}>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Your Progress</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-lg">
              {highestBadge ? highestBadge.name : 'No Badge Yet'}
            </p>
            <p className="text-slate-400 text-sm">
              {uniqueCustomersCount} unique customer{uniqueCustomersCount !== 1 ? 's' : ''} verified
            </p>
          </div>
          {hasAccess
            ? <CheckCircle className="w-8 h-8 text-green-400" />
            : <Lock className="w-8 h-8 text-slate-600" />
          }
        </div>

        {!hasAccess && nextRequired && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Next: <span className="text-slate-300">{nextRequired.name}</span></span>
              <span>{uniqueCustomersCount}/{nextRequired.threshold}</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{ width: `${Math.min(100, Math.round((uniqueCustomersCount / nextRequired.threshold) * 100))}%` }}
              />
            </div>
            <p className="text-xs text-yellow-400 mt-2">
              Field Ops unlocks at Badge Tier 3 — need {Math.max(0, 5 - uniqueCustomersCount)} more verified customer{5 - uniqueCustomersCount !== 1 ? 's' : ''}.
            </p>
          </div>
        )}
      </div>

      {/* Tier Cards */}
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Available Tiers</p>
      <div className="grid grid-cols-1 gap-3 mb-8">
        {FIELDOPS_TIERS.map(tierDef => {
          const isUnlocked = highestBadgeTier >= tierDef.tier;
          const isActive = highestBadgeTier === tierDef.tier;
          const isHISRequired = !!tierDef.requiresHIS;
          return (
            <TierCard
              key={tierDef.tier}
              tierDef={tierDef}
              uniqueCustomersCount={uniqueCustomersCount}
              isUnlocked={isUnlocked}
              isActive={isActive}
              isHISRequired={isHISRequired}
              hasHIS={hasHIS}
            />
          );
        })}
      </div>

      {/* CTA */}
      <div className="space-y-3">
        {!hasAccess && (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 text-center">
            <p className="text-slate-300 text-sm font-semibold mb-1">Keep working, keep growing!</p>
            <p className="text-slate-500 text-xs">
              Complete verified jobs with satisfied customers to earn badges and unlock Field Ops.
            </p>
          </div>
        )}
        <Link to="/" className="block text-center text-slate-500 text-sm py-2 hover:text-white">
          ← Back to SurfCoast Platform
        </Link>
      </div>
    </div>
  );
}