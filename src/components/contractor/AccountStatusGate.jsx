import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Lock, AlertTriangle, Clock, Trash2, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * AccountStatusGate
 * Universal real-time account status gate. Renders a full-screen overlay
 * on mobile, tablet, and desktop if the account is locked/suspended/pending-deletion.
 * Allows ONLY messaging through — all other actions are blocked.
 *
 * Usage: Wrap it inside a top-level layout or dashboard with `userEmail` and `userType`.
 */
export default function AccountStatusGate({ userEmail, userType = 'contractor', children }) {
  const [status, setStatus] = useState(null); // null = loading
  const [profile, setProfile] = useState(null);
  const [lockedScope, setLockedScope] = useState(null);

  const loadStatus = async () => {
    // Skip checks if no userEmail (public pages, logged-out users)
    if (!userEmail) {
      setStatus('ok');
      return;
    }
    
    // Skip if userType cannot be determined
    if (userType !== 'contractor' && userType !== 'client') {
      setStatus('ok');
      return;
    }

    try {
      let profiles = [];
      if (userType === 'contractor') {
        profiles = await base44.entities.Contractor.filter({ email: userEmail });
      } else {
        profiles = await base44.entities.CustomerProfile.filter({ email: userEmail });
      }

      if (!profiles?.length) {
        setStatus('ok');
        return;
      }

      const p = profiles[0];
      setProfile(p);

      // Determine lock state
      if (p.account_deletion_initiated) {
        setStatus('deletion_pending');
      } else if (p.account_locked_for_overdue_job) {
        setStatus('overdue_locked');
        if (p.locked_scope_id) {
          const scopes = await base44.entities.ScopeOfWork.filter({ id: p.locked_scope_id });
          if (scopes?.length) setLockedScope(scopes[0]);
        }
      } else if (p.account_locked) {
        setStatus('photo_locked');
        if (p.locked_scope_id) {
          const scopes = await base44.entities.ScopeOfWork.filter({ id: p.locked_scope_id });
          if (scopes?.length) setLockedScope(scopes[0]);
        }
      } else if (p.rating_block_active) {
        setStatus('rating_blocked');
      } else {
        setStatus('ok');
      }
    } catch (err) {
      console.error('[AccountStatusGate] Error loading status:', err);
      setStatus('ok');
    }
  };

  useEffect(() => {
    loadStatus();

    // Real-time subscription — any update to this contractor/client reflects instantly
    let unsubscribe;
    if (userType === 'contractor') {
      unsubscribe = base44.entities.Contractor.subscribe(() => loadStatus());
    } else {
      unsubscribe = base44.entities.CustomerProfile.subscribe(() => loadStatus());
    }
    return () => unsubscribe?.();
  }, [userEmail, userType]);

  // Loading state — render children while resolving
  if (status === null || status === 'ok') return children;

  // ── Build overlay content by status ────────────────────────────────────────
  const configs = {
    overdue_locked: {
      icon: <Lock className="w-10 h-10 text-red-500" />,
      bg: 'bg-red-50',
      border: 'border-red-300',
      title: 'Account Locked — Overdue Job',
      subtitle: lockedScope
        ? `The job "${lockedScope.job_title}" passed its expected completion date without being closed out.`
        : 'A job passed its completion deadline without being closed out.',
      body: 'Your account is locked on all devices. Complete the job closeout — signatures and payment — through SurfCoast to unlock immediately. You may still reply to existing messages.',
      cta: {
        label: 'Go to Job Closeout',
        href: lockedScope ? `/ProjectManagement?scope=${lockedScope.id}` : '/ProjectManagement',
        color: 'bg-red-600 hover:bg-red-700',
      },
      badge: { label: 'LOCKED — ALL DEVICES', color: 'bg-red-600 text-white' },
    },
    photo_locked: {
      icon: <AlertTriangle className="w-10 h-10 text-orange-500" />,
      bg: 'bg-orange-50',
      border: 'border-orange-300',
      title: 'Account Locked — After Photos Required',
      subtitle: lockedScope
        ? `After photos for "${lockedScope.job_title}" were not uploaded within 72 hours.`
        : 'After photos are overdue for a recent job.',
      body: 'Upload the required after photos to unlock your account across all devices. You may still reply to existing messages.',
      cta: {
        label: 'Upload After Photos',
        href: lockedScope ? `/ProjectManagement?scope=${lockedScope.id}` : '/ProjectManagement',
        color: 'bg-orange-600 hover:bg-orange-700',
      },
      badge: { label: 'LOCKED — ALL DEVICES', color: 'bg-orange-600 text-white' },
    },
    rating_blocked: {
      icon: <Clock className="w-10 h-10 text-yellow-500" />,
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      title: 'Account Restricted — Rating Required',
      subtitle: 'You have a pending rating that must be submitted before continuing.',
      body: 'Submit your rating for the completed job to restore full account access. This applies across all your devices.',
      cta: {
        label: 'Submit Rating Now',
        href: `/ProjectManagement?scope=${profile?.pending_rating_scope_id || ''}`,
        color: 'bg-yellow-600 hover:bg-yellow-700',
      },
      badge: { label: 'RESTRICTED — ALL DEVICES', color: 'bg-yellow-600 text-white' },
    },
    deletion_pending: {
      icon: <Trash2 className="w-10 h-10 text-gray-500" />,
      bg: 'bg-gray-100',
      border: 'border-gray-400',
      title: 'Account Pending Deletion',
      subtitle: 'Your billing cycle ended and the overdue job was never closed out.',
      body: 'Your payment details have been removed and your account is queued for permanent deletion. Contact support immediately if you believe this is an error.',
      cta: {
        label: 'Contact Support',
        href: 'mailto:support@surfcoast.com',
        color: 'bg-gray-700 hover:bg-gray-800',
      },
      badge: { label: 'PENDING DELETION', color: 'bg-gray-700 text-white' },
    },
  };

  const cfg = configs[status];

  return (
    <>
      {/* Background app still renders — but is blocked behind overlay */}
      <div className="pointer-events-none opacity-20 select-none" aria-hidden="true">
        {children}
      </div>

      {/* Full-screen overlay — works on all screen sizes */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div
          className={`w-full max-w-lg rounded-2xl border-2 ${cfg.border} ${cfg.bg} shadow-2xl p-6 md:p-8 space-y-5`}
        >
          {/* Badge */}
          <div className="flex justify-between items-start">
            <span className={`text-xs font-bold px-3 py-1 rounded-full tracking-widest ${cfg.badge.color}`}>
              {cfg.badge.label}
            </span>
            <span className="text-xs text-slate-500">All devices affected</span>
          </div>

          {/* Icon + Title */}
          <div className="flex items-start gap-4">
            <div className="shrink-0">{cfg.icon}</div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{cfg.title}</h2>
              <p className="text-sm text-slate-600 mt-1">{cfg.subtitle}</p>
            </div>
          </div>

          {/* Body */}
          <p className="text-sm text-slate-700 leading-relaxed border-l-4 border-slate-300 pl-4">
            {cfg.body}
          </p>

          {/* Messaging note */}
          {status !== 'deletion_pending' && (
            <div className="flex items-start gap-2 bg-white/70 border border-slate-200 rounded-xl p-3">
              <MessageSquare className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600">
                <strong>Messaging is still available.</strong> You can reply to existing client messages
                to provide updates, but you cannot accept new jobs until this is resolved.
              </p>
            </div>
          )}

          {/* CTA */}
          <a href={cfg.cta.href}>
            <Button className={`w-full text-white font-bold ${cfg.cta.color}`}>
              {cfg.cta.label}
            </Button>
          </a>

          {/* Timestamp */}
          <p className="text-xs text-center text-slate-400">
            This restriction is applied in real-time across mobile, tablet, and desktop.
          </p>
        </div>
      </div>
    </>
  );
}