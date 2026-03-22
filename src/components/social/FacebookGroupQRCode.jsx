import React from 'react';
import QRCode from 'qrcode.react';
import { Users } from 'lucide-react';

export default function FacebookGroupQRCode({ groupUrl = 'https://www.facebook.com/groups/surfcoastcmp', size = 256, showLabel = true }) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-lg">
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl">
        <QRCode
          value={groupUrl}
          size={size}
          level="H"
          includeMargin={true}
          fgColor="#1877F2"
          bgColor="#FFFFFF"
        />
      </div>
      
      {showLabel && (
        <div className="flex items-center gap-2 text-blue-600">
          <Users className="w-5 h-5" />
          <span className="font-bold text-lg">SurfCoast CMP Group</span>
        </div>
      )}
    </div>
  );
}