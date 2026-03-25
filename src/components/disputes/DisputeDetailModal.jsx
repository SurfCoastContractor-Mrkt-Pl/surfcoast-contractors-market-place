import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Send, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function DisputeDetailModal({ dispute, user, isAdmin, onClose, onUpdate }) {
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['dispute-messages', dispute.id],
    queryFn: async () => {
      const msgs = await base44.entities.DisputeMessage.filter({ dispute_id: dispute.id });
      return (msgs || []).sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));
    },
  });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setSendingMessage(true);
    try {
      await base44.entities.DisputeMessage.create({
        dispute_id: dispute.id,
        sender_email: user.email,
        sender_name: user.full_name,
        sender_type: isAdmin ? 'admin' : (user.email === dispute.initiator_email ? 'initiator' : 'respondent'),
        message: messageText,
        is_admin_note: false,
        sent_at: new Date().toISOString(),
      });
      setMessageText('');
      refetchMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
      <div style={{ background: '#0a1628', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="text-xl font-bold text-white">{dispute.title}</h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {dispute.dispute_number} • Status: <span style={{ color: dispute.status === 'open' ? '#fbbf24' : '#4ade80' }}>{dispute.status}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Original Dispute */}
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}>
            <p className="text-sm font-medium text-white mb-2">{dispute.initiator_name}'s Issue</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{dispute.description}</p>
            {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {dispute.evidence_urls.map((url, idx) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs underline">
                    Evidence {idx + 1}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          {messages.length > 0 && (
            <div className="space-y-3">
              {messages.map(msg => (
                <div key={msg.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}>
                  <p className="text-sm font-medium text-white">{msg.sender_name} {msg.sender_type === 'admin' ? '(Admin)' : ''}</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{new Date(msg.sent_at).toLocaleString()}</p>
                  <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.7)' }}>{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Input */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Add a message..."
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 12px', color: '#fff', flex: 1 }}
              className="text-sm"
            />
            <button
              type="submit"
              disabled={!messageText.trim() || sendingMessage}
              style={{ background: '#1d6fa4', color: '#fff', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}