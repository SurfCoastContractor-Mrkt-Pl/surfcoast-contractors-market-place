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
  tier = null,
  paymentId = null,
  paymentRecord = null 
}) {
  // Normalise: accept either paymentId string or paymentRecord object
  const resolvedPaymentId = paymentId || paymentRecord?.id || null;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerPaused, setTimerPaused] = useState(false); // paused while waiting for other party
  const scrollRef = useRef(null);
  const timerPausedRef = useRef(false); // ref for use inside interval

  useEffect(() => {
    const validateAndLoad = async () => {
      try {
        // For timed tier with a payment ID, skip eligibility check — trust the payment
        if (tier === 'timed' && resolvedPaymentId) {
          setEligibility({ allowed: true, tier: 'timed' });
        } else {
          const result = await validateMessagingEligibility(
            userEmail,
            userType,
            otherUserEmail,
            otherUserType,
            tier || 'any'
          );
          // Use tier from backend response if we didn't have one
          if (result.allowed && !tier && result.tier) {
            result.tier = result.tier;
          }
          setEligibility(result);
          if (!result.allowed) {
            setLoading(false);
            return;
          }
        }

        // Load existing messages
        const msgs = await base44.entities.Message.filter({
          $or: [
            { sender_email: userEmail, recipient_email: otherUserEmail },
            { sender_email: otherUserEmail, recipient_email: userEmail }
          ]
        });
        const sorted = msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        setMessages(sorted);
        // If the last message was sent by the current user, start paused
        if (tier === 'timed' && sorted.length > 0) {
          const lastMsg = sorted[sorted.length - 1];
          if (lastMsg.sender_email === userEmail) {
            timerPausedRef.current = true;
            setTimerPaused(true);
          }
        }

        // Get session count for subscription tier
        if (tier === 'subscription') {
          const count = await getSessionCount(userEmail, otherUserEmail);
          setSessionCount(count);
        }

        // Get time remaining for timed session — look up the payment record by ID
        if (tier === 'timed' && resolvedPaymentId) {
          try {
            const result = await base44.functions.invoke('verifyPayment', { payment_id: resolvedPaymentId });
            const p = result?.data?.payment;
            if (p?.session_expires_at) {
              setTimeRemaining(new Date(p.session_expires_at));
            } else {
              // No expiry set yet (webhook pending) — grant 10 minutes from now
              setTimeRemaining(new Date(Date.now() + 10 * 60 * 1000));
            }
          } catch {
            setTimeRemaining(new Date(Date.now() + 10 * 60 * 1000));
          }
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
          setMessages(prev => {
            const updated = [...prev, event.data];
            // If the other party just replied, resume the timer
            if (event.data.sender_email === otherUserEmail) {
              timerPausedRef.current = false;
              setTimerPaused(false);
            }
            return updated;
          });
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

  // Timer for timed session — pauses when waiting for other party's reply
  useEffect(() => {
    if (tier !== 'timed' || !timeRemaining) return;

    const interval = setInterval(() => {
      // If paused (waiting for other party), don't count down
      if (timerPausedRef.current) return;

      setTimeRemaining(prev => {
        const next = new Date(prev.getTime() - 1000);
        if (next <= new Date()) {
          setEligibility({ allowed: false, reason: 'Session expired' });
          clearInterval(interval);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tier, timeRemaining !== null]); // only re-run when timer is first set

  const handleSend = async () => {
    if (!newMessage.trim() || !eligibility?.allowed) return;

    // Check session expiration for timed tier
    if (tier === 'timed' && timeRemaining && !isTimedSessionActive(timeRemaining)) {
      setEligibility({ allowed: false, reason: 'Session expired' });
      return;
    }

    try {
      await base44.entities.Message.create({
        sender_email: userEmail,
        sender_name: userName,
        sender_type: userType,
        recipient_email: otherUserEmail,
        recipient_name: otherUserName,
        body: newMessage.trim(),
        payment_id: resolvedPaymentId,
        read: false
      });
      setNewMessage('');
      // Pause timer — waiting for the other party to respond
      if (tier === 'timed') {
        timerPausedRef.current = true;
        setTimerPaused(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-slate-500">Loading messages...</div>;
  }

  if (!eligibility?.allowed) {
    return (
      <Card className="p-6 max-h-96 flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h3 className="font-semibold text-slate-900 mb-2">Cannot Message</h3>
        <p className="text-sm text-slate-600 text-center">{eligibility?.reason}</p>
      </Card>
    );
  }

  const formatTimeRemaining = (date) => {
    if (!date) return '';
    const now = new Date();
    const mins = Math.floor((date - now) / 60000);
    const secs = Math.floor(((date - now) % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full max-h-96 bg-white rounded-lg border border-slate-200">
      {/* Header */}
       <div className="flex items-center justify-between p-4 border-b border-slate-200">
         <div>
           <h3 className="font-semibold text-slate-900">{otherUserName}</h3>
           <p className="text-xs text-slate-500">{otherUserEmail}</p>
           {tier === 'timed' && timeRemaining && (
             <p className={`text-xs font-semibold mt-1 ${timerPaused ? 'text-blue-500' : 'text-amber-600'}`}>
               {timerPaused
                 ? `⏸ Paused — waiting for reply (${formatTimeRemaining(timeRemaining)} left)`
                 : `▶ Time remaining: ${formatTimeRemaining(timeRemaining)}`}
             </p>
           )}
           {tier === 'subscription' && (
             <p className="text-xs text-slate-500 mt-1">
               Sessions: {sessionCount}/5
             </p>
           )}
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
                <p className="text-sm break-words">{msg.body}</p>
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
           disabled={!eligibility?.allowed || (tier === 'timed' && !isTimedSessionActive(timeRemaining))}
           className="flex-1"
         />
         <Button 
           size="icon"
           onClick={handleSend}
           disabled={!newMessage.trim() || !eligibility?.allowed || (tier === 'timed' && !isTimedSessionActive(timeRemaining))}
           className="bg-amber-500 hover:bg-amber-600"
         >
           <Send className="w-4 h-4" />
         </Button>
      </div>
    </div>
  );
}