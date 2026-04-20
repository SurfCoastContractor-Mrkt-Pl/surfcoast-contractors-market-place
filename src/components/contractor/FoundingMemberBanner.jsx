/**
 * FoundingMemberBanner — Prominent celebration of founding member status & one-year free access
 * Displays with high visual impact on contractor dashboards and key pages
 */
import { Sparkles, Trophy, Clock, CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';

export default function FoundingMemberBanner({ contractor, onDismiss }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !contractor) return null;

  const isFoundingMember = contractor?.is_founding_member === true;
  const profileComplete = contractor?.profile_complete === true;

  // Show banner only for founding members with complete profiles
  if (!isFoundingMember || !profileComplete) return null;

  const expiryDate = contractor.trial_ends_at
    ? new Date(contractor.trial_ends_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'TBD';

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 p-0.5 mb-6 shadow-2xl">
      {/* Animated background glow */}
      <div className="absolute inset-0 opacity-30 blur-xl">
        <div className="absolute w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      {/* Content container */}
      <div className="relative bg-slate-900 rounded-xl p-6 md:p-8">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 md:gap-6">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-400 drop-shadow-lg" />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-cyan-300" />
              <h2 className="text-xl md:text-2xl font-black text-white">
                Welcome to the Founding Member Circle!
              </h2>
            </div>

            <p className="text-slate-200 text-sm md:text-base mb-4 leading-relaxed">
              Your profile is complete. You've unlocked <span className="font-bold text-cyan-300">1 full year of premium all-access</span> to SurfCoast—completely free.
            </p>

            {/* Benefits grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">All features unlocked</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">Zero subscription fees</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">Priority support</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">Early feature access</span>
              </div>
            </div>

            {/* Expiry info */}
            <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 rounded-lg px-4 py-2 mb-4">
              <Clock className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span className="text-amber-100 text-sm">
                <span className="font-bold">Your founding year expires:</span> {expiryDate}
              </span>
            </div>

            {/* CTA */}
            <div className="flex flex-col md:flex-row gap-3">
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                <Sparkles className="w-4 h-4" />
                Start Exploring
              </a>
              <a
                href="/ContractorAccount"
                className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-all"
              >
                View Account
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}