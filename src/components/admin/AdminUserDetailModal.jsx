import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Mail, User, CheckCircle, Ban, Send, Loader2, Inbox } from 'lucide-react';

const ADMIN_EMAILS = ['adminnavarreteh@surfcoastcmp.com', 'hexthegreat25@gmail.com'];

export default function AdminUserDetailModal({ user, contractors, onClose }) {
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [tab, setTab] = useState('info');
  const [sentEmails, setSentEmails] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(false);

  const contractorProfile = contractors.find(c => c.email === user.email);

  useEffect(() => {
    if (tab === 'sent') {
      setLoadingEmails(true);
      base44.entities.SentEmail.filter({ to_email: user.email }, '-sent_at', 50)
        .then(data => setSentEmails(data || []))
        .finally(() => setLoadingEmails(false));
    }
  }, [tab, user.email]);

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) return;
    setSending(true);

    // Add contact footer to email
    const emailWithFooter = `${emailBody}\n\n---\nIf you need to reach out, please contact us at: adminnavarreteh@surfcoastcmp.com`;

    // Send to recipient
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: emailSubject,
      body: emailWithFooter,
    });

    // BCC admins
    await Promise.all(ADMIN_EMAILS.map(adminEmail =>
      base44.integrations.Core.SendEmail({
        to: adminEmail,
        subject: `[BCC] ${emailSubject}`,
        body: `This is a BCC copy of an email sent to ${user.full_name || user.email} (${user.email}).\n\n---\n\n${emailWithFooter}`,
      })
    ));

    // Log to database
    const currentUser = await base44.auth.me();
    await base44.entities.SentEmail.create({
      to_email: user.email,
      to_name: user.full_name || '',
      subject: emailSubject,
      body: emailWithFooter,
      sent_by: currentUser?.email || 'admin@surfcoastcmp.com',
      sent_at: new Date().toISOString(),
    });

    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setEmailSubject('');
    setEmailBody('');
  };

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-start py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500 font-medium w-36 shrink-0">{label}</span>
      <span className="text-xs text-slate-800 text-right break-all">{value ?? <span className="italic text-slate-400">—</span>}</span>
    </div>
  );

  const tabs = [
    { key: 'info', label: 'Account Info' },
    { key: 'email', label: 'Send Email' },
    { key: 'sent', label: 'Sent Emails' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{user.full_name || 'No name'}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === t.key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {tab === 'info' && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Platform Account</p>
                <InfoRow label="Full Name" value={user.full_name} />
                <InfoRow label="Email" value={user.email} />
                <InfoRow label="Role" value={
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                  }`}>{user.role || 'user'}</span>
                } />
                <InfoRow label="Signed Up" value={new Date(user.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Entrepreneur Profile</p>
                {contractorProfile ? (
                  <>
                    <InfoRow label="Profile Name" value={contractorProfile.name} />
                    <InfoRow label="Line of Work" value={contractorProfile.line_of_work?.replace(/_/g, ' ')} />
                    <InfoRow label="Location" value={contractorProfile.location} />
                    <InfoRow label="Identity Verified" value={contractorProfile.identity_verified ? '✓ Yes' : '✗ No'} />
                    <InfoRow label="Stripe Setup" value={contractorProfile.stripe_account_setup_complete ? '✓ Complete' : '✗ Incomplete'} />
                    <InfoRow label="Account Locked" value={contractorProfile.account_locked ? '🔒 Yes' : '✓ No'} />
                    <InfoRow label="Trial Active" value={contractorProfile.trial_active ? '✓ Yes' : 'No'} />
                    <InfoRow label="Profile Complete" value={contractorProfile.profile_complete ? '✓ Yes' : '✗ No'} />
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic">No entrepreneur profile found — user hasn't completed signup.</p>
                )}
              </div>
            </div>
          )}

          {tab === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">To</label>
                <div className="px-3 py-2 bg-slate-100 rounded-lg text-sm text-slate-600">{user.email}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="Email subject..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Message</label>
                <textarea
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  placeholder="Write your message..."
                  rows={7}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 resize-none"
                />
              </div>
              <p className="text-xs text-slate-400">A BCC copy will be sent to {ADMIN_EMAILS.join(' and ')} and logged in Sent Emails.</p>
              <button
                onClick={handleSendEmail}
                disabled={sending || !emailSubject.trim() || !emailBody.trim()}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : sent ? <CheckCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                {sending ? 'Sending...' : sent ? 'Sent!' : 'Send Email'}
              </button>
            </div>
          )}

          {tab === 'sent' && (
            <div>
              {loadingEmails ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : sentEmails.length === 0 ? (
                <div className="text-center py-12">
                  <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No emails sent to this user yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sentEmails.map(e => (
                    <div key={e.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-semibold text-slate-800">{e.subject}</p>
                        <span className="text-xs text-slate-400 shrink-0 ml-2">
                          {new Date(e.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 whitespace-pre-wrap">{e.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}