import React from 'react';
import QRCode from 'qrcode.react';
import { Instagram } from 'lucide-react';

export default function InstagramQRCode({ handle = 'surfcoastmkt_pl', size = 256, showHandle = true }) {
  const instagramUrl = `https://instagram.com/${handle}`;

  return (
    <div className="flex flex-col items-center gap-2 border-2 border-amber-600 p-2 rounded-lg">
      <QRCode
        value={instagramUrl}
        size={size}
        level="H"
        includeMargin={true}
        fgColor="#D97706"
        bgColor="#FFFFFF"
      />
      
      {showHandle && (
        <div className="flex items-center gap-1 text-amber-700 text-xs">
          <Instagram className="w-3 h-3" />
          <span className="font-bold">@{handle}</span>
        </div>
      )}
    </div>
  );
}