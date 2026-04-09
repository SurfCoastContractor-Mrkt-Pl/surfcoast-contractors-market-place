import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, MessageSquare } from 'lucide-react';

export default function RealtimeProjectMessages({ scopeId, userEmail, userName, userType }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  // Initial load
  useEffect(() => {
    if (!scopeId) return;
    base44.entities.ProjectMessage.filter({ scope_id: scopeId })
      .then(msgs => {
        setMessages((msgs || []).sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
        setLoading(false);
      });
  }, [scopeId]);

  // Real-time subscription
  useEffect(() => {
    if (!scopeId) return;
    const unsubscribe = base44.entities.ProjectMessage.subscribe((event) => {
      if (event.data?.scope_id !== scopeId) return;
      if (event.type === 'create') {
        setMessages(prev => {
          const exists = prev.find(m => m.id === event.id);
          if (exists) return prev;
          return [...prev, event.data].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        });
      }
    });
    return unsubscribe;
  }, [scopeId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark unread as read
  useEffect(() => {
    if (!userEmail || !messages.length) return;
    messages
      .filter(m => !m.read && m.sender_email !== userEmail)
      .forEach(m => base44.entities.ProjectMessage.update(m.id, { read: true }).catch(() => {}));
  }, [messages, userEmail]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    const text = newMessage.trim();
    setNewMessage('');
    await base44.entities.ProjectMessage.create({
      scope_id: scopeId,
      sender_email: userEmail,
      sender_name: userName,
      sender_type: userType,
      message: text,
    });
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-slate-400 text-sm">
        <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin mr-2" />
        Loading messages...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[300px]">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-semibold text-slate-700">Project Messages</span>
        <span className="ml-auto text-xs text-green-500 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
          Live
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-3 max-h-64 pr-1">
        {messages.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-6">No messages yet. Start the conversation.</p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender_email === userEmail;
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                isOwn
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-800'
              }`}>
                {!isOwn && (
                  <p className="text-xs font-semibold mb-0.5 opacity-60">{msg.sender_name}</p>
                )}
                <p className="text-sm leading-snug">{msg.message}</p>
                <p className={`text-[10px] mt-1 ${isOwn ? 'text-blue-200' : 'text-slate-400'}`}>
                  {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-slate-100 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl px-3 py-2 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}