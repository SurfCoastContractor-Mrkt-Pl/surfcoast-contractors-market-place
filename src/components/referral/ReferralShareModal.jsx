import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Mail, Share2 } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function ReferralShareModal({ referralCode, open, onClose }) {
  const [copied, setCopied] = useState(false);
  const referralUrl = `${window.location.origin}${createPageUrl('Home')}?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    const subject = "Join SurfCoast - Get $50 Platform Credit";
    const body = `Check out SurfCoast! Use my referral link to get a $50 platform credit (applied to your account, not cash): ${referralUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share & Earn Credits</DialogTitle>
          <DialogDescription>
            Invite friends and earn a <strong>$50 platform credit</strong> (not cash) for every friend who completes their first job.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm font-medium text-amber-900 mb-2">Your Referral Link</p>
            <div className="flex gap-2">
              <Input 
                value={referralUrl} 
                readOnly 
                className="text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                <Copy className="w-4 h-4 mr-1" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Quick Share</p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={shareViaEmail}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => {
                  navigator.share?.({
                    title: 'Join SurfCoast',
                    text: 'Get a $50 platform credit when you join SurfCoast',
                    url: referralUrl,
                  });
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-slate-600 uppercase">How it works</p>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>✓ Friend signs up with your link</li>
              <li>✓ They complete their first job</li>
              <li>✓ You both get a <strong>$50 platform credit</strong> applied to your account</li>
              <li className="text-slate-400 italic">Credits are not redeemable for cash</li>
            </ul>
          </div>

          <Button onClick={onClose} className="w-full">Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}