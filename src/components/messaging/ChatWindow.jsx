import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Plus, Paperclip, MoreVertical, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { 
  validateMessagingEligibility, 
  isTimedSessionActive, 
  getSessionCount,
  getTimedSessionExpiration 
} from '@/components/utils/sessionManager';

export default function ChatWindow({ 
  otherUserEmail, 
  otherUserName, 
  userEmail, 
  userName, 
  userType,
  otherUserType,
  tier = 'subscription',
  paymentRecord = null 
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const validateAndLoad = async () => {
      try {
        // Validate eligibility
        const result = await validateMessagingEligibility(
          userEmail,
          userType,
          otherUserEmail,
          otherUserType,
          tier
        );
        setEligibility(result);

        if (!result.allowed) {
          setLoading(false);
          return;
        }

        // Load existing messages
        const msgs = await base44.entities.Message.filter({
          $or: [
            { sender_email: userEmail, recipient_email: otherUserEmail },
            { sender_email: otherUserEmail, recipient_email: userEmail }
          ]
        });
        setMessages(msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));

        // Get session count for subscription tier
        if (tier === 'subscription') {
          const count = await getSessionCount(userEmail, otherUserEmail);
          setSessionCount(count);
        }

        // Get time remaining for timed session
        if (tier === 'timed' && paymentRecord) {
          const expiration = getTimedSessionExpiration(paymentRecord);
          setTimeRemaining(expiration);
        }
      } catch (error) {
        console.error('Error validating eligibility:', error);
      } finally {
        setLoading(false);
      }
    };
    
    validateAndLoad();

    // Subscribe to new messages
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (
        (event.data.sender_email === userEmail && event.data.recipient_email === otherUserEmail) ||
        (event.data.sender_email === otherUserEmail && event.data.recipient_email === userEmail)
      ) {
        if (event.type === 'create') {
          setMessages(prev => [...prev, event.data]);
        }
      }
    });

    return () => unsubscribe?.();
  }, [userEmail, otherUserEmail, tier]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      await base44.entities.Message.create({
        sender_email: userEmail,
        sender_name: userName,
        sender_type: userType,
        recipient_email: otherUserEmail,
        recipient_name: otherUserName,
        message: newMessage.trim(),
        read: false
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-slate-500">Loading messages...</div>;
  }

  return (
    <div className="flex flex-col h-full max-h-96 bg-white rounded-lg border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div>
          <h3 className="font-semibold text-slate-900">{otherUserName}</h3>
          <p className="text-xs text-slate-500">{otherUserEmail}</p>
        </div>
        <Button variant="ghost" size="icon" className="text-slate-400">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div 
              key={msg.id}
              className={`flex ${msg.sender_email === userEmail ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.sender_email === userEmail 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-slate-100 text-slate-900'
              }`}>
                <p className="text-sm break-words">{msg.message}</p>
                <p className={`text-xs mt-1 ${msg.sender_email === userEmail ? 'text-amber-100' : 'text-slate-500'}`}>
                  {new Date(msg.created_date).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 flex gap-2">
        <Button variant="ghost" size="icon" className="text-slate-400">
          <Plus className="w-4 h-4" />
        </Button>
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1"
        />
        <Button 
          size="icon"
          onClick={handleSend}
          disabled={!newMessage.trim()}
          className="bg-amber-500 hover:bg-amber-600"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}