import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ProjectChat({ scopeId, userEmail, userName, userType }) {
  const [input, setInput] = useState('');
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);

  const { data: messagesRaw } = useQuery({
    queryKey: ['project-messages', scopeId],
    queryFn: () => base44.entities.ProjectMessage.filter({ scope_id: scopeId }, 'created_date'),
    enabled: !!scopeId,
    refetchInterval: 10000,
  });

  const messages = messagesRaw;

  const sendMutation = useMutation({
    mutationFn: (messageData) => base44.entities.ProjectMessage.create(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-messages', scopeId] });
      setInput('');
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !scopeId || !userEmail) return;
    
    sendMutation.mutate({
      scope_id: scopeId,
      sender_email: userEmail,
      sender_name: userName,
      sender_type: userType,
      message: input
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages && messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === userType ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-lg text-sm ${
                  msg.sender_type === userType
                    ? 'bg-amber-500 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
                }`}
              >
                {msg.sender_type !== userType && (
                  <p className="text-xs font-semibold mb-1 opacity-75">{msg.sender_name}</p>
                )}
                <p className="break-words">{msg.message}</p>
                <p className={`text-xs mt-1 ${msg.sender_type === userType ? 'text-amber-100' : 'text-slate-500'}`}>
                  {format(new Date(msg.created_date), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p>No messages yet. Start a conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-4 bg-white flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          disabled={sendMutation.isPending}
          className="flex-1 text-sm"
        />
        <Button
          onClick={handleSend}
          disabled={sendMutation.isPending || !input.trim()}
          className="bg-amber-500 hover:bg-amber-600 text-white px-3"
          size="sm"
        >
          {sendMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}