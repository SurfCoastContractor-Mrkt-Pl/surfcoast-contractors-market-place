import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Send, Loader } from 'lucide-react';

export default function SMSConversationThread({ conversationId, user }) {
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  // Fetch messages for this conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['smsMessages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      return await base44.entities.SMSMessage.filter(
        { conversation_id: conversationId },
        'created_date',
        100
      );
    },
    refetchInterval: 3000, // Poll for new messages every 3 seconds
    enabled: !!conversationId,
  });

  // Fetch conversation details
  const { data: conversation } = useQuery({
    queryKey: ['smsConversation', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      const convs = await base44.entities.SMSConversation.filter({
        id: conversationId,
      });
      return convs[0] || null;
    },
    enabled: !!conversationId,
  });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setSending(true);
    try {
      await base44.functions.invoke('sendSMS', {
        conversation_id: conversationId,
        recipient_phone:
          user.email === conversation?.contractor_email
            ? conversation?.client_phone
            : conversation?.contractor_phone,
        message_body: messageText,
        sender_type:
          user.email === conversation?.contractor_email
            ? 'contractor'
            : 'client',
      });

      setMessageText('');
      // Refetch messages
      window.location.reload();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (!conversation) {
    return <div className="p-4 text-slate-600">Loading conversation...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="font-bold text-slate-900">
          {conversation.client_name}
        </h2>
        <p className="text-sm text-slate-600">{conversation.client_phone}</p>
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender_email === user.email ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender_email === user.email
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p className="text-sm">{msg.body}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender_email === user.email
                      ? 'text-blue-100'
                      : 'text-slate-500'
                  }`}
                >
                  {new Date(msg.created_date).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-slate-200 p-4 flex gap-2"
      >
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !messageText.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {sending ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}