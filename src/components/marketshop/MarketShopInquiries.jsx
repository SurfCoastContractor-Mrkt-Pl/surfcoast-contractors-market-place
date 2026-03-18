import React, { useState, useEffect } from 'react';
import { MessageSquare, Calendar, Copy, Loader2, X, Send, Reply as ReplyIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function MarketShopInquiries({ shop }) {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadInquiries = async () => {
      try {
        if (!shop?.id) return;
        const data = await base44.entities.VendorInquiry.filter({ shop_id: shop.id }, '-created_date', 100);
        setInquiries(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadInquiries();
  }, [shop?.id]);

  const handleExpandCard = async (inquiry) => {
    setExpandedId(expandedId === inquiry.id ? null : inquiry.id);
    if (expandedId !== inquiry.id && !inquiry.read) {
      await base44.entities.VendorInquiry.update(inquiry.id, { read: true });
      setInquiries(prev => prev.map(i => i.id === inquiry.id ? { ...i, read: true } : i));
    }
  };

  const handleReply = async (inquiryId) => {
    const text = replyText[inquiryId];
    if (!text?.trim()) return;

    setSubmitting({ ...submitting, [inquiryId]: true });
    try {
      await base44.entities.VendorInquiry.update(inquiryId, {
        vendor_reply: text,
        vendor_replied_at: new Date().toISOString(),
        status: 'replied',
      });
      setInquiries(prev => prev.map(i =>
        i.id === inquiryId
          ? { ...i, vendor_reply: text, vendor_replied_at: new Date().toISOString(), status: 'replied' }
          : i
      ));
      setReplyText({ ...replyText, [inquiryId]: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to send reply');
    } finally {
      setSubmitting({ ...submitting, [inquiryId]: false });
    }
  };

  const handleClose = async (inquiryId) => {
    try {
      await base44.entities.VendorInquiry.update(inquiryId, { status: 'closed' });
      setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, status: 'closed' } : i));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shop?.share_link || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const unreadCount = inquiries.filter(i => !i.read).length;

  if (!shop?.id) return null;

  const statusColors = {
    pending: 'bg-blue-100 text-blue-700',
    replied: 'bg-green-100 text-green-700',
    closed: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Messages & Inquiries</h2>
          {unreadCount > 0 && (
            <span className="ml-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">{unreadCount}</span>
          )}
        </div>
      </div>

      {/* Share Link */}
      {shop?.share_link && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mb-2">Your Share Link</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shop.share_link}
              readOnly
              className="flex-1 text-xs sm:text-sm px-3 py-2 bg-white border border-slate-300 rounded font-mono text-slate-600"
            />
            <button
              onClick={handleCopyLink}
              className="p-2 hover:bg-slate-200 rounded transition-colors flex-shrink-0"
              title="Copy link"
            >
              <Copy className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          {copied && <p className="text-xs text-green-600 mt-1">Copied!</p>}
        </div>
      )}

      {/* Inquiries */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <MessageSquare className="w-10 sm:w-12 h-10 sm:h-12 text-slate-300 mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-slate-500 font-medium">No messages yet</p>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Share your profile link to start getting inquiries</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {inquiries.map(inquiry => (
            <div
              key={inquiry.id}
              className={`border rounded-lg sm:rounded-xl transition-all ${
                expandedId === inquiry.id ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <button
                onClick={() => handleExpandCard(inquiry)}
                className="w-full text-left p-3 sm:p-4 flex items-start justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900 text-sm sm:text-base">{inquiry.visitor_name}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${statusColors[inquiry.status] || statusColors.pending}`}>
                      {inquiry.status}
                    </span>
                    {!inquiry.read && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(inquiry.created_date).toLocaleDateString()} • {inquiry.visitor_email}
                  </p>
                  {!expandedId && (
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-2">{inquiry.message}</p>
                  )}
                </div>
              </button>

              {expandedId === inquiry.id && (
                <div className="border-t border-slate-200 p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Message</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{inquiry.message}</p>
                  </div>

                  {inquiry.vendor_reply && (
                    <div className="bg-slate-100 rounded p-3 border-l-4 border-green-500">
                      <p className="text-xs font-semibold text-slate-600 mb-1">Your Reply</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{inquiry.vendor_reply}</p>
                    </div>
                  )}

                  {!inquiry.vendor_reply && (
                    <div className="space-y-2">
                      <textarea
                        value={replyText[inquiry.id] || ''}
                        onChange={e => setReplyText({ ...replyText, [inquiry.id]: e.target.value })}
                        placeholder="Type your reply..."
                        className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
                      <button
                        onClick={() => handleReply(inquiry.id)}
                        disabled={submitting[inquiry.id] || !replyText[inquiry.id]?.trim()}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[40px]"
                      >
                        {submitting[inquiry.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send Reply
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {inquiry.status !== 'closed' && (
                      <button
                        onClick={() => handleClose(inquiry.id)}
                        className="flex items-center justify-center gap-1 px-3 py-2 border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold rounded-lg hover:bg-slate-50 min-h-[40px]"
                      >
                        <X className="w-4 h-4" />
                        Close
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}