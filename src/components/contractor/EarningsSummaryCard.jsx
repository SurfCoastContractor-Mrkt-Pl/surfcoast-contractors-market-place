import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, DollarSign } from 'lucide-react';

export default function EarningsSummaryCard({ totalEarnings, monthlyEarnings, pendingEarnings }) {
  const earningsTrend = monthlyEarnings > 0 ? '+' : '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Earnings */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1">Total Earnings</p>
            <p className="text-3xl font-bold text-blue-900">${totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-blue-600 mt-2">Lifetime</p>
          </div>
          <div className="p-3 bg-blue-200 rounded-lg">
            <DollarSign className="w-6 h-6 text-blue-700" />
          </div>
        </div>
      </Card>

      {/* Monthly Earnings */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-green-600 mb-1">This Month</p>
            <p className="text-3xl font-bold text-green-900">${monthlyEarnings.toFixed(2)}</p>
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {earningsTrend}${Math.abs(monthlyEarnings).toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-green-200 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-700" />
          </div>
        </div>
      </Card>

      {/* Pending Payouts */}
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-amber-600 mb-1">Pending Payout</p>
            <p className="text-3xl font-bold text-amber-900">${pendingEarnings.toFixed(2)}</p>
            <p className="text-xs text-amber-600 mt-2">Awaiting payment</p>
          </div>
          <div className="p-3 bg-amber-200 rounded-lg">
            <DollarSign className="w-6 h-6 text-amber-700" />
          </div>
        </div>
      </Card>
    </div>
  );
}