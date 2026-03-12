import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';

const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://surfcoastcontractormarketplace.com';

export default function AppQRCode() {
  const qrRef = useRef(null);

  const handleDownload = async () => {
    const card = qrRef.current?.querySelector('div');
    if (!card) return;
    const canvas = await html2canvas(card, { backgroundColor: null, scale: 2 });
    const a = document.createElement('a');
    a.download = 'surfcoast-qrcode.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  return (
    <section className="py-14 bg-slate-50">
      <div className="max-w-xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Scan to Visit</h2>
        <p className="text-slate-500 mb-8 text-sm">
          Share this QR code on flyers, business cards, or social media to bring people straight to SurfCoast.
        </p>

        {/* Branded QR card — this is what gets downloaded */}
        <div
          ref={qrRef}
          className="inline-block"
        >
          <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-5 w-72">
            {/* Logo + Name */}
            <div className="flex flex-col items-center gap-3">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a61a047827463e7cdbc1eb/1984e69ad_IMG_8260.jpeg"
                alt="SurfCoast Logo"
                className="w-16 h-16 object-contain rounded-xl"
              />
              <div>
                <div className="text-amber-400 font-bold text-xl leading-tight">SurfCoast</div>
                <div className="text-slate-300 text-xs font-medium tracking-wide leading-snug">
                  Contractor Market Place
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-2xl p-3">
              <QRCodeSVG
                value={APP_URL}
                size={180}
                bgColor="#ffffff"
                fgColor="#1e293b"
                level="H"
                includeMargin={false}
              />
            </div>

            {/* URL */}
            <p className="text-slate-400 text-xs font-mono break-all text-center">{APP_URL}</p>

            {/* Tagline */}
            <p className="text-slate-300 text-xs text-center">
              Find skilled contractors or grow your business
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={handleDownload}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold gap-2"
          >
            <Download className="w-4 h-4" />
            Download QR Code
          </Button>
        </div>
      </div>
    </section>
  );
}