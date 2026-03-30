import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

export default function ProjectChatPanel({ scopeId, userEmail, userType }) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['projectMessages', scopeId],
    queryFn: () => base44.entities.ProjectMessage.filter(
      { scope_id: scopeId },
      'created_date',
      100
    ),
    enabled: !!scopeId,
    refetchInterval: 3000, // Poll every 3 seconds for real-time feel
  });

  const sendMutation = useMutation({
    mutationFn: async (text) => {
      return base44.entities.ProjectMessage.create({
        scope_id: scopeId,
        sender_email: userEmail,
        sender_name: userType === 'contractor' ? 'Contractor' : 'Client',
        sender_type: userType,
        message: text,
        read: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMessages', scopeId] });
      setMessage('');
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      setIsLoading(true);
      sendMutation.mutate(message, {
        onSettled: () => setIsLoading(false),
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messagesLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <p>No messages yet. Start the conversation.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_email === userEmail ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender_email === userEmail
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p className="text-sm font-medium mb-1">{msg.sender_name}</p>
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs mt-1 opacity-70">
                  {format(new Date(msg.created_date), 'HH:mm')}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 p-4 flex gap-2">
        <Input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={isLoading || !message.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}