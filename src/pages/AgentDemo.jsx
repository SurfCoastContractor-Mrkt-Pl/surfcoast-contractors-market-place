import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';

export default function AgentDemo() {
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      content: `👋 Welcome to ContractorHub!

I'm your AI Assistant, here to help you get started. Let me tell you what we do:

**ContractorHub connects skilled construction contractors with customers who need quality work done.**

Whether you're a contractor looking for jobs or a customer seeking trusted professionals, we make it easy to find, communicate, and complete projects.

**Important: One-Time Platform Fee**
There's a simple $1.50 one-time platform access fee to unlock messaging and communication. That's it — no hidden costs, no additional fees, no subscription charges.

How can I help you today?
- 🔧 Sign up as a Contractor
- 👤 Sign up as a Customer
- ❓ Ask me anything about the platform`
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call the agent
      const conversation = await base44.agents.createConversation({
        agent_name: 'onboarding_assistant',
        metadata: { name: 'Demo Conversation' }
      });

      await base44.agents.addMessage(conversation, userMessage);

      // Simulate getting response (in real implementation, use subscribeToConversation)
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: 'This is a demo. In the live version, the agent will respond here based on your question.'
        }]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: 'Error connecting to agent. Please try again.'
      }]);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 rounded-t-xl p-4">
          <h1 className="text-xl font-bold text-slate-900">ContractorHub AI Assistant</h1>
          <p className="text-sm text-slate-500">Your onboarding guide</p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-white p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-amber-500 text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-900 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-900 px-4 py-3 rounded-lg rounded-bl-none">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 rounded-b-xl p-4 space-y-3">
          <div className="flex gap-2">
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
          <p className="text-xs text-slate-500 text-center">
            Demo Mode — This shows how the greeting will appear when visitors enter the app
          </p>
        </div>
      </div>
    </div>
  );
}