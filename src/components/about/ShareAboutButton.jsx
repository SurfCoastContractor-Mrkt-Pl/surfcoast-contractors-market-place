import React, { useState } from 'react';
import { Share2, Instagram, Facebook, Twitter, Link, Check, X } from 'lucide-react';

const PAGE_URL = 'https://surfcoastmarketplace.com/About';
const SHARE_TEXT = `Check out SurfCoast Marketplace — a platform built for the people who actually get things done. No shortcuts. Just work. 💪`;
const HASHTAGS = '#SurfCoastMarketplace #Trades #WorkEthic #BuildSomethingReal';

const PLATFORMS = [
  {
    id: 'facebook',
    label: 'Facebook',
    icon: Facebook,
    color: '#1877F2',
    hint: 'Post, Story or Reel',
    getUrl: () =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(PAGE_URL)}&quote=${encodeURIComponent(SHARE_TEXT)}`,
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    icon: Twitter,
    color: '#000000',
    hint: 'Tweet or Thread',
    getUrl: () =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT + ' ' + HASHTAGS)}&url=${encodeURIComponent(PAGE_URL)}`,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: Instagram,
    color: '#E1306C',
    hint: 'Open Instagram to share',
    getUrl: () => `https://www.instagram.com/`,
    copyOnClick: true, // also copy caption to clipboard
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: null,
    color: '#010101',
    hint: 'Copy link → paste in video',
    getUrl: () => null, // TikTok same — no direct web share URL
    customIcon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.52V6.75a4.85 4.85 0 01-1.02-.06z"/>
      </svg>
    ),
  },
];

export default function ShareAboutButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePlatform = (platform) => {
    const url = platform.getUrl?.();
    if (platform.copyOnClick) {
      // Copy caption first, then open the platform
      handleCopyLink();
    }
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    setOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${SHARE_TEXT}\n\n${PAGE_URL}\n\n${HASHTAGS}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = `${SHARE_TEXT}\n\n${PAGE_URL}\n\n${HASHTAGS}`;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = () => {
    // On mobile with native share support, use it; otherwise show dropdown immediately
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && navigator.share) {
      navigator.share({
        title: 'SurfCoast Marketplace — About Us',
        text: SHARE_TEXT,
        url: PAGE_URL,
      }).catch(() => {});
    } else {
      setOpen(true);
    }
  };

  return (
    <div className="relative inline-block">
      {/* Main Share Button */}
      <button
        onClick={handleNativeShare}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          background: 'rgba(249,115,22,0.15)',
          border: '1px solid rgba(249,115,22,0.4)',
          borderRadius: '999px',
          color: '#F97316',
          fontSize: '0.85rem',
          fontWeight: '700',
          cursor: 'pointer',
          letterSpacing: '0.05em',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.25)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(249,115,22,0.15)'}
      >
        <Share2 size={16} />
        Share Our Story
      </button>

      {/* Dropdown (fallback for non-native share) */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute left-0 z-50 mt-2 w-64 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: '#0d1b2a', border: '1px solid rgba(249,115,22,0.25)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#F97316' }}>Share Our Story</span>
              <button onClick={() => setOpen(false)} style={{ color: '#94a3b8' }}>
                <X size={14} />
              </button>
            </div>

            <div className="p-2 space-y-1">
              {PLATFORMS.map(platform => {
                const Icon = platform.icon;
                const CustomIcon = platform.customIcon;
                return (
                  <button
                    key={platform.id}
                    onClick={() => handlePlatform(platform)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left"
                    style={{ color: '#e2e8f0' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ color: platform.color }}>
                      {CustomIcon ? <CustomIcon /> : Icon && <Icon size={20} />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{platform.label}</p>
                      <p className="text-xs" style={{ color: '#64748b' }}>{platform.hint}</p>
                    </div>
                    {platform.copyOnClick && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(249,115,22,0.15)', color: '#F97316' }}>
                        Copy + Open
                      </span>
                    )}
                    {!platform.getUrl?.() && !platform.copyOnClick && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(249,115,22,0.15)', color: '#F97316' }}>
                        Copy
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Copy Link row */}
              <button
                onClick={() => { handleCopyLink(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left"
                style={{ color: '#e2e8f0' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {copied ? <Check size={20} className="text-green-400" /> : <Link size={20} style={{ color: '#94a3b8' }} />}
                <div>
                  <p className="text-sm font-semibold">{copied ? 'Copied!' : 'Copy Link + Caption'}</p>
                  <p className="text-xs" style={{ color: '#64748b' }}>Ready to paste anywhere</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Copied toast */}
      {copied && !open && (
        <div
          className="absolute left-0 mt-2 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 z-50"
          style={{ background: '#16a34a', color: '#fff', whiteSpace: 'nowrap' }}
        >
          <Check size={14} />
          Copied to clipboard!
        </div>
      )}
    </div>
  );
}