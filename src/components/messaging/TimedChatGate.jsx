import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Lock, CheckCircle } from 'lucide-react';
import TimedChatInitiator from '@/components/timed-chat/TimedChatInitiator';
import { base44 } from '@/api/base44Client';

export default function TimedChatGate({ recipientEmail, recipientName, contractorEmail, onSessionStart }) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [messagingAccess, setMessagingAccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkMessagingAccess();
  }, [contractorEmail, recipientEmail]);

  const checkMessagingAccess = async () => {
    try {
      const response = await base44.functions.invoke('validateMessagingAccess', {
        contractorEmail,
        clientEmail: recipientEmail
      });
      setMessagingAccess(response.data);
    } catch (error) {
      console.error('Error checking messaging access:', error);
      setMessagingAccess({ allowed: false, reason: 'Unable to verify access' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-slate-600">Checking messaging access...</p>
      </Card>
    );
  }

  if (showPaymentForm) {
    return (
      <TimedChatInitiator
        recipientEmail={recipientEmail}
        recipientName={recipientName}
        onSuccess={() => {
          onSessionStart?.();
          setShowPaymentForm(false);
        }}
      />
    );
  }

  // Free messaging access (Premium with past clients or Residential Bundle with all)
  if (messagingAccess?.allowed) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-green-900">Free Messaging Unlocked</h3>
        </div>

        <p className="text-sm text-green-800 mb-4">
          {messagingAccess.reason}
        </p>

        <Button
          onClick={onSessionStart}
          className="bg-green-600 hover:bg-green-700 text-white w-full"
        >
          Start Conversation
        </Button>
      </Card>
    );
  }

  // Paid messaging required
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 p-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Lock className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Direct Messaging</h3>
      </div>

      <p className="text-sm text-blue-800 mb-4">
        {messagingAccess?.reason || 'Start a 10-minute paid chat session with'} {recipientName}. <strong>$1.50</strong> covers both of you.
      </p>

      <Button
        onClick={() => setShowPaymentForm(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white w-full flex items-center justify-center gap-2"
      >
        <Clock className="w-4 h-4" />
        Start Paid Chat Session
      </Button>
    </Card>
  );
}