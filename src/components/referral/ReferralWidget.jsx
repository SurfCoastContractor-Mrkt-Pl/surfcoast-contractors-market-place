import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Share2, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export default function ReferralWidget({ user, isTrialActive, referralsCompleted = 0 }) {
  const [referralCode, setReferralCode] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    if (isTrialActive && user?.email) {
      generateCode();
    }
  }, [user?.email, isTrialActive]);

  const generateCode = async () => {
    try {
      const res = await fetch('/functions/generateReferralCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.referral_code) {
        setReferralCode(data.referral_code);
        // Generate simple QR code URL (using QR server API)
        const referralUrl = `${window.location.origin}?ref=${data.referral_code}`;
        setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(referralUrl)}`);
      }
    } catch (error) {
      console.error('Error generating referral code:', error);
    }
  };

  const copyCode = () => {
    if (referralCode) {
      const url = `${window.location.origin}?ref=${referralCode}`;
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  if (!isTrialActive || !referralCode) return null;

  const refsNeeded = Math.max(0, 5 - referralsCompleted);
  const progress = referralsCompleted / 5;

  return (
    <Card className="p-5 bg-white border-blue-200">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900 text-sm mb-1">
          Grow Your Trial
        </h3>
        <p className="text-xs text-slate-600">
          {refsNeeded === 0 ? (
            <span className="text-green-600 font-medium">You've earned free trial extensions! 🎉</span>
          ) : (
            <>Share with {refsNeeded} more people to earn +1 day.</>
          )}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${Math.min(progress * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">{referralsCompleted}/5 signups</p>
      </div>

      {/* Code and actions */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={referralCode}
            readOnly
            className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={copyCode}
            className="text-xs gap-1"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
        </div>

        <button
          onClick={() => setShowQR(!showQR)}
          className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium py-1 flex items-center justify-center gap-1"
        >
          <QrCode className="w-3.5 h-3.5" />
          {showQR ? 'Hide' : 'Show'} QR Code
        </button>

        {showQR && qrUrl && (
          <div className="flex justify-center pt-2">
            <img src={qrUrl} alt="Referral QR Code" className="w-32 h-32 border border-slate-200 rounded" />
          </div>
        )}
      </div>
    </Card>
  );
}