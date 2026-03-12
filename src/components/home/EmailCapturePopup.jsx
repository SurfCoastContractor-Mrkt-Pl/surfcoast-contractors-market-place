import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Mail, Gift } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EmailCapturePopup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('emailPopupSeen');
    if (hasSeenPopup) {
      setClosed(true);
      return;
    }
    
    // Delay popup by 20 seconds
    const timer = setTimeout(() => {
      setClosed(false);
    }, 20000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    setLoading(true);
    try {
      await base44.entities.NewsletterSubscriber.create({
        email,
        subscriber_type: 'general',
        subscribed: true
      });
      setSubmitted(true);
      sessionStorage.setItem('emailPopupSeen', 'true');
      setTimeout(() => setClosed(true), 2000);
    } catch (error) {
      console.error('Newsletter signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (closed) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 pointer-events-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative pointer-events-auto">
        <button
          onClick={() => {
            setClosed(true);
            sessionStorage.setItem('emailPopupSeen', 'true');
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-6 h-6" />
        </button>

        {!submitted ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <h2 className="text-2xl font-serif font-bold text-slate-900 text-center mb-2">
              Find Vetted Professionals Near You
            </h2>

            <p className="text-center text-slate-600 mb-6">
              Get job alerts from contractors in your area, plus $1.75 credit toward your first quote request.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {loading ? 'Sending...' : 'Get Free Matches'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-start gap-3 text-sm">
                <Gift className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Why Join:</p>
                  <ul className="text-slate-600 mt-2 space-y-1">
                    <li>✓ Job alerts from local contractors</li>
                    <li>✓ $1.75 credit on first quote</li>
                    <li>✓ Verified professionals, trusted reviews</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center mt-6">
              No spam. Unsubscribe anytime.
            </p>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
              Check Your Email!
            </h2>
            <p className="text-slate-600">
              We've sent your 3 personalized matches + free quote code to {email}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}