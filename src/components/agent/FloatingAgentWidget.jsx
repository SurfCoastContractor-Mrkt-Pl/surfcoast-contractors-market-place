import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, X, Loader2, Minimize2, Maximize2, MessageSquare } from 'lucide-react';

const GREETING_MESSAGE = `👋 Welcome to SurfCoast Contractors Market Place!

I'm your AI Assistant. I can help you understand how the app works, our pricing, and how to get started — whether you're a customer or a contractor.

Ask me anything about the platform! 😊`;

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
    if (!input.trim()) return;

    const userMsg = input;
    const userMessage = { role: 'user', content: userMsg };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      if (!conversation) throw new Error('No conversation');
      const updatedConv = await base44.agents.addMessage(conversation, { role: 'user', content: userMsg });
      setConversation(updatedConv);
      const lastMsg = updatedConv?.messages?.slice().reverse().find(m => m.role === 'agent' || m.role === 'assistant');
      if (lastMsg) {
        setMessages(prev => [...prev, { role: 'agent', content: lastMsg.content }]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, { role: 'agent', content: "Sorry, I couldn't process that. Please try again." }]);
      setLoading(false);
    }
  };

  if (!open) return null;

  if (minimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
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
    <div className="fixed bottom-12 right-6 z-50 w-80 max-w-[calc(100vw-3rem)] max-h-[calc(100vh-10rem)] flex flex-col bg-white rounded-xl shadow-2xl border border-slate-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-t-xl p-3 flex items-center justify-between gap-2 shrink-0">
        <h3 className="font-semibold text-sm">SurfCoast Assistant</h3>
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