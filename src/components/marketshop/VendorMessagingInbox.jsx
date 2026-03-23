import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, MessageCircle, X, Send, Check } from 'lucide-react';

const MESSAGE_TYPES = {
  availability: 'Product Availability',
  custom_order: 'Custom Order',
  event_details: 'Event Details',
  other: 'Other Question',
};

export default function VendorMessagingInbox({ shopId, vendorEmail }) {
  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const queryClient = useQueryClient();

  // Fetch all messages for this vendor
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['vendor-inbox', shopId, vendorEmail],
    queryFn: () =>
      base44.entities.ConsumerVendorMessage.filter(
        { vendor_email: vendorEmail, shop_id: shopId },
        '-created_date'
      ),
    enabled: !!vendorEmail && !!shopId,
  });

  // Set up real-time subscription
  useEffect(() => {
    const unsubscribe = base44.entities.ConsumerVendorMessage.subscribe((event) => {
      if (event.data?.vendor_email === vendorEmail && event.data?.shop_id === shopId) {
        queryClient.invalidateQueries({
          queryKey: ['vendor-inbox', shopId, vendorEmail],
        });
      }
    });

    return unsubscribe;
  }, [shopId, vendorEmail, queryClient]);

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async (messageId) => {
      if (!replyText.trim()) throw new Error('Reply cannot be empty');
      return base44.entities.ConsumerVendorMessage.update(messageId, {
        vendor_reply: replyText.trim(),
        vendor_replied_at: new Date().toISOString(),
        status: 'replied',
      });
    },
    onSuccess: () => {
      setReplyText('');
      setReplyingTo(null);
      queryClient.invalidateQueries({
        queryKey: ['vendor-inbox', shopId, vendorEmail],
      });
    },
  });

  // Mark as read
  const markReadMutation = useMutation({
    mutationFn: async (messageId) => {
      return base44.entities.ConsumerVendorMessage.update(messageId, {
        status: 'read',
        read_by_vendor_at: new Date().toISOString(),
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const unreadCount = messages.filter((m) => m.status === 'unread').length;
  const groupedByConsumer = messages.reduce((acc, msg) => {
    const key = msg.consumer_email;
    if (!acc[key]) {
      acc[key] = {
        consumer_name: msg.consumer_name,
        consumer_email: msg.consumer_email,
        lastMessage: msg,
        messages: [],
      };
    }
    acc[key].messages.push(msg);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Customer Messages
          </h3>
          {unreadCount > 0 && (
            <p className="text-sm text-blue-600 mt-1">{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {/* Messages List */}
      {Object.values(groupedByConsumer).length === 0 ? (
        <Card className="p-12 text-center">
          <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No messages yet</p>
          <p className="text-sm text-slate-500 mt-1">Customers will see your vendor profile and send inquiries here.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedByConsumer).map(([email, convo]) => {
            const isExpanded = expandedId === email;
            const unreadInConvo = convo.messages.filter((m) => m.status === 'unread').length;

            return (
              <Card key={email} className="overflow-hidden">
                {/* Conversation Header */}
                <button
                  onClick={() => {
                    setExpandedId(isExpanded ? null : email);
                    if (!isExpanded && unreadInConvo > 0) {
                      convo.messages
                        .filter((m) => m.status === 'unread')
                        .forEach((m) => markReadMutation.mutate(m.id));
                    }
                  }}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900">{convo.consumer_name}</p>
                      {unreadInConvo > 0 && (
                        <Badge variant="default" className="text-xs">
                          {unreadInConvo} new
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 truncate">{convo.lastMessage.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{convo.consumer_email}</p>
                  </div>
                  <div className="text-xs text-slate-500 flex-shrink-0 ml-2">
                    {new Date(convo.lastMessage.created_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </button>

                {/* Expanded Messages */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-3 max-h-96 overflow-y-auto">
                    {convo.messages.map((msg) => (
                      <div key={msg.id} className="space-y-2">
                        {/* Customer message */}
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-600">{msg.consumer_name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{MESSAGE_TYPES[msg.message_type]}</p>
                              <p className="text-sm text-slate-800 mt-1">{msg.message}</p>
                            </div>
                            {msg.status === 'unread' && (
                              <Badge variant="default" className="text-xs flex-shrink-0">
                                New
                              </Badge>
                            )}
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

                        {/* Your reply (if exists) */}
                        {msg.vendor_reply && (
                          <div className="ml-4 bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
                            <p className="text-xs font-semibold text-green-800">Your reply</p>
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

                        {/* Reply form */}
                        {!msg.vendor_reply && replyingTo === msg.id && (
                          <div className="ml-4 space-y-2">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your reply..."
                              className="w-full text-sm border border-slate-300 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                              rows="2"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => replyMutation.mutate(msg.id)}
                                disabled={replyMutation.isPending || !replyText.trim()}
                                className="gap-1"
                              >
                                {replyMutation.isPending ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Send className="w-3 h-3" />
                                )}
                                Send
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText('');
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Reply button */}
                        {!msg.vendor_reply && replyingTo !== msg.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReplyingTo(msg.id)}
                            className="ml-4 gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Reply
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}