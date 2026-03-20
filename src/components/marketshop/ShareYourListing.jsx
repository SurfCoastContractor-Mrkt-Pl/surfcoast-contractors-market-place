import React, { useState } from 'react';
import { Copy, Lightbulb, Facebook, Instagram, Music, Twitter } from 'lucide-react';

export default function ShareYourListing({ shop }) {
  const [copied, setCopied] = useState(false);

  if (!shop?.subscription_status === 'active') {
    return null;
  }

  const shareLink = shop.share_link || `https://surfcoastcmp.base44.app/MarketShopProfile/${shop.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=Check+out+my+shop+on+SurfCoast!&url=${encodeURIComponent(shareLink)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-3 sm:p-4">
      {/* Header */}
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Share Your Listing</h3>

      {/* Share Link Input - Compact */}
      <div className="mb-3">
        <div className="flex gap-1.5 items-center">
          <input
            type="text"
            value={shareLink}
            readOnly
            className="flex-1 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-300 text-slate-700 text-xs focus:outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="px-2.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            {copied ? '✅' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Social Share Icons - Compact */}
      <div className="flex flex-wrap gap-1.5">
        {/* Facebook */}
        <button
          onClick={handleFacebookShare}
          className="p-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          title="Share on Facebook"
        >
          <Facebook className="w-3 h-3" />
        </button>

        {/* Instagram */}
        <button
          className="p-1.5 rounded-md text-white transition-colors"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          title="Copy link for Instagram bio"
        >
          <Instagram className="w-3 h-3" />
        </button>

        {/* TikTok */}
        <button
          className="p-1.5 rounded-md bg-black hover:bg-slate-900 text-white transition-colors"
          title="Copy link for TikTok bio"
        >
          <Music className="w-3 h-3" />
        </button>

        {/* Twitter/X */}
        <button
          onClick={handleTwitterShare}
          className="p-1.5 rounded-md bg-black hover:bg-slate-900 text-white transition-colors"
          title="Share on Twitter/X"
        >
          <Twitter className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}