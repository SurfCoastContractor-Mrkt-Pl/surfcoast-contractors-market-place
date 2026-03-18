import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Copy, Share2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ReferralModal({ isOpen, onClose, user, isFirstVisit }) {
  const [referralCode, setReferralCode] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && isFirstVisit && user?.email) {
      generateCode();
    }
  }, [isOpen, isFirstVisit, user?.email]);

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
      console.error('Error generating code:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (referralCode) {
      const url = `${window.location.origin}?ref=${referralCode}`;
      navigator.clipboard.writeText(url);
      toast.success('Link copied! Share it with your network.');
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">
            Help Us Grow. We're Just Getting Started.
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-slate-700 pt-2">
            SurfCoast is brand new, and we're building something real with people like you.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong>Here's the deal:</strong> Share your unique link with 5 people in your network. When they sign up, complete their profile, and pass verification, you'll earn <strong>+1 day of free trial</strong> — no strings attached.
          </p>

          {referralCode && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-3 border border-blue-200">
              <p className="text-xs font-medium text-slate-700">Your Referral Code:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={referralCode}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded font-mono text-slate-700"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyCode}
                  className="gap-1"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500 italic">
            This offer is active only during your free trial.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Maybe Later
          </Button>
          <Button
            onClick={() => {
              copyCode();
              onClose();
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
            disabled={!referralCode}
          >
            <Share2 className="w-4 h-4" />
            Share Now
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}