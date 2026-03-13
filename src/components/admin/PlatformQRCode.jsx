import React from 'react';
import QRCode from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function PlatformQRCode() {
  const platformUrl = 'https://vagabond-build-connect-pros.base44.app';
  const qrRef = React.useRef();

  const downloadQR = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      const link = document.createElement('a');
      link.download = 'platform-qr-code.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2 className="text-2xl font-bold">Platform QR Code</h2>
      <div ref={qrRef} className="p-4 bg-white rounded-lg border border-slate-200">
        <QRCode 
          value={platformUrl} 
          size={256}
          level="H"
          includeMargin={true}
        />
      </div>
      <p className="text-sm text-slate-600">{platformUrl}</p>
      <Button onClick={downloadQR} className="gap-2">
        <Download className="w-4 h-4" />
        Download QR Code
      </Button>
    </div>
  );
}