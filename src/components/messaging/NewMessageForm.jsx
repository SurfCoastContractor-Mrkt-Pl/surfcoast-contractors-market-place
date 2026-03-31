import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search } from 'lucide-react';

export default function NewMessageForm({ user, onMessageSent, onCancel }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [messageBody, setMessageBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setRecipients([]);
      return;
    }

    const searchRecipients = async () => {
      try {
        setLoading(true);
        
        // Search market shops/vendors
        const marketShops = await base44.entities.MarketShop.filter(
          { shop_name: { $regex: searchTerm, $options: 'i' } },
          'shop_name',
          10
        );

        const results = [];

        if (marketShops) {
          results.push(
            ...marketShops
              .filter(shop => shop.email !== user.email)
              .map(shop => ({
                id: shop.id,
                name: shop.shop_name,
                email: shop.email,
                type: 'vendor',
              }))
          );
        }

        setRecipients(results);
      } catch (error) {
        console.error('Error searching vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchRecipients, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, user.email]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedRecipient || !messageBody.trim()) return;

    setSending(true);
    try {
      await base44.entities.ConsumerVendorMessage.create({
        shop_id: selectedRecipient.id,
        shop_name: selectedRecipient.name,
        consumer_email: user.email,
        consumer_name: user.full_name,
        vendor_email: selectedRecipient.email,
        message: messageBody,
        message_type: 'other',
      });

      onMessageSent();
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
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">New Message</h3>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {!selectedRecipient ? (
        // Recipient Search
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Which vendor would you like to message?
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by vendor name..."
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : recipients.length === 0 && searchTerm ? (
            <div className="text-center py-8 text-slate-500">
              <p>No vendors found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recipients.map(recipient => (
                <button
                  key={`${recipient.email}`}
                  onClick={() => setSelectedRecipient(recipient)}
                  className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{recipient.name}</p>
                      <p className="text-sm text-slate-600 truncate">{recipient.email}</p>
                    </div>
                    <span className="ml-2 text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 flex-shrink-0">
                      vendor
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Message Compose
        <form onSubmit={handleSendMessage} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 border-b border-slate-200">
            <div className="mb-6">
              <p className="text-sm text-slate-600 mb-1">To:</p>
              <p className="font-semibold text-slate-900">{selectedRecipient.name}</p>
              <p className="text-sm text-slate-600">{selectedRecipient.email}</p>
            </div>

            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Your Message
            </label>
            <textarea
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="Type your message here..."
              className="w-full h-40 p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />
          </div>

          <div className="p-6 bg-white flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedRecipient(null)}
              disabled={sending}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={!messageBody.trim() || sending}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {sending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}