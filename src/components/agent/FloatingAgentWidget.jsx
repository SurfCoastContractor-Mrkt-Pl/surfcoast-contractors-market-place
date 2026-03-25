import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, X, Loader2, Minimize2, Maximize2, MessageSquare, Expand } from 'lucide-react';

const DEFAULT_GREETING = `👋 Welcome to SurfCoast Contractors Market Place!

I'm your AI Assistant, and I'm excited to help you discover what we're all about! 🚀

**Here's what you should know:**
We connect people who need work done (customers) with skilled individuals who offer services (contractors). And "contractor" here means ANYONE offering services — from licensed electricians to freelance designers, handymen, artists, creators, coaches, and even skilled teens! No trade license required.

**You're here because:**
• You're looking to hire someone to help with a project, OR
• You have skills/services and want to find work

**Let me help you get oriented:**
Would you like me to explain:
- 💼 How to find a contractor for your project?
- 🎯 How to set up as a contractor and find work?
- 💰 How our pricing works?
- 📖 Key terms and what they mean?

Or ask me anything else! I'm here to make sure you feel confident navigating the platform. 😊`;

const getGreetingMessage = () => {
  // Load from environment variable if available, otherwise use default
  return window.__AGENT_GREETING_MESSAGE__ || DEFAULT_GREETING;
};

export default function FloatingAgentWidget({ open, onClose, onOpen }) {
  const [messages, setMessages] = useState([
    { role: 'agent', content: getGreetingMessage() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [position, setPosition] = useState({ bottom: 24, left: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && !conversation) {
      initializeConversation();
    }
  }, [open]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = widgetRef.current?.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - (rect?.left || 0),
      y: e.clientY - (rect?.top || 0)
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !widgetRef.current) return;
      
      const newLeft = e.clientX - dragOffset.x;
      const newTop = e.clientY - dragOffset.y;
      
      setPosition({
        bottom: Math.max(0, window.innerHeight - newTop - widgetRef.current.offsetHeight),
        left: Math.max(0, newLeft)
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const initializeConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: 'onboarding_assistant',
        metadata: { name: 'Homepage Greeting' }
      });
      setConversation(conv);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !conversation) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    // Subscribe to streaming updates before sending
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      const agentMessages = (data.messages || []).filter(m => m.role === 'agent' || m.role === 'assistant');
      const lastAgent = agentMessages[agentMessages.length - 1];
      if (lastAgent?.content) {
        setMessages(prev => {
          // Replace last agent message if streaming, otherwise append
          const last = prev[prev.length - 1];
          if (last?.role === 'agent' && last?._streaming) {
            return [...prev.slice(0, -1), { role: 'agent', content: lastAgent.content, _streaming: true }];
          }
          return [...prev, { role: 'agent', content: lastAgent.content, _streaming: true }];
        });
      }
      // Stop loading once we have content
      if (lastAgent?.content) setLoading(false);
    });

    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: userMsg });
      // Finalize message (remove _streaming flag) after a short delay
      setTimeout(() => {
        setMessages(prev => prev.map(m => m._streaming ? { ...m, _streaming: false } : m));
        setLoading(false);
        unsubscribe();
      }, 1000);
    } catch (error) {
      console.error('Failed to send message:', error);
      unsubscribe();
      setMessages(prev => [...prev, { role: 'agent', content: "Sorry, I couldn't process that. Please try again." }]);
      setLoading(false);
    }
  };

  // Always show FAB; expand when open and not minimized
  if (!open || minimized) {
    return (
      <div 
        className="fixed z-50"
        ref={widgetRef}
        style={{ bottom: `${position.bottom}px`, left: `${position.left}px` }}
      >
        <button
          onClick={() => { setMinimized(false); onOpen && onOpen(); }}
          onMouseDown={handleMouseDown}
          className="flex items-center gap-1 pl-2 pr-3 h-7 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-xl transition-all font-semibold text-xs cursor-grab active:cursor-grabbing"
          title="Open AI Assistant"
        >
          <MessageSquare className="w-3 h-3 shrink-0" />
          AI Assistant
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={widgetRef}
      className={`fixed z-50 flex flex-col bg-white shadow-2xl border border-slate-200 pointer-events-auto transition-shadow ${
        expanded 
          ? 'inset-0 rounded-none' 
          : 'w-80 max-w-[calc(100vw-3rem)] h-[420px] rounded-xl'
      }`}
      style={expanded ? {} : { bottom: `${position.bottom}px`, left: `${position.left}px`, cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={!expanded ? handleMouseDown : undefined}
    >
      {/* Header */}
      <div 
        className={`bg-gradient-to-r from-amber-500 to-amber-600 text-white p-3 flex items-center justify-between gap-2 shrink-0 select-none ${
          expanded ? '' : 'rounded-t-xl'
        }`}
      >
        <h3 className="font-semibold text-sm">SurfCoast Assistant</h3>
        <div className="flex gap-1">
          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="p-1 hover:bg-amber-700 rounded transition-colors lg:hidden"
              title="Expand"
            >
              <Expand className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => expanded ? setExpanded(false) : setMinimized(true)}
            className="p-1 hover:bg-amber-700 rounded transition-colors"
            title={expanded ? "Collapse" : "Minimize"}
          >
            {expanded ? <Minimize2 className="w-4 h-4" /> : <span className="text-lg font-light">−</span>}
          </button>
          <button
            onClick={() => onClose()}
            className="p-1 hover:bg-amber-700 rounded transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 ${expanded ? 'max-h-[calc(100vh-120px)]' : ''}`}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-lg whitespace-pre-wrap text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-amber-500 text-white rounded-br-none'
                  : 'bg-white text-slate-900 rounded-bl-none border border-slate-200'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-900 px-4 py-3 rounded-lg rounded-bl-none border border-slate-200">
              <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`border-t border-slate-200 p-3 bg-white flex gap-2 shrink-0 ${expanded ? '' : 'rounded-b-xl'}`}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question..."
          disabled={loading}
          className="flex-1 text-xs"
        />
        <Button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1"
          size="sm"
        >
          <Send className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}