import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import ChatWindow from '../components/messaging/ChatWindow';

export default function Messaging() {
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userType, setUserType] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timedData, setTimedData] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          base44.auth.redirectToLogin();
          return;
        }
        setUserEmail(user.email);
        setUserName(user.full_name);

        // Determine user type
        const contractors = await base44.entities.Contractor.filter({ email: user.email });
        setUserType(contractors?.length > 0 ? 'contractor' : 'customer');

        // Auto-select conversation from URL params (e.g. after timed payment)
        const urlParams = new URLSearchParams(window.location.search);
        const withEmail = urlParams.get('with');
        const withName = urlParams.get('name');
        const tier = urlParams.get('tier');
        const paymentId = urlParams.get('payment_id');
        // Also support legacy ?contractor= param used elsewhere in the app
        const contractorId = urlParams.get('contractor');
        if (withEmail) {
          setSelectedConversation({ email: withEmail, name: withName || withEmail, tier, paymentId });
          if (tier === 'timed' && paymentId) {
            setTimedData({ tier, paymentId });
          }
        }
        // Do NOT auto-select based on contractor ID alone — requires a paid session
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const { data: messages } = useQuery({
    queryKey: ['my-messages', userEmail],
    queryFn: async () => {
      const msgs = await base44.entities.Message.filter({
        $or: [
          { sender_email: userEmail },
          { recipient_email: userEmail }
        ]
      });
      return msgs;
    },
    enabled: !!userEmail,
  });

  // Extract unique conversations
  const conversations = messages ? Array.from(
    new Map(
      messages.map(m => {
        const otherEmail = m.sender_email === userEmail ? m.recipient_email : m.sender_email;
        const otherName = m.sender_email === userEmail ? m.recipient_name : m.sender_name;
        const key = [userEmail, otherEmail].sort().join('|');
        return [key, { email: otherEmail, name: otherName, lastMessage: m }];
      })
    ).values()
  ) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Conversation List */}
          <div className="md:col-span-1">
            <Card className="p-4">
              <h2 className="font-semibold text-slate-900 mb-4">Conversations</h2>
              {conversations.length === 0 ? (
                <p className="text-sm text-slate-500">No conversations yet</p>
              ) : (
                <div className="space-y-2">
                  {conversations.map(convo => (
                    <button
                      key={convo.email}
                      onClick={() => setSelectedConversation(convo)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedConversation?.email === convo.email
                          ? 'bg-amber-50 border border-amber-200'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-medium text-sm text-slate-900">{convo.name}</div>
                      <div className="text-xs text-slate-500 truncate mt-1">
                        {convo.lastMessage.body}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Chat Window */}
          <div className="md:col-span-2">
            {selectedConversation ? (
                <ChatWindow
                  otherUserEmail={selectedConversation.email}
                  otherUserName={selectedConversation.name}
                  otherUserType={selectedConversation.userType || (userType === 'contractor' ? 'customer' : 'contractor')}
                  userEmail={userEmail}
                  userName={userName}
                  userType={userType}
                  tier={selectedConversation.tier || timedData?.tier || null}
                  paymentId={selectedConversation.paymentId || timedData?.paymentId || null}
                />
              ) : (
              <Card className="p-8 text-center text-slate-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>Select a conversation to start messaging</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}