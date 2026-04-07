import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import EarningsSummaryCard from '@/components/contractor/EarningsSummaryCard';
import JobsCompletedWidget from '@/components/contractor/JobsCompletedWidget';
import PlatformFeesBreakdown from '@/components/contractor/PlatformFeesBreakdown';
import RecentPaymentsTable from '@/components/contractor/RecentPaymentsTable';
import CRMSyncPanel from '@/components/crm/CRMSyncPanel';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card } from '@/components/ui/card';
import { TrendingUp, Calendar } from 'lucide-react';
import ExampleBanner from '@/components/examples/ExampleBanner';
import useExampleVisibility from '@/hooks/useExampleVisibility';

const EXAMPLE_PAYMENT = {
  id: 'example-payment',
  purpose: 'Bathroom Plumbing Repair — John Smith',
  amount: 492.00,
  status: 'confirmed',
  confirmed_at: '2026-03-15T10:00:00Z',
};

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

  const completedJobs = contractor?.completed_jobs_count || 0;
  const { showExamples, toggleExamples, autoHidden } = useExampleVisibility('financial_dashboard', completedJobs);

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
    shadow: "3px 3px 0px #5C3500",
  };

  if (!contractor) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ color: T.muted, fontStyle: "italic" }}>Loading contractor data...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 16px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.4rem)", fontWeight: 800, color: T.dark, margin: "0 0 8px 0", fontStyle: "italic" }}>Financial Dashboard</h1>
          <p style={{ color: T.muted, fontStyle: "italic" }}>Track your earnings, payouts, and job completion metrics</p>
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

        {/* CRM Integration */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">CRM Integration</h3>
          <CRMSyncPanel connectorName="-build as needed" userType="contractor" />
        </Card>

        {/* Example Entry */}
        <ExampleBanner showExamples={showExamples} onToggle={toggleExamples} autoHidden={autoHidden}>
          <div className="p-4 bg-white rounded-lg border border-amber-200">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-3 tracking-wide">Example Payout Record</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{EXAMPLE_PAYMENT.purpose}</p>
                <p className="text-sm text-slate-500">Completed: Mar 15, 2026</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-600">${EXAMPLE_PAYMENT.amount.toFixed(2)}</p>
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Paid Out</span>
              </div>
            </div>
          </div>
        </ExampleBanner>

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