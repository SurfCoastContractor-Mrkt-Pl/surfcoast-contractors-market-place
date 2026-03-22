import React from 'react';
import QRCode from 'qrcode.react';
import { Instagram } from 'lucide-react';

export default function InstagramQRCode({ handle = 'surfcoastmkt_pl', size = 256, showHandle = true }) {
  const instagramUrl = `https://instagram.com/${handle}`;

  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-lg">
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-xl">
        <QRCode
          value={instagramUrl}
          size={size}
          level="H"
          includeMargin={true}
          fgColor="#D97706"
          bgColor="#FFFFFF"
        />
      </div>
      
      {showHandle && (
        <div className="flex items-center gap-2 text-amber-700">
          <Instagram className="w-5 h-5" />
          <span className="font-bold text-lg">@{handle}</span>
        </div>
      )}
    </div>
  );
}