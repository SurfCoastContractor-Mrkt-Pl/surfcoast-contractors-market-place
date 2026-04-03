import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Activity, Database, BarChart3, Heart, Zap, Settings, Clock, Users, Shield, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminGuard from '@/components/auth/AdminGuard';

const DASHBOARD_SECTIONS = [
  {
    title: 'System Monitoring',
    icon: Heart,
    color: 'text-green-600',
    items: [
      { label: 'System Health', path: '/system-health', icon: Heart, color: 'text-green-600', desc: 'Service status & uptime' },
      { label: 'Performance Analytics', path: '/performance-analytics', icon: Zap, color: 'text-blue-600', desc: 'Response times & throughput' },
      { label: 'Error Monitoring', path: '/error-monitoring', icon: AlertCircle, color: 'text-red-600', desc: 'Errors, warnings & alerts' },
      { label: 'Activity Audit Log', path: '/activity-audit', icon: Activity, color: 'text-purple-600', desc: 'User & system audit trail' },
    ]
  },
  {
    title: 'Data & Analytics',
    icon: Database,
    color: 'text-indigo-600',
    items: [
      { label: 'Database Management', path: '/database-management', icon: Database, color: 'text-slate-600', desc: 'Entity data & migrations' },
      { label: 'API Usage Analytics', path: '/api-usage-analytics', icon: BarChart3, color: 'text-indigo-600', desc: 'API calls & usage trends' },
      { label: 'Advanced Analytics', path: '/advanced-analytics', icon: BarChart3, color: 'text-violet-600', desc: 'Predictive & deep insights' },
      { label: 'Platform Activity', path: '/platform-activity', icon: Activity, color: 'text-sky-600', desc: 'Real-time platform events' },
    ]
  },
  {
    title: 'Platform Operations',
    icon: Settings,
    color: 'text-orange-600',
    items: [
      { label: 'Admin Dashboard', path: '/admin', icon: Shield, color: 'text-amber-600', desc: 'Vendors, contractors & reviews' },
      { label: 'Compliance Dashboard', path: '/ComplianceDashboard', icon: Shield, color: 'text-green-700', desc: 'License & compliance review' },
      { label: 'Contractor Verification', path: '/ContractorVerificationDashboard', icon: Users, color: 'text-blue-700', desc: 'ID & credential verification' },
      { label: 'Alert Management', path: '/alert-management', icon: AlertCircle, color: 'text-red-500', desc: 'Alerts & incident tracking' },
    ]
  }
];

function AdminControlHubContent() {
  const { data: stats = {}, refetch, isFetching } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const [errors, health, activity] = await Promise.all([
        base44.asServiceRole.entities.ErrorLog.list('-created_date', 5).catch(() => []),
        base44.asServiceRole.entities.HealthCheck.list('-created_date', 1).catch(() => []),
        base44.asServiceRole.entities.ActivityLog.list('-created_date', 5).catch(() => []),
      ]);
      return { errors, recentHealth: health[0], activities: activity };
    },
    refetchInterval: 60000
  });

  const getStatusColor = (status) => ({
    healthy: 'bg-green-100 text-green-800',
    degraded: 'bg-yellow-100 text-yellow-800',
    unhealthy: 'bg-red-100 text-red-800',
    error: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800',
  }[status] || 'bg-slate-100 text-slate-700');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Control Hub</h1>
            <p className="text-slate-500 text-sm mt-0.5">Platform monitoring, operations & management</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-800 border-0 text-xs px-3 py-1">● OPERATIONAL</Badge>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-2">
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Quick Nav Cards */}
        {DASHBOARD_SECTIONS.map((section, idx) => {
          const SectionIcon = section.icon;
          return (
            <div key={idx}>
              <div className="flex items-center gap-2 mb-4">
                <SectionIcon className={`w-4 h-4 ${section.color}`} />
                <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">{section.title}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {section.items.map((item, itemIdx) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={itemIdx}
                      to={item.path}
                      className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 transition-colors`}>
                          <ItemIcon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm leading-tight">{item.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Live Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Recent Errors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.errors?.length > 0 ? stats.errors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
                  <Badge className={`${getStatusColor(err.level)} border-0 text-xs flex-shrink-0`}>{err.level}</Badge>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{err.message}</p>
                    <p className="text-[10px] text-slate-500">{err.category}</p>
                  </div>
                </div>
              )) : (
                <p className="text-slate-400 text-sm py-4 text-center">✓ No recent errors</p>
              )}
              <Link to="/error-monitoring">
                <Button variant="outline" size="sm" className="mt-2 w-full text-xs">View Error Log →</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.activities?.length > 0 ? stats.activities.map((act, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
                  <Badge variant="outline" className="text-[10px] flex-shrink-0 border-slate-300">{act.action_type}</Badge>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">
                      {act.description || `${act.action_type} ${act.entity_name}`}
                    </p>
                    <p className="text-[10px] text-slate-500">{act.user_email}</p>
                  </div>
                </div>
              )) : (
                <p className="text-slate-400 text-sm py-4 text-center">No recent activity</p>
              )}
              <Link to="/activity-audit">
                <Button variant="outline" size="sm" className="mt-2 w-full text-xs">View Audit Log →</Button>
              </Link>
            </CardContent>
          </Card>
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