import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Sparkles, LogIn } from 'lucide-react';

/**
 * Auth gate modal shown when a guest tries to use an action requiring an account.
 * Usage: <AuthGateModal open={open} onClose={() => setOpen(false)} />
 */
export default function AuthGateModal({ open, onClose }) {
  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-2xl">
        <div className="bg-slate-900 rounded-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

          <div className="p-8">
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-amber-400" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center mb-3">
              Create Your Free Account to Connect
            </h2>

            {/* Body */}
            <p className="text-slate-300 text-sm text-center leading-relaxed mb-7">
              Browsing is always free. To request quotes, chat with contractors, or book jobs — create a free account. Your 2-week trial starts automatically the moment you sign up. No credit card required.
            </p>

            {/* Primary CTA */}
            <Link to="/CustomerSignup" onClick={onClose}>
              <button className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-3.5 rounded-xl transition-colors text-sm mb-3">
                Sign Up Free →
              </button>
            </Link>

            {/* Secondary CTA */}
            <button
              onClick={handleLogin}
              className="w-full border border-slate-600 hover:border-slate-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Log In
            </button>

            {/* Dismiss */}
            <button
              onClick={onClose}
              className="w-full mt-3 text-xs text-slate-500 hover:text-slate-300 transition-colors py-1"
            >
              Maybe later
            </button>

            {/* Bottom note */}
            <p className="text-center text-xs text-slate-500 mt-4 border-t border-slate-700/60 pt-4">
              Already browsing? Your trial starts the moment you create an account.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}