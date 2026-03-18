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
    <div className="mb-8 rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg p-6 sm:p-8">
      {/* Header */}
      <h2 className="text-xl font-bold text-white mb-6">Share Your Listing</h2>

      {/* Share Link Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">Your Shareable Link</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={shareLink}
            readOnly
            className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            {copied ? '✅ Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* Social Share Buttons */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">Share on Social Media</label>
        <div className="flex flex-wrap gap-3">
          {/* Facebook */}
          <button
            onClick={handleFacebookShare}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center gap-2"
          >
            📘 Facebook
          </button>

          {/* Instagram */}
          <div className="relative group">
            <button
              className="px-4 py-2.5 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              📸 Instagram
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 whitespace-nowrap z-10">
              Copy your link and paste it in your Instagram bio or story
            </div>
          </div>

          {/* TikTok */}
          <div className="relative group">
            <button
              className="px-4 py-2.5 rounded-lg bg-black hover:bg-slate-900 text-white font-medium transition-colors flex items-center gap-2"
            >
              🎵 TikTok
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 whitespace-nowrap z-10">
              Copy your link and add it to your TikTok bio
            </div>
          </div>

          {/* Twitter/X */}
          <button
            onClick={handleTwitterShare}
            className="px-4 py-2.5 rounded-lg bg-black hover:bg-slate-900 text-white font-medium transition-colors flex items-center gap-2"
          >
            🐦 Twitter/X
          </button>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="rounded-lg bg-slate-800 border border-slate-700 p-4 flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-amber-400">Pro tip:</span> Add your SurfCoast link to ALL your social media bios to get the most visibility.
        </p>
      </div>
    </div>
  );
}