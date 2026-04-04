/**
 * OnboardingNudgeBanner — shown to contractors with incomplete profiles.
 * Clearly tells them what's missing and why it matters for getting discovered.
 */
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, CheckCircle2 } from 'lucide-react';

function getIncompleteItems(contractor) {
  const c = contractor || {};
  const missing = [];
  if (!c.photo_url) missing.push('Profile photo');
  if (!c.bio || c.bio.trim().length < 30) missing.push('Bio (30+ characters)');
  if (!c.hourly_rate && !c.fixed_rate) missing.push('Rate');
  if (!c.phone?.trim()) missing.push('Phone number');
  if (!c.stripe_account_charges_enabled) missing.push('Payout account (Stripe)');
  return missing;
}

export default function OnboardingNudgeBanner({ contractor }) {
  if (!contractor) return null;

  const missing = getIncompleteItems(contractor);
  const percent = contractor.profile_completion_percent || 0;

  // Don't show if profile is complete
  if (missing.length === 0 || percent >= 100) return null;

  return (
    <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-amber-900 text-sm mb-1">
            Your profile is {percent}% complete — clients can't fully trust what they can't see
          </p>
          <p className="text-amber-800 text-xs mb-3">
            Complete these items to appear in search results and unlock your full free trial:
          </p>
          <div className="flex flex-wrap gap-2">
            {missing.map(item => (
              <span
                key={item}
                className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <Link
          to="/ContractorBusinessHub"
          className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors flex-shrink-0 mt-0.5"
        >
          Complete Now <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}