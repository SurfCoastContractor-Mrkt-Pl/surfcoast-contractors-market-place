import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Calendar, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function EarningsReportsDashboard({ contractorEmail, contractorId }) {
  const [timeRange, setTimeRange] = useState('all');

  const { data: scopes = [] } = useQuery({
    queryKey: ['earningsScopes', contractorEmail],
    queryFn: () => base44.entities.ScopeOfWork.filter({ contractor_email: contractorEmail, status: 'closed' }),
    enabled: !!contractorEmail
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['earningsPayments', contractorEmail],
    queryFn: () => base44.entities.Payment.filter({ contractor_email: contractorEmail, status: 'confirmed' }),
    enabled: !!contractorEmail
  });

  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const recentScopes = timeRange === 'all' ? scopes 
                        : timeRange === '30' ? scopes.filter(s => new Date(s.closed_date) > thirtyDaysAgo)
                        : scopes.filter(s => new Date(s.closed_date) > ninetyDaysAgo);

    const totalEarnings = recentScopes.reduce((sum, s) => {
      const projectTotal = s.cost_amount || 0;
      const platformFee = (projectTotal * (s.platform_fee_percentage || 18)) / 100;
      return sum + (projectTotal - platformFee);
    }, 0);

    const avgProjectValue = recentScopes.length > 0 ? totalEarnings / recentScopes.length : 0;
    
    return {
      totalEarnings,
      projectsCompleted: recentScopes.length,
      avgProjectValue,
      totalPlatformFees: recentScopes.reduce((sum, s) => sum + (s.platform_fee_amount || 0), 0)
    };
  }, [scopes, timeRange]);

  const chartData = useMemo(() => {
    const grouped = {};
    scopes.forEach(scope => {
      const date = new Date(scope.closed_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!grouped[date]) grouped[date] = 0;
      grouped[date] += (scope.cost_amount - (scope.platform_fee_amount || 0)) || 0;
    });
    return Object.entries(grouped).map(([date, amount]) => ({ date, earnings: parseFloat(amount.toFixed(2)) }));
  }, [scopes]);

  const categoryData = useMemo(() => {
    const byTrade = {};
    scopes.forEach(scope => {
      const trade = scope.contractor_type === 'trade_specific' ? 'Trade Specialty' : 'General';
      if (!byTrade[trade]) byTrade[trade] = 0;
      byTrade[trade] += scope.cost_amount || 0;
    });
    return Object.entries(byTrade).map(([name, value]) => ({ name, value }));
  }, [scopes]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const costTypeBreakdown = useMemo(() => {
    const breakdown = { hourly: 0, fixed: 0 };
    scopes.forEach(scope => {
      if (scope.cost_type === 'hourly') breakdown.hourly += scope.cost_amount || 0;
      else breakdown.fixed += scope.cost_amount || 0;
    });
    return [
      { name: 'Hourly', value: breakdown.hourly },
      { name: 'Fixed', value: breakdown.fixed }
    ];
  }, [scopes]);

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setTimeRange('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            timeRange === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All Time
        </button>
        <button
          onClick={() => setTimeRange('30')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            timeRange === '30' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Last 30 Days
        </button>
        <button
          onClick={() => setTimeRange('90')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            timeRange === '90' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Last 90 Days
        </button>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-slate-900">${stats.totalEarnings.toFixed(2)}</p>
            </div>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Projects Completed</p>
              <p className="text-2xl font-bold text-slate-900">{stats.projectsCompleted}</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Avg Project Value</p>
              <p className="text-2xl font-bold text-slate-900">${stats.avgProjectValue.toFixed(2)}</p>
            </div>
            <Calendar className="w-5 h-5 text-amber-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Platform Fees Paid</p>
              <p className="text-2xl font-bold text-slate-900">${stats.totalPlatformFees.toFixed(2)}</p>
            </div>
            <Zap className="w-5 h-5 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Earnings Trend</TabsTrigger>
          <TabsTrigger value="breakdown">Type Breakdown</TabsTrigger>
          <TabsTrigger value="details">Project Details</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Earnings Over Time</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Line type="monotone" dataKey="earnings" stroke="#3b82f6" name="Earnings" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-500 py-8">No earnings data yet</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">By Work Type</h3>
              {costTypeBreakdown.some(item => item.value > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={costTypeBreakdown.filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costTypeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-slate-500 py-8">No data</p>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">By Category</h3>
              {categoryData.some(item => item.value > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-slate-500 py-8">No data</p>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Details</h3>
            {scopes.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {scopes.map(scope => (
                  <div key={scope.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{scope.job_title}</p>
                      <p className="text-sm text-slate-600">{scope.customer_name}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(scope.closed_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        ${(scope.cost_amount - (scope.platform_fee_amount || 0)).toFixed(2)}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {scope.cost_type === 'fixed' ? 'Fixed' : 'Hourly'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">No completed projects</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}