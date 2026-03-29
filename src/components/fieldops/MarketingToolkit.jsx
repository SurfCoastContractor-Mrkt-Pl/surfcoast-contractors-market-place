import React, { useState } from 'react';
import { MessageCircle, Mail, Share2, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useMarketingIntegrations } from '@/hooks/useMarketingIntegrations';

export default function MarketingToolkit({ scope }) {
  const [activeTab, setActiveTab] = useState('sms');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const { sendSMS, sendEmail, shareToSocial, loading, error } = useMarketingIntegrations();

  const handleSendSMS = async () => {
    if (!message.trim() || !scope.customer_email) return;
    try {
      await sendSMS(scope.customer_email, message);
      setSent(true);
      setMessage('');
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      console.error('SMS send failed:', err);
    }
  };

  const handleSendEmail = async () => {
    if (!message.trim()) return;
    try {
      await sendEmail(
        scope.customer_email,
        `Update from ${scope.contractor_name} — ${scope.job_title}`,
        message
      );
      setSent(true);
      setMessage('');
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      console.error('Email send failed:', err);
    }
  };

  const handleSharePhoto = async () => {
    if (!scope.after_photo_urls?.length) return;
    try {
      await shareToSocial('instagram', `Just completed: ${scope.job_title}`, scope.after_photo_urls[0]);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('sms')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === 'sms'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          SMS
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === 'email'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Mail className="w-4 h-4" />
          Email
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === 'social'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Share2 className="w-4 h-4" />
          Social
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {sent && (
        <div className="flex items-center gap-2 mb-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <p className="text-green-300 text-sm">Message sent successfully!</p>
        </div>
      )}

      {(activeTab === 'sms' || activeTab === 'email') && (
        <>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={activeTab === 'sms' ? 'SMS message (160 chars)' : 'Email message'}
            rows={5}
            className="w-full bg-slate-800 text-white rounded-xl p-4 text-base resize-none border border-slate-700 focus:outline-none focus:border-blue-500 placeholder-slate-500 min-h-[120px]"
          />
          <button
            onClick={activeTab === 'sms' ? handleSendSMS : handleSendEmail}
            disabled={!message.trim() || loading}
            className="w-full mt-3 bg-blue-600 disabled:opacity-50 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                {activeTab === 'sms' ? <MessageCircle className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                Send {activeTab === 'sms' ? 'SMS' : 'Email'}
              </>
            )}
          </button>
        </>
      )}

      {activeTab === 'social' && (
        <>
          <p className="text-slate-400 text-sm mb-3">
            {scope.after_photo_urls?.length ? 'Share your best work photo to Instagram' : 'No photos available to share'}
          </p>
          <button
            onClick={handleSharePhoto}
            disabled={!scope.after_photo_urls?.length || loading}
            className="w-full bg-pink-600 disabled:opacity-50 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share to Instagram
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}