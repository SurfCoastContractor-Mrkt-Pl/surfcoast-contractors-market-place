import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Gift, Share2 } from 'lucide-react';
import ReferralShareModal from './ReferralShareModal';

export default function ReferralDashboard({ userEmail }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  const { data: referrals } = useQuery({
    queryKey: ['referrals', userEmail],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: userEmail }),
    enabled: !!userEmail,
  });

  const completed = referrals?.filter(r => r.status === 'completed_first_job') || [];
  const pending = referrals?.filter(r => r.status === 'pending' || r.status === 'signed_up') || [];
  const totalCredits = completed.length * 50;

  if (!referralCode && referrals?.length > 0) {
    setReferralCode(referrals[0].referral_code);
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{referrals?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Gift className="w-4 h-4 text-green-600" />
              Credits Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">${totalCredits}</p>
            <p className="text-xs text-slate-500 mt-1">{completed.length} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-600" />
              Pending Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">${pending.length * 50}</p>
            <p className="text-xs text-slate-500 mt-1">{pending.length} in progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Share Button */}
      <Button 
        onClick={() => setShareOpen(true)}
        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
        size="lg"
      >
        <Share2 className="w-5 h-5 mr-2" />
        Share Referral Link
      </Button>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
          <CardDescription>Track your referral progress</CardDescription>
        </CardHeader>
        <CardContent>
          {referrals?.length > 0 ? (
            <div className="space-y-3">
              {referrals.map(ref => (
                <div key={ref.id} className="border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{ref.referred_name || ref.referred_email}</p>
                    <p className="text-xs text-slate-500">{ref.referred_email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={
                      ref.status === 'completed_first_job' ? 'bg-green-100 text-green-800' :
                      ref.status === 'signed_up' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }>
                      {ref.status === 'completed_first_job' ? 'Completed' : ref.status === 'signed_up' ? 'Signed Up' : 'Pending'}
                    </Badge>
                    {ref.status === 'completed_first_job' && (
                      <span className="font-semibold text-green-600">+$50</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No referrals yet</p>
              <p className="text-sm text-slate-500">Share your link to start earning credits</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ReferralShareModal 
        referralCode={referralCode}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}