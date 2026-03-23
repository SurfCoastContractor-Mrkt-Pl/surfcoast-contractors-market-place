import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Send, Loader2, MessageCircle, Check, CheckCheck } from 'lucide-react';

const MESSAGE_TYPES = {
  availability: 'Product Availability',
  custom_order: 'Custom Order',
  event_details: 'Event Details',
  other: 'Other Question',
};

export default function ConsumerVendorMessaging({ shop, userEmail, userName }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState('availability');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  // Get conversation ID (same for all messages between consumer and vendor)
  const conversationId = `${userEmail}-${shop.id}`.replace(/[^a-z0-9-]/gi, '');

  // Fetch conversation thread
  const { data: conversationData = [] } = useQuery({
    queryKey: ['consumer-vendor-messages', shop.id, userEmail],
    queryFn: () =>
      base44.entities.ConsumerVendorMessage.filter({
        shop_id: shop.id,
        conversation_id: conversationId,
      }, '-created_date'),
    enabled: !!shop?.id && !!userEmail,
  });

  // Set up real-time subscription
  useEffect(() => {
    const unsubscribe = base44.entities.ConsumerVendorMessage.subscribe((event) => {
      if (
        event.data?.shop_id === shop.id &&
        event.data?.conversation_id === conversationId &&
        (event.data?.consumer_email === userEmail || event.data?.vendor_email)
      ) {
        queryClient.invalidateQueries({
          queryKey: ['consumer-vendor-messages', shop.id, userEmail],
        });
      }
    });

    return unsubscribe;
  }, [shop.id, userEmail, conversationId, queryClient]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (text) => {
      if (!text.trim()) throw new Error('Message cannot be empty');

      // Generate conversation ID if not exists
      const convId =
        conversationData.length > 0
          ? conversationData[0].conversation_id
          : conversationId;

      return base44.entities.ConsumerVendorMessage.create({
        shop_id: shop.id,
        shop_name: shop.shop_name,
        consumer_email: userEmail,
        consumer_name: userName,
        vendor_email: shop.email,
        subject: MESSAGE_TYPES[messageType],
        message: text.trim(),
        message_type: messageType,
        conversation_id: convId,
        status: 'unread',
      });
    },
    onSuccess: () => {
      setMessageText('');
      setSuccess(true);
      setError(null);
      queryClient.invalidateQueries({
        queryKey: ['consumer-vendor-messages', shop.id, userEmail],
      });
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async ({ messageId, replyText }) => {
      return base44.entities.ConsumerVendorMessage.update(messageId, {
        vendor_reply: replyText.trim(),
        vendor_replied_at: new Date().toISOString(),
        status: 'replied',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['consumer-vendor-messages', shop.id, userEmail],
      });
    },
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (messageId) => {
      return base44.entities.ConsumerVendorMessage.update(messageId, {
        status: 'read',
        read_by_vendor_at: new Date().toISOString(),
      });
    },
  });

  if (!userEmail) {
    return (
      <Card className="p-6 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">Please log in to message this vendor.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Messages Thread */}
      <Card className="p-4 space-y-3 bg-slate-50 max-h-96 overflow-y-auto">
        {conversationData.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No messages yet. Start a conversation!</p>
          </div>
        ) : (
          conversationData.map((msg) => (
            <div key={msg.id}>
              {/* Consumer message */}
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-600">{msg.consumer_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{MESSAGE_TYPES[msg.message_type]}</p>
                    <p className="text-sm text-slate-800 mt-1">{msg.message}</p>
                  </div>
                  <span
                    className={`flex-shrink-0 text-xs ${
                      msg.status === 'replied'
                        ? 'text-green-600'
                        : msg.status === 'read'
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {msg.status === 'replied' ? (
                      <CheckCheck className="w-4 h-4" />
                    ) : msg.status === 'read' ? (
                      <Check className="w-4 h-4" />
                    ) : null}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {new Date(msg.created_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Vendor reply */}
              {msg.vendor_reply && (
                <div className="mt-2 ml-4 bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
                  <p className="text-xs font-semibold text-green-800">{msg.shop_name} replied</p>
                  <p className="text-sm text-green-900 mt-1">{msg.vendor_reply}</p>
                  <p className="text-xs text-green-600 mt-2">
                    {new Date(msg.vendor_replied_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">Message sent! The vendor will receive it shortly.</p>
        </div>
      )}

      {/* Message Input */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase mb-2 block">
            Inquiry Type
          </label>
          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value)}
            className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white"
          >
            {Object.entries(MESSAGE_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase mb-2 block">
            Message
          </label>
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Ask about product availability, custom orders, market events, or anything else..."
            className="w-full text-sm border border-slate-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
        </div>

        <Button
          onClick={() => sendMessageMutation.mutate(messageText)}
          disabled={sendMessageMutation.isPending || !messageText.trim()}
          className="w-full gap-2"
        >
          {sendMessageMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Send Message
        </Button>
      </div>
    </div>
  );
}