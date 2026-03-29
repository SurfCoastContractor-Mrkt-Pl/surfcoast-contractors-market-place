import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Loader, AlertCircle } from 'lucide-react';
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function RealtimeAnalyticsDashboard({ contractorEmail }) {
  const { analytics, loading, error } = useRealtimeAnalytics(contractorEmail);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-400" />
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  if (!analytics) return null;

  const { totalJobs, completedJobs, earningsThisMonth, jobTrends, statusDistribution, topDays } = analytics;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Total Jobs</p>
          <p className="text-white text-3xl font-bold">{totalJobs}</p>
        </div>
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Completed</p>
          <p className="text-green-400 text-3xl font-bold">{completedJobs}</p>
        </div>
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Earnings (30d)</p>
          <p className="text-blue-400 text-3xl font-bold">${earningsThisMonth?.toLocaleString()}</p>
        </div>
      </div>

      {/* Job Trends Chart */}
      {jobTrends?.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <p className="text-white font-semibold mb-4">Job Activity (30 Days)</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={jobTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="jobs" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Status Distribution */}
      {statusDistribution?.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <p className="text-white font-semibold mb-4">Job Status Distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusDistribution} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value">
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-4">
            {statusDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-sm text-slate-400">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Days */}
      {topDays?.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <p className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Busiest Days
          </p>
          <div className="space-y-2">
            {topDays.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-slate-400">{day.dayOfWeek}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${(day.jobCount / (topDays[0]?.jobCount || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-white font-semibold text-sm">{day.jobCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}