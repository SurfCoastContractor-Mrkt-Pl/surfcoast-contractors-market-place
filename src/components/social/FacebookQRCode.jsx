import React from 'react';
import QRCode from 'qrcode.react';
import { Facebook } from 'lucide-react';

export default function FacebookQRCode({ profileUrl = 'https://www.facebook.com/profile.php?id=61578790505003', size = 256, showLabel = true }) {
  return (
    <div className="flex flex-col items-center gap-2 border-2 border-blue-600 p-2 rounded-lg">
      <QRCode
        value={profileUrl}
        size={size}
        level="H"
        includeMargin={true}
        fgColor="#1877F2"
        bgColor="#FFFFFF"
      />
      
      {showLabel && (
        <div className="flex items-center gap-1 text-blue-600 text-xs">
          <Facebook className="w-3 h-3" />
          <span className="font-bold">SurfCoast Marketplace</span>
        </div>
      )}
    </div>
  );
}