import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('general');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMsg('');

    // Check for existing subscriber
    const existing = await base44.asServiceRole?.entities
      ? null
      : null; // use public filter below

    try {
      const existing = await base44.entities.NewsletterSubscriber.filter({ email: email.toLowerCase().trim() });

      if (existing && existing.length > 0) {
        if (existing[0].subscribed) {
          setStatus('success'); // already subscribed — treat as success
          return;
        }
        // Re-subscribe
        await base44.entities.NewsletterSubscriber.update(existing[0].id, { subscribed: true, unsubscribed_at: null });
        setStatus('success');
        return;
      }

      await base44.entities.NewsletterSubscriber.create({
        email: email.toLowerCase().trim(),
        name: name.trim() || undefined,
        subscriber_type: type,
        subscribed: true,
      });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <section className="py-14 bg-gradient-to-br from-amber-50 to-orange-50 border-t border-amber-100">
        <div className="max-w-xl mx-auto px-4 text-center">
          <CheckCircle2 className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">You're subscribed!</h2>
          <p className="text-slate-500">Thanks for joining. We'll keep you updated with the latest from SurfCoast.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-14 bg-gradient-to-br from-amber-50 to-orange-50 border-t border-amber-100">
      <div className="max-w-xl mx-auto px-4 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-5">
          <Mail className="w-6 h-6 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Stay in the Loop</h2>
        <p className="text-slate-500 mb-8 text-sm">
          Get updates on new contractors, job opportunities, and platform news — straight to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <input
            type="email"
            required
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="general">I'm just browsing</option>
            <option value="customer">I'm looking to hire contractors</option>
            <option value="contractor">I'm a contractor</option>
          </select>

          {errorMsg && (
            <p className="text-red-500 text-sm">{errorMsg}</p>
          )}

          <Button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-3 rounded-xl text-sm gap-2"
          >
            {status === 'loading' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Subscribing...</>
            ) : (
              <><Mail className="w-4 h-4" /> Subscribe to Newsletter</>
            )}
          </Button>

          <p className="text-xs text-slate-400">
            No spam, ever. You can unsubscribe at any time.
          </p>
        </form>
      </div>
    </section>
  );
}