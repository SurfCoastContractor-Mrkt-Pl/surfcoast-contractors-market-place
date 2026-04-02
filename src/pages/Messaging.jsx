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
              onSendMessage={(shopId, vendorEmail, shopName, body) => handleSendMessage(shopId, vendorEmail, shopName, body)}
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