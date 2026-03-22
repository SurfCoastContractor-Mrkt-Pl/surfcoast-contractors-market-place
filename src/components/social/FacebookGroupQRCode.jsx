import React from 'react';
import QRCode from 'qrcode.react';
import { Users } from 'lucide-react';

export default function FacebookGroupQRCode({ groupUrl = 'https://www.facebook.com/groups/surfcoastcmp', size = 256, showLabel = true }) {
  return (
    <div className="flex flex-col items-center gap-2 border-2 border-blue-600 p-2 rounded-lg">
      <QRCode
        value={groupUrl}
        size={size}
        level="H"
        includeMargin={true}
        fgColor="#1877F2"
        bgColor="#FFFFFF"
      />
      
      {showLabel && (
        <div className="flex items-center gap-1 text-blue-600 text-xs">
          <Users className="w-3 h-3" />
          <span className="font-bold">SurfCoast CMP Group</span>
        </div>
      )}
    </div>
  );
}