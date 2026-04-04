import React, { useMemo } from 'react';
import { TrendingUp, Award, Zap, Clock, DollarSign, Star, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContractorAnalyticsMetrics({ contractorProfile, completedScopes, allReviews }) {
  const metrics = useMemo(() => {
    if (!contractorProfile || !completedScopes) {
      return null;
    }

    // Count completed jobs (all-time)
    const totalJobsCompleted = completedScopes.length;
    
    // This month (current calendar month)
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const jobsThisMonth = completedScopes.filter(
      s => new Date(s.closed_date) >= thisMonthStart
    ).length;

    // Total earnings (all-time)
    const totalEarnings = completedScopes.reduce(
      (sum, s) => sum + (s.contractor_payout_amount || s.cost_amount * 0.82), 0
    );

    // Earnings this month
    const earningsThisMonth = completedScopes
      .filter(s => new Date(s.closed_date) >= thisMonthStart)
      .reduce((sum, s) => sum + (s.contractor_payout_amount || s.cost_amount * 0.82), 0);

    // Average job value
    const avgJobValue = totalJobsCompleted > 0 ? totalEarnings / totalJobsCompleted : 0;

    // Completion rate (closed scopes / all contractor scopes)
    const completionRate = 0; // Will be calculated in parent

    // Reviews this month
    const reviewsThisMonth = (allReviews || []).filter(
      r => new Date(r.created_date) >= thisMonthStart
    ).length;

    // Avg rating from reviews this month
    const avgRatingThisMonth = reviewsThisMonth > 0
      ? ((allReviews || [])
          .filter(r => new Date(r.created_date) >= thisMonthStart)
          .reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reviewsThisMonth)
      : 0;

    // Legend status: 300+ jobs completed
    const isLegend = totalJobsCompleted >= 300;
    const legendProgress = totalJobsCompleted;

    // Unique customers (from contractor profile)
    const uniqueCustomers = contractorProfile.unique_customers_count || 0;

    return {
      totalJobsCompleted,
      jobsThisMonth,
      totalEarnings,
      earningsThisMonth,
      avgJobValue,
      reviewsThisMonth,
      avgRatingThisMonth,
      uniqueCustomers,
      isLegend,
      legendProgress,
    };
  }, [contractorProfile, completedScopes, allReviews]);

  if (!metrics) {
    return <div className="text-center text-slate-400">Loading metrics...</div>;
  }

  const metricCards = [
    {
      label: 'Jobs Completed',
      value: metrics.totalJobsCompleted.toLocaleString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      subtext: `${metrics.jobsThisMonth} this month`,
    },
    {
      label: 'Earnings (All-Time)',
      value: `$${(metrics.totalEarnings / 100).toFixed(0)}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      subtext: `$${(metrics.earningsThisMonth / 100).toFixed(0)} this month`,
    },
    {
      label: 'Avg Job Value',
      value: `$${(metrics.avgJobValue / 100).toFixed(0)}`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      subtext: 'Average payout per job',
    },
    {
      label: 'New Reviews',
      value: metrics.reviewsThisMonth.toString(),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      subtext: `Avg: ${metrics.avgRatingThisMonth.toFixed(1)} ⭐ this month`,
    },
    {
      label: 'Unique Customers',
      value: metrics.uniqueCustomers.toString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      subtext: 'Total clients served',
    },
    {
      label: 'Legend Status',
      value: metrics.isLegend ? '🏆 LEGEND' : `${metrics.legendProgress}/300`,
      icon: Award,
      color: metrics.isLegend ? 'text-amber-600' : 'text-slate-600',
      bgColor: metrics.isLegend ? 'bg-amber-50' : 'bg-slate-50',
      subtext: metrics.isLegend ? 'SurfCoast Legend Achieved!' : 'Jobs to Legend status',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metricCards.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <Card key={idx} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`${metric.bgColor} p-2.5 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-slate-900 mb-1">{metric.value}</p>
              <p className="text-xs text-slate-500">{metric.subtext}</p>

              {/* Legend progress bar */}
              {metric.label === 'Legend Status' && !metrics.isLegend && (
                <div className="mt-3">
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all"
                      style={{ width: `${Math.min((metrics.legendProgress / 300) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}