import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, X, Loader2, Minimize2, Maximize2, MessageSquare } from 'lucide-react';

const GREETING_MESSAGE = `👋 Welcome to ContractorHub!

I'm your AI Assistant. Let me help you complete your profile setup.

**Here's what we'll do:**
✓ Help you fill in your customer profile
✓ Explain how to browse contractors or post a job
✓ Answer any questions about platform fees

**Platform Fees:**
💬 $1.50 per contractor (unlimited messaging until work starts)
📋 $0.75 for a quick quote request
⭐ $20/month unlimited messaging

Ready to get started? What would you like help with first?`;

const SETUP_GUIDANCE = {
  setupProfile: "I can help you complete your customer profile. Let's start with your location so we can find contractors near you. What city or area are you in?",
  browseContractors: "Great! To find contractors, I'll need to know: 1) What type of work do you need? 2) What's your location? 3) What's your budget range?",
  postJob: "To post a job, you'll need: 1) Job title and description 2) Your location 3) Budget (hourly or fixed) 4) Timeline 5) 5+ before photos\n\nWhich would you like help with?",
};

export default function FloatingAgentWidget({ open, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'agent', content: GREETING_MESSAGE }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    if (open && !conversation) {
      initializeConversation();
    }
  }, [open]);

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

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      await base44.agents.addMessage(conversation, userMessage);

      const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
        setMessages(data.messages);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to send message:', error);
      setLoading(false);
    }
  };

  if (!open) return null;

  if (minimized) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-xl transition-all"
          title="Open AI Assistant"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 max-w-[calc(100vw-2rem)] h-96 flex flex-col bg-white rounded-xl shadow-2xl border border-slate-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-t-xl p-3 flex items-center justify-between gap-2 shrink-0">
        <h3 className="font-semibold text-sm">ContractorHub Assistant</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setMinimized(true)}
            className="p-1 hover:bg-amber-700 rounded transition-colors"
            title="Minimize"
          >
            <span className="text-lg font-light">−</span>
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
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
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
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-3 bg-white rounded-b-xl flex gap-2 shrink-0">
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