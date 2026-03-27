import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PerformanceAnalyticsDashboard({ contractorEmail, tierLevel }) {
  const [analytics, setAnalytics] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [contractorEmail, period]);

  const fetchAnalytics = async () => {
    try {
      const data = await base44.entities.PerformanceAnalytics.filter({ 
        contractor_email: contractorEmail,
        period: period
      });
      setAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (tierLevel !== 'rider') {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Advanced Analytics <Lock className="w-4 h-4 text-slate-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">Upgrade to Wave Rider for comprehensive performance analytics and insights.</p>
        </CardContent>
      </Card>
    );
  }

  const latestData = analytics[analytics.length - 1];

  const metrics = [
    { label: 'Jobs Completed', value: latestData?.jobs_completed || 0, icon: '📊' },
    { label: 'Avg Rating', value: (latestData?.average_rating || 0).toFixed(1), icon: '⭐' },
    { label: 'On-Time %', value: (latestData?.on_time_completion_percent || 0).toFixed(0) + '%', icon: '✅' },
    { label: 'Repeat Customers', value: (latestData?.repeat_customer_rate || 0).toFixed(0) + '%', icon: '🔄' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Performance Insights
            </CardTitle>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="bg-slate-50 rounded-lg p-4 text-center">
                <p className="text-2xl">{metric.icon}</p>
                <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                <p className="text-xs text-slate-600 mt-1">{metric.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {analytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Earnings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period_start" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total_earnings" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {analytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Jobs & Rating Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period_start" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="jobs_completed" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="average_rating" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}