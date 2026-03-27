import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function WaveFOJobDensityChart({ scopes, selectedDate }) {
  const chartData = useMemo(() => {
    const data = [];
    const startDate = new Date(selectedDate);
    startDate.setDate(1);
    const endDate = new Date(selectedDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    const weekCounts = {};
    scopes.forEach(scope => {
      if (!scope.agreed_work_date) return;
      const date = new Date(scope.agreed_work_date + 'T00:00:00');
      if (date >= startDate && date <= endDate) {
        const weekNum = Math.ceil(date.getDate() / 7);
        const weekLabel = `Week ${weekNum}`;
        weekCounts[weekLabel] = (weekCounts[weekLabel] || 0) + 1;
      }
    });

    for (let i = 1; i <= 5; i++) {
      const label = `Week ${i}`;
      data.push({
        name: label,
        jobs: weekCounts[label] || 0
      });
    }

    return data;
  }, [scopes, selectedDate]);

  const totalJobs = chartData.reduce((sum, d) => sum + d.jobs, 0);
  const avgJobs = Math.round(totalJobs / chartData.length * 10) / 10;

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        <h3 className="text-white font-semibold">Monthly Job Density</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-slate-400 text-xs">Total Jobs</p>
          <p className="text-white text-2xl font-bold">{totalJobs}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-slate-400 text-xs">Avg per Week</p>
          <p className="text-white text-2xl font-bold">{avgJobs}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
            labelStyle={{ color: '#e2e8f0' }}
            itemStyle={{ color: '#3b82f6' }}
          />
          <Bar dataKey="jobs" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}