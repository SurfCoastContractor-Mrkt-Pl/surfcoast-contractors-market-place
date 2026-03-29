import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectMessagePanel({ scopeId, hasSubscription, currentUserType }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scopeId || !hasSubscription) return;
    
    const fetchMessages = async () => {
      try {
        const msgs = await base44.entities.ProjectMessage.filter({ scope_id: scopeId });
        setMessages(msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setLoading(false);
      }
    };

    fetchMessages();
    const unsubscribe = base44.entities.ProjectMessage.subscribe((event) => {
      if (event.data?.scope_id === scopeId) {
        if (event.type === 'create') {
          setMessages(prev => [...prev, event.data]);
        }
      }
    });

    return unsubscribe;
  }, [scopeId, hasSubscription]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !hasSubscription) return;

    setSending(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.ProjectMessage.create({
        scope_id: scopeId,
        sender_email: user.email,
        sender_name: user.full_name,
        sender_type: currentUserType,
        message: messageText.trim()
      });
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!hasSubscription) {
    return (
      <Card className="p-6 bg-slate-50 border-slate-200">
        <div className="flex items-center gap-3 text-slate-600">
          <Lock className="w-5 h-5" />
          <div>
            <p className="font-medium">Project Messaging Locked</p>
            <p className="text-sm">Subscribe to the $50/month Communication plan to unlock real-time project messaging.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-96 border-slate-200">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-slate-500">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_type === currentUserType ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-lg ${msg.sender_type === currentUserType ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-900'}`}>
                  <p className="text-xs font-medium opacity-75">{msg.sender_name}</p>
                  <p className="text-sm break-words">{msg.message}</p>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="border-t border-slate-200 p-4 flex gap-2">
        <Input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          disabled={sending}
        />
        <Button type="submit" size="icon" disabled={sending || !messageText.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
}