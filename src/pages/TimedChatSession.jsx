import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Clock, CheckCircle, XCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TimedChatSession() {
  const [searchParams] = useSearchParams();
  const [sessionStatus, setSessionStatus] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionActive, setSessionActive] = useState(false);

  const sessionId = searchParams.get('session_id');
  const status = searchParams.get('status');

  useEffect(() => {
    if (status === 'success' && sessionId) {
      setSessionStatus('success');
      setSessionActive(true);
    } else if (status === 'cancelled') {
      setSessionStatus('cancelled');
    }
  }, [status, sessionId]);

  // Timer countdown
  useEffect(() => {
    if (!sessionActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setSessionActive(false);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setMessages([
      ...messages,
      {
        id: Date.now(),
        text: inputMessage,
        sender: 'user',
        timestamp: new Date(),
      },
    ]);
    setInputMessage('');
  };

  if (sessionStatus === 'cancelled') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Cancelled</h1>
            <p className="text-slate-600 mb-6">You've cancelled the chat session. No charge was made.</p>
            <Button onClick={() => window.history.back()} className="bg-slate-900 hover:bg-slate-800">
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (sessionStatus === 'success' && !sessionActive && timeRemaining === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Session Expired</h1>
            <p className="text-slate-600 mb-6">Your 10-minute chat session has ended. Thank you for using SurfCoast!</p>
            <Button onClick={() => window.history.back()} className="bg-slate-900 hover:bg-slate-800">
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Status */}
        {sessionStatus === 'success' && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900 ml-2">
              Payment successful! Your 10-minute chat session is now active.
            </AlertDescription>
          </Alert>
        )}

        {!sessionStatus && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 ml-2">
              Processing your session...
            </AlertDescription>
          </Alert>
        )}

        <Card className="flex flex-col h-[600px]">
          {/* Header */}
          <div className="border-b border-slate-200 p-4 bg-slate-50">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Direct Chat Session</h2>
              {sessionActive && (
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 rounded-full">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span className="text-sm font-medium text-amber-900">{formatTime(timeRemaining)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-xs bg-blue-600 text-white rounded-lg px-4 py-2">
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs text-blue-100 mt-1">{msg.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          {sessionActive ? (
            <form onSubmit={handleSendMessage} className="border-t border-slate-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          ) : (
            <div className="border-t border-slate-200 p-4 bg-slate-50">
              <p className="text-sm text-slate-600 text-center">Session has ended.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}