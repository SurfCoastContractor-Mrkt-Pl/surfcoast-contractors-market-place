import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Send, X, Loader2 } from 'lucide-react';

const GREETING_MESSAGE = `👋 Welcome to SurfCoast Contractor Market Place!

I'm your AI Assistant, here to help you get started. Let me tell you what we do:

**SurfCoast connects skilled coastal construction contractors with customers who need quality work done.**

Whether you're a contractor looking for jobs or a customer seeking trusted professionals, we make it easy to find, communicate, and complete projects.

**Important: Platform Communication Fee**
There's a simple $1.50 fee per project to unlock messaging and communication with contractors or customers. The fee applies each time you communicate on a new project — no hidden costs, no subscriptions.

How can I help you today?
• 🔧 Sign up as a Contractor
• 👤 Sign up as a Customer
• ❓ Ask me anything about the platform`;

export default function AgentChatModal({ open, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'agent', content: GREETING_MESSAGE }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState(null);

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

      // Subscribe to get agent response
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0" aria-describedby="agent-chat-description">
        <DialogHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-t-lg p-4 border-0">
          <DialogTitle className="text-white">SurfCoast Assistant</DialogTitle>
          <p id="agent-chat-description" className="sr-only">AI assistant chat for getting help with the platform</p>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-lg whitespace-pre-wrap text-sm leading-relaxed ${
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
        <div className="border-t border-slate-200 p-4 bg-white rounded-b-lg flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}