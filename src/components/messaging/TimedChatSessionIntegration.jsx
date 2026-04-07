import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function TimedChatSessionIntegration({ sender_email, recipient_email, payment_id, onSessionCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleStartChat = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await base44.functions.invoke('fixCreateTimedChatSession', {
        sender_email,
        recipient_email,
        duration_minutes: 10,
        payment_id
      });

      if (response.data?.success) {
        setSuccess(`Chat session started (expires at ${new Date(response.data.expires_at).toLocaleTimeString()})`);
        onSessionCreated?.(response.data);
      } else if (response.data?.requires_payment) {
        setError('Payment required to start chat: $1.50 for 10 min or $50/month unlimited');
      } else {
        setError('Failed to create chat session');
      }
    } catch (err) {
      setError(err.message || 'Error creating chat session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleStartChat}
        disabled={loading || !payment_id}
        className="gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
        {loading ? 'Starting...' : 'Start Chat Session'}
      </Button>
      {!payment_id && <div className="text-xs text-amber-600">Payment required</div>}
      {error && <div className="flex gap-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}
      {success && <div className="flex gap-2 text-green-600 text-sm"><CheckCircle2 className="w-4 h-4" />{success}</div>}
    </div>
  );
}