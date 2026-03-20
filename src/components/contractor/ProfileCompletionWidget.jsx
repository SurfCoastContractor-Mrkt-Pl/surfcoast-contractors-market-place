import React from 'react';
import { CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function getChecklist(contractor) {
  const c = contractor || {};
  const rateOk = c.rate_type === 'fixed'
    ? (c.fixed_rate > 0)
    : (c.hourly_rate > 0);

  const items = [
    { label: 'Profile photo', done: !!c.photo_url },
    { label: 'ID document uploaded', done: !!c.id_document_url },
    { label: 'Identity verified', done: !!c.identity_verified },
    { label: 'Full name', done: !!(c.name?.trim()) },
    { label: 'Phone number', done: !!(c.phone?.trim()) },
    { label: 'Location', done: !!(c.location?.trim()) },
    { label: 'Trade / specialty', done: !!(c.trade_specialty?.trim()) },
    { label: 'Bio (30+ characters)', done: (c.bio?.trim()?.length || 0) >= 30 },
    { label: 'Rate set', done: rateOk },
    { label: 'Bank account (Stripe)', done: !!c.stripe_account_charges_enabled, isStripe: true },
    { label: 'Compliance acknowledged', done: !!c.compliance_acknowledged },
  ];

  if (c.is_licensed_sole_proprietor) {
    items.push(
      { label: 'License number', done: !!(c.license_number?.trim()) },
      { label: 'License verified', done: !!c.license_verified },
    );
  }

  return items;
}

async function handleStripeSetup(contractor) {
  if (!contractor?.id) return;
  try {
    const response = await base44.functions.invoke('createStripeConnectOnboarding', { contractor_id: contractor.id });
    const url = response?.data?.onboardingUrl || response?.data?.loginLink;
    if (url) window.location.href = url;
  } catch (e) {
    console.error('Stripe setup error:', e);
  }
}

export default function ProfileCompletionWidget({ contractor }) {
  const items = getChecklist(contractor);
  const completed = items.filter(i => i.done).length;
  const total = items.length;
  const percent = Math.round((completed / total) * 100);
  const isComplete = completed === total;

  return (
    <div
      className="rounded-xl p-5 space-y-4 sticky top-6"
      style={{ backgroundColor: '#0f1e35', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Profile Completion</h3>
        <span
          className="text-sm font-bold"
          style={{ color: isComplete ? '#4ade80' : '#d4a843' }}
        >
          {percent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            backgroundColor: isComplete ? '#4ade80' : '#d4a843',
          }}
        />
      </div>

      {/* Complete message */}
      {isComplete && (
        <div className="text-center py-1">
          <p className="text-sm font-semibold" style={{ color: '#4ade80' }}>
            Profile Complete 🎉
          </p>
        </div>
      )}

      {/* Checklist */}
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2.5">
            {item.done ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#4ade80' }} />
            ) : (
              <Circle className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />
            )}
            {item.isStripe && !item.done ? (
              <button
                onClick={() => handleStripeSetup(contractor)}
                className="text-xs flex items-center gap-1 underline underline-offset-2"
                style={{ color: '#f59e0b' }}
              >
                Bank account (Stripe)
                <ExternalLink className="w-3 h-3" />
              </button>
            ) : (
              <span
                className="text-xs"
                style={{ color: item.done ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)' }}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* Footer hint */}
      {!isComplete && (
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Complete all items to unlock your free 2-week trial.
        </p>
      )}
    </div>
  );
}