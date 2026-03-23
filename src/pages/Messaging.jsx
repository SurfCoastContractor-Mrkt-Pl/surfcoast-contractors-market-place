import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Send, Paperclip, X } from 'lucide-react';
import MessageConversation from '@/components/messaging/MessageConversation.jsx';
import NewMessageForm from '@/components/messaging/NewMessageForm.jsx';

export default function Messaging() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeMessaging = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);
        
        // Fetch conversations for this user
        await fetchConversations(currentUser.email);
        
        // Subscribe to message updates
        const unsubscribe = base44.entities.Message.subscribe((event) => {
          if (event.type === 'create' || event.type === 'update') {
            fetchConversations(currentUser.email);
          }
        });
        
        return unsubscribe;
      } catch (error) {
        console.error('Error initializing messaging:', error);
      } finally {
        setLoading(false);
      }
    };

    const cleanup = initializeMessaging();
    return () => {
      cleanup?.then(unsub => unsub && unsub());
    };
  }, []);

  const fetchConversations = async (userEmail) => {
    try {
      // Get messages where user is sender or recipient
      const [sentMessages, receivedMessages] = await Promise.all([
        base44.entities.Message.filter({ sender_email: userEmail }),
        base44.entities.Message.filter({ recipient_email: userEmail }),
      ]);

      const allMessages = [...(sentMessages || []), ...(receivedMessages || [])];
      
      // Group by conversation (sender + recipient pair)
      const conversationMap = new Map();
      
      allMessages.forEach(msg => {
        const otherParty = msg.sender_email === userEmail ? msg.recipient_email : msg.sender_email;
        const otherName = msg.sender_email === userEmail ? msg.recipient_name : msg.sender_name;
        const key = [userEmail, otherParty].sort().join('|');
        
        if (!conversationMap.has(key)) {
          conversationMap.set(key, {
            key,
            otherParty,
            otherName,
            messages: [],
            lastMessage: null,
            lastMessageTime: new Date(0),
            unreadCount: 0,
          });
        }
        
        const convo = conversationMap.get(key);
        convo.messages.push(msg);
        
        if (new Date(msg.created_date) > convo.lastMessageTime) {
          convo.lastMessage = msg.body;
          convo.lastMessageTime = new Date(msg.created_date);
        }
        
        if (!msg.read && msg.recipient_email === userEmail) {
          convo.unreadCount++;
        }
      });

      // Sort by last message time
      const sorted = Array.from(conversationMap.values()).sort(
        (a, b) => b.lastMessageTime - a.lastMessageTime
      );
      
      setConversations(sorted);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleSendMessage = async (recipientId, recipientEmail, recipientName, body, fileUrls = []) => {
    try {
      await base44.entities.Message.create({
        sender_name: user.full_name,
        sender_email: user.email,
        sender_type: user.role === 'contractor' ? 'contractor' : 'customer',
        recipient_id: recipientId,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        subject: 'Project Discussion',
        body,
        file_urls: fileUrls,
        payment_id: null, // Could require payment in future
      });

      setSelectedConversation(null);
      await fetchConversations(user.email);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.otherParty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 lg:p-8">
        {/* Sidebar - Conversations List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </div>

          <Button
            onClick={() => setShowNewMessage(true)}
            className="m-4 w-auto bg-blue-600 hover:bg-blue-700"
          >
            + New Message
          </Button>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <p>No conversations yet</p>
              </div>
            ) : (
              filteredConversations.map(conv => (
                <button
                  key={conv.key}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 border-b border-slate-100 text-left hover:bg-slate-50 transition-colors ${
                    selectedConversation?.key === conv.key ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{conv.otherName}</h3>
                      <p className="text-sm text-slate-600 truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(conv.lastMessageTime).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px] lg:h-[800px]">
          {showNewMessage ? (
            <NewMessageForm
              user={user}
              onMessageSent={() => {
                setShowNewMessage(false);
                setSelectedConversation(null);
                fetchConversations(user.email);
              }}
              onCancel={() => setShowNewMessage(false)}
            />
          ) : selectedConversation ? (
            <MessageConversation
              conversation={selectedConversation}
              user={user}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              <div className="text-center">
                <p className="mb-4">Select a conversation or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}