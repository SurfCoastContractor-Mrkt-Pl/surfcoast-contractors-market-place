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
  const [eligibleForMessaging, setEligibleForMessaging] = useState(false);

  useEffect(() => {
    const initializeMessaging = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          base44.auth.redirectToLogin('/Messaging');
          return;
        }
        setUser(currentUser);
        
        // Check eligibility: must be consumer without contractor/customer accounts OR vendor/market shop
        const [contractors, customers, marketShops] = await Promise.all([
          base44.entities.Contractor.filter({ email: currentUser.email }),
          base44.entities.CustomerProfile.filter({ email: currentUser.email }),
          base44.entities.MarketShop.filter({ email: currentUser.email }),
        ]);

        const isContractor = contractors && contractors.length > 0;
        const isCustomer = customers && customers.length > 0;
        const isMarketVendor = marketShops && marketShops.length > 0;

        // Eligible if: (no contractor AND no customer) OR is a vendor/market shop
        const eligible = (!isContractor && !isCustomer) || isMarketVendor;
        setEligibleForMessaging(eligible);

        if (eligible) {
          // Fetch conversations
          await fetchConversations(currentUser.email);
          
          // Subscribe to message updates
          const unsubscribe = base44.entities.ConsumerVendorMessage.subscribe((event) => {
            if (event.type === 'create' || event.type === 'update') {
              fetchConversations(currentUser.email);
            }
          });
          
          return unsubscribe;
        }
      } catch (error) {
        console.error('Error initializing messaging:', error);
      } finally {
        setLoading(false);
      }
    };

    let unsubscribeFn = null;
    initializeMessaging().then(unsub => {
      if (unsub) unsubscribeFn = unsub;
    });
    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, []);

  const fetchConversations = async (userEmail) => {
    try {
      // Get messages where user is consumer or vendor
      const [consumerMessages, vendorMessages] = await Promise.all([
        base44.entities.ConsumerVendorMessage.filter({ consumer_email: userEmail }),
        base44.entities.ConsumerVendorMessage.filter({ vendor_email: userEmail }),
      ]);

      const allMessages = [...(consumerMessages || []), ...(vendorMessages || [])];
      
      // Group by conversation
      const conversationMap = new Map();
      
      allMessages.forEach(msg => {
        const otherParty = msg.consumer_email === userEmail ? msg.vendor_email : msg.consumer_email;
        const otherName = msg.consumer_email === userEmail ? msg.shop_name : msg.consumer_name;
        const key = [userEmail, otherParty].sort().join('|');
        
        if (!conversationMap.has(key)) {
          conversationMap.set(key, {
            key,
            otherParty,
            otherName,
            shopId: msg.shop_id,
            messages: [],
            lastMessage: null,
            lastMessageTime: new Date(0),
            unreadCount: 0,
          });
        }
        
        const convo = conversationMap.get(key);
        convo.messages.push(msg);
        
        if (new Date(msg.created_date) > convo.lastMessageTime) {
          convo.lastMessage = msg.message;
          convo.lastMessageTime = new Date(msg.created_date);
        }
        
        if (!msg.read && msg.vendor_email === userEmail) {
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

  const handleSendMessage = async (shopId, vendorEmail, shopName, body) => {
    try {
      // Determine sender type based on whether they're a vendor or consumer
      const isVendor = user && shopId && vendorEmail === user.email;
      
      if (isVendor) {
        // Vendor sending to consumer
        const conversation = conversations.find(c => c.shopId === shopId);
        await base44.entities.ConsumerVendorMessage.create({
          shop_id: shopId,
          shop_name: shopName,
          consumer_email: conversation?.otherParty,
          consumer_name: conversation?.otherName,
          vendor_email: user.email,
          message: body,
          message_type: 'other',
        });
      } else {
        // Consumer sending to vendor
        await base44.entities.ConsumerVendorMessage.create({
          shop_id: shopId,
          shop_name: shopName,
          consumer_email: user.email,
          consumer_name: user.full_name,
          vendor_email: vendorEmail,
          message: body,
          message_type: 'other',
        });
      }

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

  if (!eligibleForMessaging) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Messaging Unavailable</h2>
          <p className="text-slate-600 mb-4">
            This messaging hub is for consumers and market vendors. Contractors and customers have a dedicated messaging system built into their job postings, scopes of work, and proposals.
          </p>
          <p className="text-sm text-slate-500">
            Go to your <strong>Account → Scopes</strong> tab to open project chats with your contractor or customer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 flex-shrink-0">
        <h2 className="text-xl font-bold text-slate-900">Messages</h2>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6 p-4 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Mobile: Show conversation list only if no selection; Desktop: Always show */}
        {!selectedConversation && !showNewMessage && (
          <div className="flex flex-col w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex-shrink-0">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm h-10"
                />
              </div>
              <Button
                onClick={() => setShowNewMessage(true)}
                className="w-full h-10 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm"
              >
                + New Message
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  <p>No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map(conv => (
                  <button
                    key={conv.key}
                    onClick={() => setSelectedConversation(conv)}
                    className="w-full p-4 border-b border-slate-100 text-left hover:bg-slate-50 active:bg-blue-50 transition-colors min-h-16 flex flex-col justify-center"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 truncate text-sm">{conv.otherName}</h3>
                      {conv.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 truncate">{conv.lastMessage}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(conv.lastMessageTime).toLocaleDateString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat or Form Area */}
        {showNewMessage ? (
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex-shrink-0 p-4 border-b border-slate-200 flex items-center justify-between lg:hidden">
              <h3 className="font-semibold text-slate-900">New Message</h3>
              <button
                onClick={() => setShowNewMessage(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <NewMessageForm
              user={user}
              onMessageSent={() => {
                setShowNewMessage(false);
                setSelectedConversation(null);
                fetchConversations(user.email);
              }}
              onCancel={() => setShowNewMessage(false)}
            />
          </div>
        ) : selectedConversation ? (
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex-shrink-0 p-4 border-b border-slate-200 flex items-center justify-between lg:hidden">
              <h3 className="font-semibold text-slate-900 truncate">{selectedConversation.otherName}</h3>
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <MessageConversation
              conversation={selectedConversation}
              user={user}
              onSendMessage={(shopId, vendorEmail, shopName, body) => handleSendMessage(shopId, vendorEmail, shopName, body)}
            />
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex items-center justify-center hidden lg:flex">
            <div className="text-center text-slate-500">
              <p className="mb-4 font-medium">Select a conversation or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}