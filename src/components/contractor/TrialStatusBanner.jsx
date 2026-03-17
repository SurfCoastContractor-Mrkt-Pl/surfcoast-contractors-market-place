import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, ChevronRight, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function TrialStatusBanner({ contractor }) {
  const [trialData, setTrialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (!contractor?.id) return;
    const fetchTrialStatus = async () => {
      setLoading(true);
      const res = await fetch('https://sage-c5f01224.base44.app/functions/activateTrial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractor_id: contractor.id }),
      });
      const data = await res.json();
      setTrialData(data);
      setLoading(false);
    };
    fetchTrialStatus();
  }, [contractor?.id]);

  const handleActivateTrial = async () => {
    setActivating(true);
    await fetch('https://sage-c5f01224.base44.app/functions/activateTrial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contractor_id: contractor.id }),
    });
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="rounded-xl px-5 py-4 flex items-center gap-3" style={{ backgroundColor: '#1a2535' }}>
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        <span className="text-sm text-slate-400">Checking trial status...</span>
      </div>
    );
  }

  if (!trialData) return null;

  const { trial_already_used, trial_active, profile_complete, missing_labels, days_remaining, trial_ends_at, profile_completion_percent } = trialData;

  // State 1: Trial active
  if (trial_already_used && trial_active) {
    const expiryDate = trial_ends_at ? new Date(trial_ends_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
    return (
      <div className="rounded-xl px-5 py-4 flex items-center justify-between gap-4" style={{ backgroundColor: '#14532d' }}>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: '#d4a843' }} />
          <div>
            <p className="font-semibold text-white text-sm">Free Trial Active — All Access</p>
            {expiryDate && (
              <p className="text-xs text-green-200 mt-0.5">Expires {expiryDate}</p>
            )}
          </div>
        </div>
        {days_remaining != null && (
          <div className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#d4a843', color: '#1a1a1a' }}>
            {days_remaining}d left
          </div>
        )}
      </div>
    );
  }

  // State 2: Trial ended
  if (trial_already_used && !trial_active) {
    return (
      <div className="rounded-xl px-5 py-4" style={{ backgroundColor: '#78350f' }}>
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-300" />
          <div>
            <p className="font-semibold text-white text-sm">Trial ended · Regular profile active</p>
            <p className="text-xs text-amber-200 mt-0.5">3% platform fee on completed, paid jobs only. No monthly fees.</p>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Profile incomplete
  if (!profile_complete) {
    const percent = profile_completion_percent ?? 0;
    return (
      <div className="rounded-xl px-5 py-5 space-y-4" style={{ backgroundColor: '#0f1e35' }}>
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 shrink-0 mt-0.5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#d4a843' }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#d4a843' }} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white text-sm">Complete Your Profile to Unlock Your Free 2-Week Trial</p>
            <p className="text-xs text-slate-400 mt-0.5">{percent}% complete</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-slate-700">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${percent}%`, backgroundColor: '#d4a843' }}
          />
        </div>

        {/* Missing items */}
        {missing_labels?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {missing_labels.map((label, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
                {label}
              </span>
            ))}
          </div>
        )}

        <Link to="/ContractorAccount">
          <Button size="sm" className="gap-1.5 font-semibold" style={{ backgroundColor: '#d4a843', color: '#1a1a1a' }}>
            Continue Building My Profile
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  // State 4: Profile complete, trial not yet activated
  return (
    <div className="rounded-xl px-5 py-4 flex items-center justify-between gap-4" style={{ backgroundColor: '#14532d' }}>
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 shrink-0 text-green-300" />
        <p className="font-semibold text-white text-sm">Profile Complete — You're Ready!</p>
      </div>
      <Button
        size="sm"
        className="shrink-0 font-semibold gap-1.5"
        style={{ backgroundColor: '#d4a843', color: '#1a1a1a' }}
        disabled={activating}
        onClick={handleActivateTrial}
      >
        {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : (
          <>Activate Free Trial <ChevronRight className="w-4 h-4" /></>
        )}
      </Button>
    </div>
  );
}