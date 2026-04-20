/**
 * SendFounderEmailModal — Send personalized founder welcome emails with BCC support
 */
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { AlertCircle, Send, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SendFounderEmailModal({ contractor, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    to: contractor?.email || '',
    subject: `Welcome to SurfCoast CMP, ${contractor?.name || 'Founder'} — you're #1`,
    body: `${contractor?.name || 'Friend'},

You're among the very first people to sign up on SurfCoast Contractors Marketplace. That's not a small thing to me, and I wanted to reach out directly instead of letting an automated note do the talking.

As a founding member, you've locked in one full year of free access to your profile — no subscription fees during that window, regardless of which side of the platform you're on.

One thing to know: your profile isn't fully active yet. To unlock everything your role gives you — posting, proposing, listing, booking, messaging — you'll need to finish the sign-up steps. Once those are complete, your full access kicks in and the year-long clock starts.

If you get stuck anywhere in the process or have a question about how something works, reply straight to this email. It comes to me.

Thanks for betting on something new.

Hector A. Navarrete
Owner/Founder/Developer
SurfCoast Contractors Marketplace`,
    bcc_emails: ['adminnavarreteh@surfcoastcmp.com', 'hexthegreat25@gmail.com']
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'bcc_emails') {
      setFormData(prev => ({
        ...prev,
        bcc_emails: value.split('\n').map(e => e.trim()).filter(e => e)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSend = async () => {
    if (!formData.to || !formData.subject || !formData.body) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await Promise.race([
        base44.functions.invoke('sendFounderWelcomeEmail', formData),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ]);
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.(result);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to send email');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 max-w-md text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Email Sent!</h3>
          <p className="text-slate-600 mb-4">Founder welcome email sent successfully with BCC copies logged.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-50 border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Send Founder Welcome Email</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">To</label>
            <input
              type="email"
              name="to"
              value={formData.to}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Message Body</label>
            <textarea
              name="body"
              value={formData.body}
              onChange={handleChange}
              rows={12}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">BCC Email Addresses (one per line)</label>
            <textarea
              name="bcc_emails"
              value={formData.bcc_emails.join('\n')}
              onChange={handleChange}
              rows={3}
              placeholder="adminnavarreteh@surfcoastcmp.com&#10;hexthegreat25@gmail.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">{formData.bcc_emails.length} BCC email(s) will receive copies</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">Email will be:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Sent to the recipient</li>
                <li>BCC'd to all listed admin emails</li>
                <li>Logged in the Sent Emails entity</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}