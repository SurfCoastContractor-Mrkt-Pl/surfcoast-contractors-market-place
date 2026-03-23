import React, { useEffect, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, X, File, Image as ImageIcon } from 'lucide-react';

export default function MessageConversation({ conversation, user, onSendMessage }) {
  const [messageBody, setMessageBody] = useState('');
  const [messages, setMessages] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Sort messages by date
    const sorted = conversation.messages.sort(
      (a, b) => new Date(a.created_date) - new Date(b.created_date)
    );
    setMessages(sorted);

    // Mark as read
    markAsRead();

    // Subscribe to new messages
    const unsubscribe = base44.entities.ConsumerVendorMessage.subscribe((event) => {
      if (
        (event.data.consumer_email === conversation.otherParty && event.data.vendor_email === user.email) ||
        (event.data.consumer_email === user.email && event.data.vendor_email === conversation.otherParty)
      ) {
        setMessages(prev => [...prev, event.data].sort(
          (a, b) => new Date(a.created_date) - new Date(b.created_date)
        ));
      }
    });

    scrollToBottom();
    return unsubscribe;
  }, [conversation, user.email]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markAsRead = async () => {
    const unreadMessages = conversation.messages.filter(
      m => !m.read && m.vendor_email === user.email
    );
    
    for (const msg of unreadMessages) {
      try {
        await base44.entities.ConsumerVendorMessage.update(msg.id, { read: true });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      const uploadedFiles = [];
      for (const file of files) {
        const fileData = await file.arrayBuffer();
        const result = await base44.integrations.Core.UploadFile({
          file: new Blob([fileData], { type: file.type }),
        });
        uploadedFiles.push({
          url: result.file_url,
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'document',
        });
      }
      setAttachedFiles(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageBody.trim() && attachedFiles.length === 0) return;

    setSending(true);
    try {
      await onSendMessage(
        conversation.shopId,
        conversation.otherParty,
        conversation.otherName,
        messageBody
      );
      setMessageBody('');
      setAttachedFiles([]);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const isCurrentUserConsumer = messages.length > 0 ? 
    messages[0].consumer_email === user.email : false;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
        <h3 className="text-lg font-bold text-slate-900">{conversation.otherName}</h3>
        <p className="text-sm text-slate-600">{conversation.otherParty}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-white space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.consumer_email === user.email ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  msg.consumer_email === user.email
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                <p
                  className={`text-xs mt-2 ${
                    msg.consumer_email === user.email ? 'text-blue-100' : 'text-slate-500'
                  }`}
                >
                  {new Date(msg.created_date).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-6 border-t border-slate-200 bg-white">
        <div className="flex gap-3">
          <Input
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Type your message..."
            disabled={uploading || sending}
            className="flex-1"
          />

          <Button
            type="submit"
            disabled={!messageBody.trim() || uploading || sending}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}