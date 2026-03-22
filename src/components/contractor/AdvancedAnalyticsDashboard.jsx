import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Star, Clock, AlertCircle } from 'lucide-react';

export default function AdvancedAnalyticsDashboard({ contractorEmail, contractorId }) {
  const { data: scopes = [] } = useQuery({
    queryKey: ['analyticsScopes', contractorEmail],
    queryFn: () => base44.entities.ScopeOfWork.filter({ contractor_email: contractorEmail }),
    enabled: !!contractorEmail
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['analyticsReviews', contractorId],
    queryFn: () => base44.entities.Review.filter({ contractor_id: contractorId }),
    enabled: !!contractorId
  });

  const { data: jobNotifications = [] } = useQuery({
    queryKey: ['jobNotifications', contractorEmail],
    queryFn: () => base44.entities.JobNotification.filter({ contractor_email: contractorEmail }),
    enabled: !!contractorEmail
  });

  const analytics = useMemo(() => {
    const completedScopes = scopes.filter(s => s.status === 'closed');
    const approvedScopes = scopes.filter(s => s.status === 'approved');
    const pendingScopes = scopes.filter(s => s.status === 'pending_approval');

    const totalRevenue = completedScopes.reduce((sum, s) => sum + (s.cost_amount || 0), 0);
    const avgProjectValue = completedScopes.length > 0 ? totalRevenue / completedScopes.length : 0;
    
    const completionRate = scopes.length > 0 ? (completedScopes.length / scopes.length) * 100 : 0;
    const approvalRate = approvedScopes.length > 0 ? ((approvedScopes.length + completedScopes.length) / scopes.length) * 100 : 0;

    const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length) : 0;
    const responseRate = jobNotifications.length > 0 ? (jobNotifications.filter(n => n.contractor_responded).length / jobNotifications.length) * 100 : 0;

    return {
      completedScopes,
      approvedScopes,
      pendingScopes,
      totalRevenue,
      avgProjectValue,
      completionRate,
      approvalRate,
      avgRating,
      responseRate,
      totalProjects: scopes.length,
      totalReviews: reviews.length,
      totalOpportunities: jobNotifications.length
    };
  }, [scopes, reviews, jobNotifications]);

  const timelineData = useMemo(() => {
    const grouped = {};
    scopes.forEach(scope => {
      const month = new Date(scope.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!grouped[month]) grouped[month] = { projects: 0, revenue: 0 };
      grouped[month].projects += 1;
      grouped[month].revenue += scope.cost_amount || 0;
    });
    return Object.entries(grouped).map(([month, data]) => ({
      month,
      projects: data.projects,
      revenue: parseFloat(data.revenue.toFixed(2))
    }));
  }, [scopes]);

  const statusBreakdown = [
    { name: 'Completed', value: analytics.completedScopes.length, color: '#10b981' },
    { name: 'Approved', value: analytics.approvedScopes.length, color: '#3b82f6' },
    { name: 'Pending', value: analytics.pendingScopes.length, color: '#f59e0b' }
  ];

  const ratingDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => dist[r.overall_rating] += 1);
    return [
      { stars: '5⭐', count: dist[5] },
      { stars: '4⭐', count: dist[4] },
      { stars: '3⭐', count: dist[3] },
      { stars: '2⭐', count: dist[2] },
      { stars: '1⭐', count: dist[1] }
    ];
  }, [reviews]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-xs text-slate-600 mb-1">Completion Rate</div>
          <div className="text-2xl font-bold text-slate-900">{analytics.completionRate.toFixed(0)}%</div>
          <div className="text-xs text-slate-500 mt-1">{analytics.completedScopes.length}/{analytics.totalProjects}</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-slate-600 mb-1">Approval Rate</div>
          <div className="text-2xl font-bold text-slate-900">{analytics.approvalRate.toFixed(0)}%</div>
          <div className="text-xs text-slate-500 mt-1">Customer approved</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-slate-600 mb-1">Avg Rating</div>
          <div className="text-2xl font-bold text-slate-900">{analytics.avgRating.toFixed(1)}⭐</div>
          <div className="text-xs text-slate-500 mt-1">{analytics.totalReviews} reviews</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-slate-600 mb-1">Response Rate</div>
          <div className="text-2xl font-bold text-slate-900">{analytics.responseRate.toFixed(0)}%</div>
          <div className="text-xs text-slate-500 mt-1">To opportunities</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-slate-600 mb-1">Avg Project Value</div>
          <div className="text-2xl font-bold text-slate-900">${analytics.avgProjectValue.toFixed(0)}</div>
          <div className="text-xs text-slate-500 mt-1">Per completed</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-slate-600 mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-green-600">${analytics.totalRevenue.toFixed(0)}</div>
          <div className="text-xs text-slate-500 mt-1">All time</div>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="status">Status Breakdown</TabsTrigger>
          <TabsTrigger value="ratings">Rating Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Projects & Revenue Over Time</h3>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="projects" fill="#3b82f6" name="Projects" />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-500 py-8">No project data yet</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Status Distribution</h3>
            {statusBreakdown.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusBreakdown.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-500 py-8">No projects yet</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="ratings">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Customer Rating Distribution</h3>
            {ratingDistribution.some(item => item.count > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stars" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-500 py-8">No reviews yet</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-slate-900 mb-3">📊 Performance Insights</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          {analytics.completionRate < 80 && (
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              Focus on completing more projects to build momentum
            </li>
          )}
          {analytics.avgRating >= 4.5 && (
            <li>✓ Excellent customer satisfaction rating</li>
          )}
          {analytics.responseRate < 50 && (
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              Respond to more job opportunities to increase bookings
            </li>
          )}
          {analytics.avgProjectValue > 1500 && (
            <li>✓ Strong average project value indicates premium positioning</li>
          )}
        </ul>
      </Card>
    </div>
  );
}