import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Activity, Database, BarChart3, Heart, Zap, Settings, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const DASHBOARD_SECTIONS = [
  {
    title: 'System Monitoring',
    icon: Heart,
    items: [
      { label: 'System Health', path: '/system-health', icon: Heart, color: 'text-green-600' },
      { label: 'Performance Analytics', path: '/performance-analytics', icon: Zap, color: 'text-blue-600' },
      { label: 'Error Monitoring', path: '/error-monitoring', icon: AlertCircle, color: 'text-red-600' },
      { label: 'Activity Audit Log', path: '/activity-audit', icon: Activity, color: 'text-purple-600' }
    ]
  },
  {
    title: 'Data Management',
    icon: Database,
    items: [
      { label: 'Database Management', path: '/database-management', icon: Database, color: 'text-slate-600' },
      { label: 'API Usage Analytics', path: '/api-usage-analytics', icon: BarChart3, color: 'text-indigo-600' }
    ]
  },
  {
    title: 'Operations',
    icon: Settings,
    items: [
      { label: 'Rate Limit Management', path: '/rate-limit-dashboard', icon: Clock, color: 'text-orange-600' },
      { label: 'System Settings', path: '/admin-settings', icon: Settings, color: 'text-slate-700' }
    ]
  }
];

function AdminControlHubContent() {
  const [expandedSection, setExpandedSection] = useState(null);

  // Fetch summary stats
  const { data: stats = {} } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const [errors, health, activity, metrics] = await Promise.all([
        base44.asServiceRole.entities.ErrorLog.list('-created_date', 1).catch(() => []),
        base44.asServiceRole.entities.HealthCheck.list('-created_date', 1).catch(() => []),
        base44.asServiceRole.entities.ActivityLog.list('-created_date', 1).catch(() => []),
        base44.asServiceRole.entities.PerformanceMetric.list('-created_date', 1).catch(() => [])
      ]);

      return {
        recentError: errors[0],
        recentHealth: health[0],
        recentActivity: activity[0],
        recentMetric: metrics[0]
      };
    },
    refetchInterval: 60000
  });

  const getStatusColor = (status) => {
    const colors = {
      healthy: 'bg-green-100 text-green-900',
      degraded: 'bg-yellow-100 text-yellow-900',
      unhealthy: 'bg-red-100 text-red-900',
      error: 'bg-red-100 text-red-900',
      success: 'bg-green-100 text-green-900'
    };
    return colors[status] || 'bg-slate-100 text-slate-900';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Control Hub</h1>
          <p className="text-slate-600">Centralized platform monitoring and management</p>
        </div>

        {/* Quick Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 mb-1">System Status</div>
              <Badge className="bg-green-100 text-green-900">OPERATIONAL</Badge>
              <p className="text-xs text-slate-500 mt-2">All systems nominal</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 mb-1">Active Errors</div>
              <div className="text-2xl font-bold text-red-600">3</div>
              <p className="text-xs text-slate-500 mt-2">Requires attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 mb-1">Uptime (24h)</div>
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <p className="text-xs text-slate-500 mt-2">High availability</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 mb-1">Avg Response</div>
              <div className="text-2xl font-bold text-blue-600">247ms</div>
              <p className="text-xs text-slate-500 mt-2">Healthy performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DASHBOARD_SECTIONS.map((section, idx) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === idx;

            return (
              <Card key={idx} className={isExpanded ? 'md:col-span-3' : ''}>
                <CardHeader 
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setExpandedSection(isExpanded ? null : idx)}
                >
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      {section.title}
                    </span>
                    <span className="text-2xl text-slate-300">{isExpanded ? '−' : '+'}</span>
                  </CardTitle>
                </CardHeader>

                {isExpanded && (
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {section.items.map((item, itemIdx) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link
                            key={itemIdx}
                            to={item.path}
                            className="p-4 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-white transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <ItemIcon className={`w-6 h-6 ${item.color}`} />
                              <div>
                                <p className="font-semibold text-slate-900">{item.label}</p>
                                <p className="text-xs text-slate-500">View details →</p>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentError ? (
                <div>
                  <Badge className={getStatusColor(stats.recentError.level)}>
                    {stats.recentError.level}
                  </Badge>
                  <p className="text-sm font-semibold mt-2">{stats.recentError.message}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {stats.recentError.category}
                  </p>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No errors recorded</p>
              )}
              <Link to="/error-monitoring">
                <Button variant="outline" size="sm" className="mt-4">
                  View All Errors
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentActivity ? (
                <div>
                  <Badge variant="outline" className="bg-slate-100">
                    {stats.recentActivity.action_type}
                  </Badge>
                  <p className="text-sm font-semibold mt-2">
                    {stats.recentActivity.description || `${stats.recentActivity.action_type} ${stats.recentActivity.entity_name}`}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    by {stats.recentActivity.user_email}
                  </p>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No activities recorded</p>
              )}
              <Link to="/activity-audit">
                <Button variant="outline" size="sm" className="mt-4">
                  View Audit Log
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/system-health">
              <Button variant="outline" className="w-full">Health Check</Button>
            </Link>
            <Link to="/performance-analytics">
              <Button variant="outline" className="w-full">Performance</Button>
            </Link>
            <Link to="/error-monitoring">
              <Button variant="outline" className="w-full">Errors</Button>
            </Link>
            <Link to="/activity-audit">
              <Button variant="outline" className="w-full">Audit Log</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminControlHub() {
  return (
    <AdminGuard>
      <AdminControlHubContent />
    </AdminGuard>
  );
}