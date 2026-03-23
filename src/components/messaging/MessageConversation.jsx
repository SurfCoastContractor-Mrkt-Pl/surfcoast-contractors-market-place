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
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (
        (event.data.sender_email === conversation.otherParty && event.data.recipient_email === user.email) ||
        (event.data.sender_email === user.email && event.data.recipient_email === conversation.otherParty)
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
      m => !m.read && m.recipient_email === user.email
    );
    
    for (const msg of unreadMessages) {
      try {
        await base44.entities.Message.update(msg.id, { read: true });
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
        conversation.otherParty,
        conversation.otherParty,
        conversation.otherName,
        messageBody,
        attachedFiles
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
              className={`flex ${msg.sender_email === user.email ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  msg.sender_email === user.email
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>

                {/* Attachments */}
                {msg.file_urls && msg.file_urls.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.file_urls.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 text-xs py-1 px-2 rounded ${
                          msg.sender_email === user.email
                            ? 'bg-blue-700 hover:bg-blue-800'
                            : 'bg-slate-200 hover:bg-slate-300'
                        }`}
                      >
                        {file.type === 'image' ? (
                          <ImageIcon className="w-3 h-3" />
                        ) : (
                          <File className="w-3 h-3" />
                        )}
                        <span className="truncate">{file.name || 'Download'}</span>
                      </a>
                    ))}
                  </div>
                )}

                <p
                  className={`text-xs mt-2 ${
                    msg.sender_email === user.email ? 'text-blue-100' : 'text-slate-500'
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

      {/* File Preview */}
      {attachedFiles.length > 0 && (
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 space-y-2">
          <div className="text-xs font-semibold text-slate-600">Attached Files:</div>
          <div className="flex gap-2 flex-wrap">
            {attachedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 text-sm"
              >
                {file.type === 'image' ? (
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                ) : (
                  <File className="w-4 h-4 text-slate-600" />
                )}
                <span className="truncate flex-1">{file.name}</span>
                <button
                  onClick={() =>
                    setAttachedFiles(prev => prev.filter((_, i) => i !== idx))
                  }
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-6 border-t border-slate-200 bg-white">
        <div className="flex gap-3">
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={uploading || sending}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <Paperclip
              className={`w-5 h-5 ${
                uploading || sending ? 'text-slate-300' : 'text-slate-600 hover:text-blue-600'
              }`}
            />
          </label>

          <Input
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Type your message..."
            disabled={uploading || sending}
            className="flex-1"
          />

          <Button
            type="submit"
            disabled={(!messageBody.trim() && attachedFiles.length === 0) || uploading || sending}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}