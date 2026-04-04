import React, { useMemo } from 'react';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function CompletionRateWidget({ completedScopes = [], totalScopes = [] }) {
  const metrics = useMemo(() => {
    const completed = completedScopes.length;
    const total = totalScopes.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, rate };
  }, [completedScopes, totalScopes]);

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-green-50 p-2.5 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Completion Rate</p>
            <p className="text-2xl font-bold text-slate-900">{metrics.rate}%</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          {metrics.completed} of {metrics.total} scopes completed
        </p>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-300"
            style={{ width: `${metrics.rate}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}