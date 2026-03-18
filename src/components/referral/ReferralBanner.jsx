import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Share2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ReferralBanner({ user, isTrialActive, trialDaysRemaining }) {
  const [dismissed, setDismissed] = useState(false);
  const [referralCode, setReferralCode] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dismissed && isTrialActive && user?.email) {
      generateCode();
    }
  }, [user?.email, isTrialActive]);

  const generateCode = async () => {
    setLoading(true);
    try {
      const res = await fetch('/functions/generateReferralCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.referral_code) {
        setReferralCode(data.referral_code);
      }
    } catch (error) {
      console.error('Error generating referral code:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (referralCode) {
      const text = `Join me on SurfCoast! Use code: ${referralCode} → ${window.location.origin}`;
      navigator.clipboard.writeText(text);
      toast.success('Copied! Share it with your network.');
    }
  };

  if (dismissed || !isTrialActive || !referralCode) return null;

  return (
    <Card className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 mb-1">
            Help Us Grow — Extend Your Trial
          </h3>
          <p className="text-sm text-slate-600 mb-3">
            SurfCoast is brand new. Share your link with 5 people. When they sign up and complete their profile, you earn <strong>+1 day</strong> of free trial access. <em>Offer expires when your trial ends.</em>
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white rounded-lg p-2 border border-slate-200">
              <span className="text-sm font-mono text-slate-700">{referralCode}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={copyCode}
              className="gap-1.5 text-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Link
            </Button>
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700"
              onClick={copyCode}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}