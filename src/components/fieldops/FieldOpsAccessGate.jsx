import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Waves, ChevronRight, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { BADGE_TIERS, getHighestBadge } from '@/components/badges/ContractorBadges';

// SurfCoast-Waves tier system
// Each tier is a "wave" progressing toward the highest
// Thresholds based on completed_jobs_count to help new entrepreneurs get comfortable with the system
const SURFCOAST_WAVES = [
  {
    id: 'ripple',
    wave: 1,
    name: 'Ripple',
    label: 'SurfCoast Ripple',
    badgeTierRequired: 1,
    jobsRequired: 15,
    color: '#64748b',
    glowColor: 'rgba(100,116,139,0.3)',
    borderClass: 'border-slate-600',
    bgClass: 'bg-slate-800/40',
    emoji: '〰️',
    description: 'Your first step into the platform',
    features: ['View assigned jobs', 'Basic job status updates', 'Customer contact info'],
  },
  {
    id: 'swell',
    wave: 2,
    name: 'Swell',
    label: 'SurfCoast Swell',
    badgeTierRequired: 2,
    jobsRequired: 35,
    color: '#0ea5e9',
    glowColor: 'rgba(14,165,233,0.25)',
    borderClass: 'border-sky-600',
    bgClass: 'bg-sky-900/20',
    emoji: '🌊',
    description: 'Building momentum with your clients',
    features: ['All Ripple features', 'Schedule & calendar view', 'Job photo uploads', 'Invoice tracking'],
  },
  {
    id: 'breaker',
    wave: 3,
    name: 'Breaker',
    label: 'SurfCoast Breaker',
    badgeTierRequired: 3,
    jobsRequired: 55,
    color: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.3)',
    borderClass: 'border-blue-500',
    bgClass: 'bg-blue-900/20',
    emoji: '🏄',
    description: 'Full Field Ops access unlocked',
    features: ['All Swell features', 'Full job management', 'Completion requests', 'Field messaging', 'Advanced invoicing'],
    isFieldOpsUnlock: true, // This is the minimum for Field Ops
  },
  {
    id: 'pipeline',
    wave: 4,
    name: 'Pipeline',
    label: 'SurfCoast Pipeline',
    badgeTierRequired: 5,
    jobsRequired: 75,
    color: '#6366f1',
    glowColor: 'rgba(99,102,241,0.3)',
    borderClass: 'border-indigo-500',
    bgClass: 'bg-indigo-900/20',
    emoji: '🌀',
    description: 'Elite contractor status achieved',
    features: ['All Breaker features', 'Priority support', 'Advanced analytics', 'Project milestones'],
  },
  {
    id: 'residential_wave',
    wave: 5,
    name: 'Residential Wave',
    label: 'Residential Wave Rider',
    badgeTierRequired: 6,
    jobsRequired: 100,
    color: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.35)',
    borderClass: 'border-amber-500',
    bgClass: 'bg-amber-900/20',
    emoji: '🏆',
    description: 'Top tier — HIS licensed professionals only',
    features: ['All Pipeline features', 'Residential Wave module', 'Licensed contractor tools', 'Full Field Ops suite'],
    requiresHIS: true,
  },
];

function WaveCard({ waveDef, completedJobsCount, isUnlocked, isCurrentWave, hasHIS }) {
  const progress = Math.min(100, Math.round((completedJobsCount / waveDef.jobsRequired) * 100));
  const missingHIS = waveDef.requiresHIS && !hasHIS;
  const fullyUnlocked = isUnlocked && !missingHIS;

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        isCurrentWave && fullyUnlocked
          ? `${waveDef.borderClass} ${waveDef.bgClass}`
          : fullyUnlocked
          ? 'border-slate-600 bg-slate-800/50'
          : 'border-slate-800 bg-slate-900/30 opacity-40 grayscale'
      }`}
      style={isCurrentWave && fullyUnlocked ? { boxShadow: `0 0 20px ${waveDef.glowColor}` } : {}}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{waveDef.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <p className={`font-bold text-sm ${fullyUnlocked ? 'text-white' : 'text-slate-600'}`}>
                {waveDef.label}
              </p>
              {isCurrentWave && fullyUnlocked && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: waveDef.color, color: '#fff' }}>
                  YOUR WAVE
                </span>
              )}
              {waveDef.isFieldOpsUnlock && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-700 text-blue-100">
                  FIELD OPS UNLOCK
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">{waveDef.description}</p>
          </div>
        </div>
        {fullyUnlocked
          ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
          : <Lock className="w-4 h-4 text-slate-700 flex-shrink-0 mt-0.5" />
        }
      </div>

      <ul className="space-y-1 mb-3 mt-3">
        {waveDef.features.map((f, i) => (
          <li key={i} className={`text-xs flex items-center gap-1.5 ${fullyUnlocked ? 'text-slate-300' : 'text-slate-700'}`}>
            <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: fullyUnlocked ? waveDef.color : '#334155' }} />
            {f}
          </li>
        ))}
      </ul>

      {waveDef.requiresHIS && (
        <div className={`text-xs px-2 py-1.5 rounded-lg flex items-center gap-1.5 mb-3 ${
          hasHIS ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-500'
        }`}>
          {hasHIS ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          HIS License: {hasHIS ? 'Verified ✓' : 'Required — add via your profile'}
        </div>
      )}

      {!isUnlocked && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-slate-700 mb-1">
            <span>{completedJobsCount}/{waveDef.jobsRequired} jobs</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%`, background: waveDef.color }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function FieldOpsAccessGate({ contractor }) {
  const completedJobsCount = contractor?.completed_jobs_count || 0;
  const highestBadge = getHighestBadge(contractor?.unique_customers_count || 0);
  const highestBadgeTier = highestBadge?.tier || 0;
  const hasHIS = !!contractor?.his_license_verified;

  // Determine current wave based on completed jobs
  const unlockedWaves = SURFCOAST_WAVES.filter(w => completedJobsCount >= w.jobsRequired);
  const currentWave = unlockedWaves.length > 0 ? unlockedWaves[unlockedWaves.length - 1] : null;
  const nextWave = SURFCOAST_WAVES.find(w => completedJobsCount < w.jobsRequired);

  // Field Ops requires Breaker (wave 3 = 55 completed jobs)
  const BREAKER_WAVE = SURFCOAST_WAVES.find(w => w.id === 'breaker');
  const toBreaker = Math.max(0, BREAKER_WAVE.jobsRequired - completedJobsCount);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col px-4 py-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-800"
          style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)' }}>
          <Waves className="w-8 h-8 text-blue-400" />
        </div>
        <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">SurfCoast Waves</p>
        <h1 className="text-white text-2xl font-bold mb-2">SurfCoast Waves FO</h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
          Field Ops grows with you. Earn your waves by completing verified jobs and building your reputation on SurfCoast.
        </p>
      </div>

      {/* Current Wave Status */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 mb-6">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Your Current Wave</p>
        {currentWave ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentWave.emoji}</span>
            <div className="flex-1">
              <p className="text-white font-bold">{currentWave.label}</p>
              <p className="text-slate-400 text-xs">{completedJobsCount} completed jobs · Wave {currentWave.wave}</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: currentWave.color }}>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌅</span>
            <div>
              <p className="text-white font-bold">No Wave Yet</p>
              <p className="text-slate-400 text-xs">Complete 15 jobs to unlock SurfCoast Waves FO</p>
            </div>
          </div>
        )}

        {/* Progress to Field Ops unlock */}
        {toBreaker > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="text-xs text-yellow-400 mb-2 font-semibold">
              🏄 Field Ops unlocks at <strong>SurfCoast Breaker</strong> — {toBreaker} more job{toBreaker !== 1 ? 's' : ''} needed
            </p>
            <div className="w-full h-2 bg-slate-800 rounded-full">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all"
                style={{ width: `${Math.min(100, Math.round((completedJobsCount / BREAKER_WAVE.jobsRequired) * 100))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Wave Tiers */}
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">The Waves</p>
      <div className="space-y-3 mb-8">
        {SURFCOAST_WAVES.map(waveDef => {
          const isUnlocked = completedJobsCount >= waveDef.jobsRequired;
          const isCurrentWave = currentWave?.id === waveDef.id;
          return (
            <WaveCard
              key={waveDef.id}
              waveDef={waveDef}
              completedJobsCount={completedJobsCount}
              isUnlocked={isUnlocked}
              isCurrentWave={isCurrentWave}
              hasHIS={hasHIS}
            />
          );
        })}
      </div>

      <Link to="/" className="block text-center text-slate-500 text-sm py-2 hover:text-white transition-colors">
        ← Back to SurfCoast Platform
      </Link>
      <Link to="/adminfieldops" className="block text-center text-slate-700 text-xs py-2 hover:text-slate-400 transition-colors mt-1">
        Admin Field Ops →
      </Link>
    </div>
  );
}