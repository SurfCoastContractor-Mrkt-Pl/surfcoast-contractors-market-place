import React, { useState, useEffect } from 'react';
import { X, Mail, Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NewsletterSubscribeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Show modal once per session (using sessionStorage)
  useEffect(() => {
    const shown = sessionStorage.getItem('newsletterModalShown');
    if (!shown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('newsletterModalShown', 'true');
      }, 8000); // Show after 8 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email');
      setLoading(false);
      return;
    }

    try {
      await base44.entities.NewsletterSubscriber.create({
        email: email.trim(),
        subscribed_at: new Date().toISOString(),
        active: true
      });
      setSubmitted(true);
      setTimeout(() => setIsOpen(false), 2000);
    } catch (err) {
      setError('Could not subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            {/* Icon */}
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-amber-600" strokeWidth={1.5} />
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Stay Updated</h2>
            <p className="text-slate-600 text-sm mb-4">
              Get notified about new market listings, vendor spotlights, and upcoming local events. Updates arrive in your inbox.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={loading}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
              />
              {error && <p className="text-red-600 text-xs">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-400 text-white font-semibold py-2.5 rounded-lg transition-colors min-h-[44px]"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>

            {/* Footer Note */}
            <p className="text-xs text-slate-500 text-center mt-4">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4 mx-auto">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">You're all set!</h3>
            <p className="text-sm text-slate-600">
              Check your inbox for the latest updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}