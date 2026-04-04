import React, { useMemo } from 'react';
import { Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ReferralsCompletedWidget({ referrals = [] }) {
  const metrics = useMemo(() => {
    const completed = (referrals || []).filter(r => r.status === 'completed').length;
    const pending = (referrals || []).filter(r => r.status !== 'completed').length;
    return { completed, pending };
  }, [referrals]);

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-purple-50 p-2.5 rounded-lg">
            <Gift className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Referrals Completed</p>
            <p className="text-2xl font-bold text-slate-900">{metrics.completed}</p>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          {metrics.pending} pending referral{metrics.pending !== 1 ? 's' : ''}
        </p>
        {metrics.completed > 0 && (
          <p className="text-xs text-purple-600 font-semibold mt-2">
            ✨ Refer friends to extend your trial!
          </p>
        )}
      </CardContent>
    </Card>
  );
}