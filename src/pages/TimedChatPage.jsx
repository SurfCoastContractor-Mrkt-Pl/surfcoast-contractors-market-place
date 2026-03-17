import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Clock, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const REDACT_URL = 'https://sage-c5f01224.base44.app/functions/redactMessage';
const MAX_SECONDS = 600; // 10 minutes
const INACTIVITY_PAUSE_SECONDS = 60;

async function redactMessage(text) {
  try {
    const res = await fetch(REDACT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    if (!res.ok) return { message: text, was_redacted: false };
    const data = await res.json();
    return { message: data.message ?? text, was_redacted: data.was_redacted ?? false };
  } catch {
    return { message: text, was_redacted: false };
  }
}

function formatTime(seconds) {
  const remaining = Math.max(0, MAX_SECONDS - seconds);
  const m = Math.floor(remaining / 60).toString().padStart(2, '0');
  const s = (remaining % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function TimedChatPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const [userType, setUserType] = useState(null);
  const [userName, setUserName] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [redactNotice, setRedactNotice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);
  const syncRef = useRef(null);
  const secondsUsedRef = useRef(0);
  const lastActivityRef = useRef(null);

  // Load session + user
  useEffect(() => {
    const init = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          base44.auth.redirectToLogin(`/timed-chat/${sessionId}`);
          return;
        }
        setUserEmail(user.email);
        setUserName(user.full_name);

        const contractors = await base44.entities.Contractor.filter({ email: user.email });
        const isContractor = contractors?.length > 0;
        setUserType(isContractor ? 'contractor' : 'customer');

        const sessions = await base44.entities.TimedChatSession.filter({ id: sessionId });
        const s = sessions?.[0];
        if (!s) { setError('Session not found.'); return; }
        if (s.customer_email !== user.email && s.contractor_email !== user.email) {
          setError('You are not a participant in this session.');
          return;
        }
        setSession(s);
        secondsUsedRef.current = s.total_seconds_used || 0;
        lastActivityRef.current = s.last_activity_at ? new Date(s.last_activity_at) : null;

        // Load messages
        const msgs = await base44.entities.TimedChatMessage.filter({ session_id: sessionId });
        setMessages(msgs?.sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at)) || []);
      } catch (err) {
        setError('Failed to load session: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [sessionId]);

  // Real-time message subscription
  useEffect(() => {
    if (!sessionId) return;
    const unsub = base44.entities.TimedChatMessage.subscribe((event) => {
      if (event.data?.session_id !== sessionId) return;
      if (event.type === 'create') {
        setMessages(prev => {
          if (prev.find(m => m.id === event.id)) return prev;
          const updated = [...prev, event.data].sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));
          return updated;
        });
        lastActivityRef.current = new Date();
      }
    });
    return unsub;
  }, [sessionId]);

  // Timer tick — only counts when last message < 60s ago
  useEffect(() => {
    if (!session || session.status === 'expired') return;

    timerRef.current = setInterval(() => {
      if (!lastActivityRef.current) return;
      const secsSinceActivity = (Date.now() - lastActivityRef.current.getTime()) / 1000;
      if (secsSinceActivity < INACTIVITY_PAUSE_SECONDS) {
        secondsUsedRef.current = Math.min(MAX_SECONDS, secondsUsedRef.current + 1);
        setSession(prev => prev ? { ...prev, total_seconds_used: secondsUsedRef.current } : prev);

        if (secondsUsedRef.current >= MAX_SECONDS) {
          clearInterval(timerRef.current);
          expireSession();
        }
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [session?.id, session?.status]);

  // Sync total_seconds_used to DB every 10 seconds
  useEffect(() => {
    if (!session || session.status === 'expired') return;
    syncRef.current = setInterval(async () => {
      try {
        await base44.entities.TimedChatSession.update(sessionId, {
          total_seconds_used: secondsUsedRef.current,
        });
      } catch {}
    }, 10000);
    return () => clearInterval(syncRef.current);
  }, [session?.id, session?.status]);

  const expireSession = useCallback(async () => {
    try {
      await base44.entities.TimedChatSession.update(sessionId, {
        status: 'expired',
        total_seconds_used: MAX_SECONDS,
      });
      setSession(prev => prev ? { ...prev, status: 'expired', total_seconds_used: MAX_SECONDS } : prev);
    } catch {}
  }, [sessionId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending || session?.status === 'expired') return;
    const text = input.trim();
    setInput('');
    setSending(true);
    setRedactNotice(false);

    try {
      const { message: redacted, was_redacted } = await redactMessage(text);
      if (was_redacted) setRedactNotice(true);

      const now = new Date().toISOString();
      await base44.entities.TimedChatMessage.create({
        session_id: sessionId,
        sender_type: userType,
        sender_name: userName || userEmail,
        message: redacted,
        sent_at: now,
        was_redacted,
      });

      lastActivityRef.current = new Date();
      await base44.entities.TimedChatSession.update(sessionId, {
        last_activity_at: now,
      });
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">{error}</p>
        <Button className="mt-4" onClick={() => navigate('/Messaging')}>Go to Messages</Button>
      </div>
    </div>
  );

  const isExpired = session?.status === 'expired' || (session?.total_seconds_used || 0) >= MAX_SECONDS;
  const secondsUsed = session?.total_seconds_used || 0;
  const otherName = userType === 'customer' ? session?.contractor_name : session?.customer_name;

  const timerColor = secondsUsed >= 480 ? 'text-red-600' : secondsUsed >= 360 ? 'text-amber-600' : 'text-green-700';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-slate-900 text-lg">10-Minute Chat</h1>
          <p className="text-sm text-slate-500">with {otherName || '...'}</p>
        </div>
        <div className="flex items-center gap-3">
          {isExpired ? (
            <Badge className="bg-slate-200 text-slate-700 text-sm px-3 py-1">Session Complete</Badge>
          ) : (
            <div className={`flex items-center gap-1.5 font-mono text-xl font-bold ${timerColor}`}>
              <Clock className="w-5 h-5" />
              {formatTime(secondsUsed)}
            </div>
          )}
        </div>
      </div>

      {/* Timer notice */}
      {!isExpired && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-xs text-blue-700 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          Timer counts down while you're actively messaging (pauses after 60 seconds of inactivity).
        </div>
      )}

      {isExpired && (
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center gap-2 text-slate-700">
          <CheckCircle className="w-5 h-5 text-slate-500 shrink-0" />
          <p className="text-sm font-medium">Your 10-minute session has ended. Chat is now read-only.</p>
        </div>
      )}

      {/* Redact notice */}
      {redactNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Personal contact info was removed from your message per platform policy.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-2xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm mt-8">No messages yet. Start the conversation!</div>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_type === userType;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
                {!isMe && <p className="text-xs font-semibold mb-1 text-slate-500">{msg.sender_name}</p>}
                <p className="leading-relaxed">{msg.message}</p>
                {msg.was_redacted && (
                  <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-amber-600'}`}>⚠ Contact info removed</p>
                )}
                <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                  {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 px-4 py-3 max-w-2xl mx-auto w-full">
        {isExpired ? (
          <div className="text-center text-sm text-slate-500 py-2">Session ended — messaging disabled</div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type a message..."
              className="flex-1"
              disabled={sending}
            />
            <Button onClick={handleSend} disabled={sending || !input.trim()} style={{ backgroundColor: '#1E5A96' }}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}