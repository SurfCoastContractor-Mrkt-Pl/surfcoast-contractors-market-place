import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Lock } from 'lucide-react';
import TimedChatInitiator from '@/components/timed-chat/TimedChatInitiator';

export default function TimedChatGate({ recipientEmail, recipientName, onSessionStart }) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);

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

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 p-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Lock className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Direct Messaging Locked</h3>
      </div>

      <p className="text-sm text-blue-800 mb-4">
        Start a 10-minute paid chat session with {recipientName} to unlock direct messaging. <strong>$1.50</strong> covers both of you.
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