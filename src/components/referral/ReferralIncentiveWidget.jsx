import React, { useState } from 'react';
import { Gift, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function ReferralIncentiveWidget() {
  const [showDetails, setShowDetails] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  React.useEffect(() => {
    const fetchReferralCode = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          const referrals = await base44.entities.Referral.filter({ 
            referrer_email: user.email 
          });
          if (referrals && referrals.length > 0) {
            setReferralCode(referrals[0].referral_code);
          }
        }
      } catch (e) {
        console.error('Error fetching referral code:', e);
      }
    };
    fetchReferralCode();
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-slate-900">Earn Free Credits</h3>
            <p className="text-sm text-slate-600">Refer professionals & get rewarded</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="text-slate-700">Refer a contractor → They join → You both earn</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-slate-700">$50 credit per successful referral</span>
        </div>
      </div>

      {referralCode && (
        <div className="bg-white rounded-lg p-3 mb-4 border border-blue-200">
          <p className="text-xs text-slate-600 mb-2">Your referral code:</p>
          <div className="flex items-center justify-between">
            <code className="text-sm font-bold text-blue-600">{referralCode}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(referralCode);
              }}
              className="text-xs px-2 py-1 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDetails(!showDetails)}
        className="w-full"
      >
        {showDetails ? 'Hide Details' : 'Learn More'}
      </Button>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-blue-200 text-sm text-slate-700 space-y-2">
          <p><strong>How it works:</strong></p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Share your referral code with friends</li>
            <li>They sign up and complete their profile</li>
            <li>You both get $50 in platform credits</li>
            <li>Use credits for quote requests, featured listings, etc.</li>
          </ol>
        </div>
      )}
    </div>
  );
}