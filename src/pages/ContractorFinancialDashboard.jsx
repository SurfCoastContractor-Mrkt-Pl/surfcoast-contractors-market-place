import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import EarningsSummaryCard from '@/components/contractor/EarningsSummaryCard';
import JobsCompletedWidget from '@/components/contractor/JobsCompletedWidget';
import PlatformFeesBreakdown from '@/components/contractor/PlatformFeesBreakdown';
import RecentPaymentsTable from '@/components/contractor/RecentPaymentsTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card } from '@/components/ui/card';
import { TrendingUp, Calendar } from 'lucide-react';

export default function ContractorFinancialDashboard() {
  // Fetch contractor data
  const { data: contractor } = useQuery({
    queryKey: ['contractor', 'current'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return null;
      const contractors = await base44.entities.Contractor.filter({ email: user.email });
      return contractors?.[0];
    }
  });

  // Fetch scope of work data for earnings
  const { data: scopes = [] } = useQuery({
    queryKey: ['scopes', contractor?.id],
    queryFn: async () => {
      if (!contractor?.email) return [];
      return await base44.asServiceRole.entities.ScopeOfWork.filter(
        { contractor_email: contractor.email },
        '-updated_date',
        100
      );
    },
    enabled: !!contractor?.email
  });

  // Fetch payment data
  const { data: payments = [] } = useQuery({
    queryKey: ['payments', contractor?.email],
    queryFn: async () => {
      if (!contractor?.email) return [];
      return await base44.asServiceRole.entities.Payment.filter(
        { contractor_email: contractor.email },
        '-created_date',
        100
      );
    },
    enabled: !!contractor?.email
  });

  // Calculate financial metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Completed scopes
    const completedScopes = scopes.filter(s => s.status === 'closed');
    
    // Calculate earnings
    let totalEarnings = 0;
    let monthlyEarnings = 0;
    let platformFeesTotal = 0;
    let jobValue = 0;

    completedScopes.forEach(scope => {
      const amount = scope.contractor_payout_amount || 0;
      const fee = scope.platform_fee_amount || 0;
      
      totalEarnings += amount;
      jobValue += amount + fee;
      platformFeesTotal += fee;

      // Check if in current month
      const scopeDate = new Date(scope.closed_date || scope.updated_date);
      if (scopeDate.getMonth() === currentMonth && scopeDate.getFullYear() === currentYear) {
        monthlyEarnings += amount;
      }
    });

    // Pending payouts
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const pendingEarnings = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Job metrics
    const inProgressScopes = scopes.filter(s => s.status === 'approved');
    const totalJobs = scopes.length;

    // Monthly earnings by month (last 6 months)
    const monthlyData = {};
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toLocaleString('en-US', { month: 'short' });
      monthlyData[month] = 0;
    }

    completedScopes.forEach(scope => {
      const scopeDate = new Date(scope.closed_date || scope.updated_date);
      const month = scopeDate.toLocaleString('en-US', { month: 'short' });
      if (monthlyData.hasOwnProperty(month)) {
        monthlyData[month] += scope.contractor_payout_amount || 0;
      }
    });

    const earningsChartData = Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      earnings: amount
    }));

    return {
      totalEarnings,
      monthlyEarnings,
      pendingEarnings,
      platformFees: platformFeesTotal,
      jobValue,
      completedJobs: completedScopes.length,
      inProgressJobs: inProgressScopes.length,
      totalJobs,
      earningsChartData,
      feesData: {
        yourEarnings: totalEarnings,
        platformFees: platformFeesTotal,
        feePercentage: 18
      }
    };
  }, [scopes, payments]);

  if (!contractor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-600">Loading contractor data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Financial Dashboard</h1>
          <p className="text-slate-600">Track your earnings, payouts, and job completion metrics</p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8">
          <EarningsSummaryCard
            totalEarnings={metrics.totalEarnings}
            monthlyEarnings={metrics.monthlyEarnings}
            pendingEarnings={metrics.pendingEarnings}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Jobs Overview */}
          <div className="lg:col-span-1">
            <JobsCompletedWidget
              totalJobs={metrics.totalJobs}
              completedJobs={metrics.completedJobs}
              inProgressJobs={metrics.inProgressJobs}
            />
          </div>

          {/* Platform Fees */}
          <div className="lg:col-span-2">
            <PlatformFeesBreakdown
              feesData={metrics.feesData}
              totalChargedFees={metrics.platformFees}
            />
          </div>
        </div>

        {/* Earnings Trend Chart */}
        <Card className="p-6 mb-8">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Earnings Trend (Last 6 Months)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={300} minWidth={300}>
              <BarChart data={metrics.earningsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `$${value.toFixed(2)}`}
                  contentStyle={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="earnings" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Payouts */}
        <RecentPaymentsTable payments={payments} />

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-slate-600 mb-1">Total Job Value</p>
            <p className="text-2xl font-bold text-slate-900">${metrics.jobValue.toFixed(2)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-slate-600 mb-1">Completion Rate</p>
            <p className="text-2xl font-bold text-slate-900">
              {metrics.totalJobs > 0 ? Math.round((metrics.completedJobs / metrics.totalJobs) * 100) : 0}%
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-slate-600 mb-1">Avg Job Earnings</p>
            <p className="text-2xl font-bold text-slate-900">
              ${metrics.completedJobs > 0 ? (metrics.totalEarnings / metrics.completedJobs).toFixed(2) : '0.00'}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-slate-600 mb-1">Profile Tier</p>
            <p className="text-2xl font-bold text-slate-900">{contractor?.profile_tier || 'Standard'}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}