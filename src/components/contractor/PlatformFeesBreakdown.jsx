import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Info } from 'lucide-react';

const COLORS = ['#3b82f6', '#ef4444'];

export default function PlatformFeesBreakdown({ feesData, totalChargedFees }) {
  // Prepare data for pie chart
  const pieData = [
    { name: 'Your Earnings', value: feesData.yourEarnings || 0 },
    { name: 'Platform Fee', value: feesData.platformFees || 0 }
  ];

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Platform Fees Breakdown</h3>
        <p className="text-sm text-slate-600 flex items-center gap-1">
          <Info className="w-4 h-4" />
          {feesData.feePercentage || 18}% facilitation fee on all completed jobs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-1">Total Job Value</p>
            <p className="text-2xl font-bold text-blue-700">
              ${(feesData.yourEarnings + feesData.platformFees).toFixed(2)}
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-900 mb-1">Your Earnings</p>
            <p className="text-2xl font-bold text-green-700">${feesData.yourEarnings.toFixed(2)}</p>
            <p className="text-xs text-green-600 mt-1">After platform fees</p>
          </div>

          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-red-900 mb-1">Platform Fees Charged</p>
            <p className="text-2xl font-bold text-red-700">${feesData.platformFees.toFixed(2)}</p>
            <p className="text-xs text-red-600 mt-1">{feesData.feePercentage || 18}% facilitation fee</p>
          </div>
        </div>
      </div>
    </Card>
  );
}