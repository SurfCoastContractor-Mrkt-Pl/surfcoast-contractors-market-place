import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';

export default function SMSConversationsList({ user, onSelectConversation }) {
  // Fetch conversations for current user
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['smsConversations', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const convs = await base44.entities.SMSConversation.filter(
        {
          $or: [
            { contractor_email: user.email },
            { client_email: user.email },
          ],
        },
        '-last_message_time'
      );
      return convs;
    },
    enabled: !!user?.email,
  });

  if (isLoading) {
    return <div className="p-4 text-slate-600">Loading conversations...</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="font-bold text-slate-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          SMS Conversations
        </h2>
      </div>

      <div className="divide-y divide-slate-200">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No conversations yet. Start texting with a client!
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900">
                    {conv.client_name}
                  </h3>
                  <p className="text-sm text-slate-600">{conv.client_phone}</p>
                  <p className="text-sm text-slate-700 mt-1 line-clamp-1">
                    {conv.last_message || 'No messages yet'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {conv.unread_count > 0 && (
                    <span className="inline-block bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {conv.unread_count > 9 ? '9+' : conv.unread_count}
                    </span>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(
                      conv.last_message_time
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}