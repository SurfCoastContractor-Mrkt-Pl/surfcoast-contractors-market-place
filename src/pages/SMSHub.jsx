import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import SMSConversationsList from '@/components/sms/SMSConversationsList';
import SMSConversationThread from '@/components/sms/SMSConversationThread';
import { MessageCircle } from 'lucide-react';

export default function SMSHub() {
  const [user, setUser] = useState(null);
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">SMS Messaging</h1>
          </div>
          <p className="text-slate-600">
            Direct text messaging with your clients and contractors
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <SMSConversationsList
              user={user}
              onSelectConversation={setSelectedConversationId}
            />
          </div>

          {/* Conversation Thread */}
          <div className="lg:col-span-2">
            {selectedConversationId ? (
              <SMSConversationThread
                conversationId={selectedConversationId}
                user={user}
              />
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 flex items-center justify-center h-96">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">
                    Select a conversation to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> SMS integration with Twilio is ready but pending
            credentials. Once configured, all messages will be sent via SMS.
          </p>
        </div>
      </div>
    </div>
  );
}