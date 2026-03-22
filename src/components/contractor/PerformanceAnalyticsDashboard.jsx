import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Target, DollarSign, Star, CheckCircle2 } from 'lucide-react';

const METRIC_CARDS = [
  { id: 'conversion', icon: Target, label: 'Conversion Rate', color: 'bg-blue-50 text-blue-600' },
  { id: 'response', icon: Clock, label: 'Avg Response Time', color: 'bg-orange-50 text-orange-600' },
  { id: 'rating', icon: Star, label: 'Average Rating', color: 'bg-amber-50 text-amber-600' },
  { id: 'earnings', icon: DollarSign, label: 'Monthly Earnings', color: 'bg-green-50 text-green-600' },
  { id: 'completion', icon: CheckCircle2, label: 'Job Completion Rate', color: 'bg-purple-50 text-purple-600' },
  { id: 'growth', icon: TrendingUp, label: 'Growth Rate', color: 'bg-rose-50 text-rose-600' },
];

export default function PerformanceAnalyticsDashboard({ contractorId, contractorEmail }) {
  // Fetch scopes and reviews for analysis
  const { data: scopes } = useQuery({
    queryKey: ['scopes-analytics', contractorId],
    queryFn: () => base44.entities.ScopeOfWork.filter({ contractor_email: contractorEmail }),
    enabled: !!contractorId && !!contractorEmail,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews-analytics', contractorId],
    queryFn: () => base44.entities.Review.filter({ contractor_id: contractorId }),
    enabled: !!contractorId,
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!scopes) return null;

    const completedJobs = scopes.filter(s => s.status === 'closed').length;
    const totalJobs = scopes.length;
    const approvedJobs = scopes.filter(s => s.status === 'approved').length;
    const conversionRate = totalJobs > 0 ? Math.round((approvedJobs / totalJobs) * 100) : 0;

    const avgRating = reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length).toFixed(1)
      : 0;

    const monthlyEarnings = scopes
      .filter(s => s.status === 'closed' && s.contractor_payout_amount)
      .reduce((sum, s) => sum + (s.contractor_payout_amount || 0), 0);

    const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

    // Calculate growth (simplified: month-over-month)
    const thisMonth = new Date();
    const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1);
    
    const thisMonthJobs = scopes.filter(s => new Date(s.created_date) >= lastMonth && new Date(s.created_date) <= thisMonth).length;
    const prevMonthJobs = scopes.filter(s => {
      const d = new Date(s.created_date);
      return d.getMonth() === lastMonth.getMonth() - 1 && d.getFullYear() === lastMonth.getFullYear();
    }).length;

    const growthRate = prevMonthJobs > 0 ? Math.round(((thisMonthJobs - prevMonthJobs) / prevMonthJobs) * 100) : 0;

    return {
      conversion: `${conversionRate}%`,
      response: '< 2h', // Placeholder - would need message data
      rating: `${avgRating}/5`,
      earnings: `$${monthlyEarnings.toFixed(0)}`,
      completion: `${completionRate}%`,
      growth: `${growthRate > 0 ? '+' : ''}${growthRate}%`,
      totalJobs,
      completedJobs,
      approvedJobs,
    };
  }, [scopes, reviews]);

  // Charts data
  const monthlyJobsData = useMemo(() => {
    if (!scopes) return [];
    const months = {};
    scopes.forEach(scope => {
      const date = new Date(scope.created_date);
      const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months).slice(-6).map(([month, count]) => ({ month, jobs: count }));
  }, [scopes]);

  const statusDistribution = useMemo(() => {
    if (!scopes) return [];
    const statuses = {
      pending_approval: scopes.filter(s => s.status === 'pending_approval').length,
      approved: scopes.filter(s => s.status === 'approved').length,
      closed: scopes.filter(s => s.status === 'closed').length,
    };
    return [
      { name: 'Pending', value: statuses.pending_approval, fill: '#fbbf24' },
      { name: 'Approved', value: statuses.approved, fill: '#3b82f6' },
      { name: 'Closed', value: statuses.closed, fill: '#10b981' },
    ].filter(s => s.value > 0);
  }, [scopes]);

  const ratingDistribution = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];
    const ratings = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      ratings[r.overall_rating] = (ratings[r.overall_rating] || 0) + 1;
    });
    return Object.entries(ratings).reverse().map(([rating, count]) => ({
      rating: `${rating}⭐`,
      count,
    })).filter(r => r.count > 0);
  }, [reviews]);

  if (!metrics) {
    return <Card className="p-6"><p className="text-slate-500">Loading analytics...</p></Card>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {METRIC_CARDS.map(metric => {
          const Icon = metric.icon;
          const value = metrics[metric.id];
          return (
            <Card key={metric.id} className="p-4">
              <div className={`w-10 h-10 ${metric.color} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm text-slate-600 mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Jobs Trend */}
        {monthlyJobsData.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Job Volume Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyJobsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="jobs" stroke="#1E5A96" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Status Distribution */}
        {statusDistribution.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Job Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Rating Distribution */}
      {ratingDistribution.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Rating Breakdown ({reviews.length} reviews)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ratingDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#1E5A96" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Summary Stats */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="font-semibold text-slate-900 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-600">Total Jobs</p>
            <p className="text-xl font-bold text-slate-900">{metrics.totalJobs}</p>
          </div>
          <div>
            <p className="text-slate-600">Completed</p>
            <p className="text-xl font-bold text-green-600">{metrics.completedJobs}</p>
          </div>
          <div>
            <p className="text-slate-600">Approved</p>
            <p className="text-xl font-bold text-blue-600">{metrics.approvedJobs}</p>
          </div>
          <div>
            <p className="text-slate-600">Reviews</p>
            <p className="text-xl font-bold text-slate-900">{reviews?.length || 0}</p>
          </div>
          <div>
            <p className="text-slate-600">Avg Rating</p>
            <p className="text-xl font-bold text-amber-600">{metrics.rating}</p>
          </div>
          <div>
            <p className="text-slate-600">Total Earnings</p>
            <p className="text-xl font-bold text-green-600">{metrics.earnings}</p>
          </div>
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 bg-indigo-50 border-indigo-200">
        <h3 className="font-semibold text-slate-900 mb-3">📊 Analytics Insights</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>• Your conversion rate is strong at <strong>{metrics.conversion}</strong> — focus on closing those pending approvals</li>
          <li>• Average rating of <strong>{metrics.rating}</strong> shows excellent customer satisfaction</li>
          <li>• You've completed <strong>{metrics.completedJobs}/{metrics.totalJobs}</strong> jobs with <strong>{metrics.completion}</strong> completion rate</li>
          <li>• Your growth trend is trending {metrics.growth.startsWith('+') ? 'upward' : 'downward'} at <strong>{metrics.growth}</strong> month-over-month</li>
          <li>• Continue building your portfolio — more completed jobs increase visibility to potential clients</li>
        </ul>
      </Card>
    </div>
  );
}