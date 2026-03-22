import React from 'react';
import QRCode from 'qrcode.react';
import { Facebook } from 'lucide-react';

export default function FacebookQRCode({ profileUrl = 'https://www.facebook.com/profile.php?id=61578790505003', size = 256, showLabel = true }) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-lg">
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl">
        <QRCode
          value={profileUrl}
          size={size}
          level="H"
          includeMargin={true}
          fgColor="#1877F2"
          bgColor="#FFFFFF"
        />
      </div>
      
      {showLabel && (
        <div className="flex items-center gap-2 text-blue-600">
          <Facebook className="w-5 h-5" />
          <span className="font-bold text-lg">SurfCoast Marketplace</span>
        </div>
      )}
    </div>
  );
}