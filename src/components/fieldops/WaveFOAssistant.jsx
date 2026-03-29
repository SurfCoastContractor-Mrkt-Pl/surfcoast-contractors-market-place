import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageSquare, X, Send, Loader2, Minimize2, ChevronRight, Waves } from 'lucide-react';

// Tab-specific contextual greetings and quick prompts
const TAB_CONTEXT = {
  jobs: {
    greeting: "👋 You're on the **Wave FO Jobs** tab! Here you'll see all jobs available to you based on your current wave tier.\n\nQuick tips:\n• Tap a job to see full details and scope\n• Use filters to narrow by location or trade\n• Apply directly from the job card\n\nWhat would you like help with?",
    prompts: ['How do I apply for a job?', 'Why can\'t I see all jobs?', 'What is a Scope of Work?'],
  },
  map: {
    greeting: "🗺️ You're on the **Wave FO Map** — a live view of job locations near you!\n\nYou can:\n• See jobs pinned on the map by location\n• Tap a pin to view job details\n• Plan your day's route visually\n\nNeed help navigating the map?",
    prompts: ['How do I use the job map?', 'Why are some jobs not showing?', 'Can I filter by distance?'],
  },
  schedule: {
    greeting: "📅 You're on the **Wave FO Schedule** — your personal job calendar!\n\nHere you can:\n• See upcoming jobs by date\n• Confirm agreed work dates with customers\n• Plan your week at a glance\n\nWhat would you like to know about scheduling?",
    prompts: ['How do I confirm a work date?', 'How does the schedule work?', 'Can customers see my schedule?'],
  },
  invoices: {
    greeting: "💳 You're on **Wave FO Invoices** — your field billing center!\n\nInvoices let you:\n• Bill customers for completed work\n• Track payment status in real time\n• Keep a record of your earnings\n\nNeed help with an invoice?",
    prompts: ['How do I create an invoice?', 'When do I get paid?', 'What is the platform fee?'],
  },
  reports: {
    greeting: "📊 You're on **Wave FO Reports** — your performance overview!\n\nAs a Ripple or Swell tier user, you can:\n• See completed job counts\n• Track progress toward the next wave\n• Review your activity history\n\nWhat would you like to understand better?",
    prompts: ['How do I reach the next wave?', 'What metrics should I focus on?', 'How are jobs counted?'],
  },
  profile: {
    greeting: "👤 You're on your **Wave FO Profile**!\n\nYour profile is what customers see when they look you up. Make sure:\n• Your photo is clear and professional\n• Your skills and bio are up to date\n• Your availability status is accurate\n\nWant help improving your profile?",
    prompts: ['How do I update my availability?', 'What makes a good profile?', 'How do ratings work?'],
  },
  supplies: {
    greeting: "🏪 You're on **Supply Houses Finder** — find materials near your job site!\n\nUse this to:\n• Locate nearby supply stores for your trade\n• Find last-minute materials on the go\n• Save time on material runs\n\nNeed help finding supplies?",
    prompts: ['How does the supply finder work?', 'Can I save supply houses?', 'What trades are supported?'],
  },
  default: {
    greeting: "👋 Hi! I'm your Wave FO Assistant.\n\nI'm here to help you navigate Wave FO, understand your tier benefits, and get the most out of your contractor dashboard.\n\nWhat can I help you with today?",
    prompts: ['What is my current wave tier?', 'How does Wave FO work?', 'How do I earn more jobs?'],
  },
};

const WAVE_INFO = {
  ripple: { name: 'Ripple', emoji: '〰️', color: '#64748b', jobsRequired: 15, nextTier: 'Swell', nextJobsRequired: 35 },
  swell: { name: 'Swell', emoji: '🌊', color: '#0ea5e9', jobsRequired: 35, nextTier: 'Breaker (Full Access)', nextJobsRequired: 55 },
};

function MessageBubble({ msg }) {
  return (
    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
          msg.role === 'user'
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-slate-700 text-slate-100 rounded-bl-none border border-slate-600'
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

export default function WaveFOAssistant({ contractor, activeTab }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [showProactiveBanner, setShowProactiveBanner] = useState(false);
  const [proactiveMessage, setProactiveMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inactivityTimer = useRef(null);
  const seenTabsRef = useRef(new Set(JSON.parse(sessionStorage.getItem('wfo_seen_tabs') || '[]')));

  const completedJobs = contractor?.completed_jobs_count || 0;

  // Determine wave tier
  const waveTier = completedJobs >= 35 ? 'swell' : 'ripple';
  const waveInfo = WAVE_INFO[waveTier];
  const jobsToNext = waveInfo.nextJobsRequired - completedJobs;

  const tabContext = TAB_CONTEXT[activeTab] || TAB_CONTEXT.default;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Proactive banner on tab change (if not seen before)
  useEffect(() => {
    if (!seenTabsRef.current.has(activeTab)) {
      const timer = setTimeout(() => {
        if (!open) {
          setProactiveMessage(`Need help with ${activeTab === 'jobs' ? 'Wave FO Jobs' : activeTab}? I can guide you! 💬`);
          setShowProactiveBanner(true);
        }
        seenTabsRef.current.add(activeTab);
        sessionStorage.setItem('wfo_seen_tabs', JSON.stringify([...seenTabsRef.current]));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeTab, open]);

  // Inactivity prompt after 45 seconds
  useEffect(() => {
    clearTimeout(inactivityTimer.current);
    if (!open) {
      inactivityTimer.current = setTimeout(() => {
        if (!open) {
          setProactiveMessage(`Still looking around? I'm here to help! You're ${jobsToNext} jobs away from ${waveInfo.nextTier} 🌊`);
          setShowProactiveBanner(true);
        }
      }, 45000);
    }
    return () => clearTimeout(inactivityTimer.current);
  }, [activeTab, open]);

  const initConversation = useCallback(async (initialMsg) => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: 'sage',
        metadata: { name: `Wave FO - ${activeTab}`, context: 'waveFO_guidance' }
      });
      setConversation(conv);

      // Send initial contextual message
      const greetMsg = initialMsg || tabContext.greeting;
      setMessages([{ role: 'agent', content: greetMsg }]);

      return conv;
    } catch (e) {
      console.error('WaveFO assistant init error:', e);
    }
  }, [activeTab, tabContext]);

  const openAssistant = useCallback(async (prefilledMsg) => {
    setShowProactiveBanner(false);
    setOpen(true);
    setMinimized(false);
    clearTimeout(inactivityTimer.current);

    if (!conversation) {
      const conv = await initConversation();
      if (prefilledMsg && conv) {
        // Auto-send the prefilled message
        setTimeout(() => sendMessage(prefilledMsg, conv), 300);
      }
    } else if (prefilledMsg) {
      sendMessage(prefilledMsg, conversation);
    }
  }, [conversation, initConversation]);

  const sendMessage = useCallback(async (text, conv) => {
    const convToUse = conv || conversation;
    if (!text?.trim() || !convToUse) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    const unsubscribe = base44.agents.subscribeToConversation(convToUse.id, (data) => {
      const agentMsgs = (data.messages || []).filter(m => m.role === 'agent' || m.role === 'assistant');
      const last = agentMsgs[agentMsgs.length - 1];
      if (last?.content) {
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.role === 'agent' && lastMsg?._streaming) {
            return [...prev.slice(0, -1), { role: 'agent', content: last.content, _streaming: true }];
          }
          return [...prev, { role: 'agent', content: last.content, _streaming: true }];
        });
        setLoading(false);
      }
    });

    try {
      await base44.agents.addMessage(convToUse, { role: 'user', content: text });
      setTimeout(() => {
        setMessages(prev => prev.map(m => m._streaming ? { ...m, _streaming: false } : m));
        setLoading(false);
        unsubscribe();
      }, 1200);
    } catch (e) {
      console.error('Wave FO assistant send error:', e);
      unsubscribe();
      setMessages(prev => [...prev, { role: 'agent', content: "Sorry, I ran into an issue. Please try again." }]);
      setLoading(false);
    }
  }, [conversation]);

  const handleSend = () => sendMessage(input, conversation);

  const handleClose = () => {
    setOpen(false);
    setMinimized(false);
  };

  return (
    <>
      {/* Proactive Banner */}
      {showProactiveBanner && !open && (
        <div className="fixed bottom-20 right-4 z-50 max-w-xs animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-800 border border-blue-500/40 rounded-2xl shadow-xl p-3 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Waves className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-200 leading-snug">{proactiveMessage}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => openAssistant()}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full font-medium transition-colors"
                >
                  Get Help
                </button>
                <button
                  onClick={() => setShowProactiveBanner(false)}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button onClick={() => setShowProactiveBanner(false)} className="text-slate-500 hover:text-white flex-shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button (always visible when assistant closed) */}
      {(!open || minimized) && (
        <button
          onClick={() => openAssistant()}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-900/40 transition-all text-xs font-semibold border border-blue-500"
        >
          <Waves className="w-3.5 h-3.5" />
          Wave FO Guide
          {showProactiveBanner && (
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          )}
        </button>
      )}

      {/* Chat Panel */}
      {open && !minimized && (
        <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] h-[460px] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-slate-950/60 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-white" />
              <div>
                <p className="text-white text-xs font-bold leading-tight">Wave FO Guide</p>
                <p className="text-blue-200 text-[10px] leading-tight">
                  {waveInfo.emoji} {waveInfo.name} · {jobsToNext} jobs to {waveInfo.nextTier}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setMinimized(true)}
                className="p-1 text-blue-200 hover:text-white hover:bg-blue-800 rounded transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClose}
                className="p-1 text-blue-200 hover:text-white hover:bg-blue-800 rounded transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-950/40">
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 border border-slate-600 px-3 py-2 rounded-xl rounded-bl-none">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-col gap-1 flex-shrink-0">
              {tabContext.prompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt, conversation)}
                  disabled={loading || !conversation}
                  className="text-left text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <ChevronRight className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-slate-700 p-3 bg-slate-900 flex gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && !loading && handleSend()}
              placeholder="Ask anything about Wave FO..."
              disabled={loading || !conversation}
              className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-40"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim() || !conversation}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}