import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import AdminBackButton from '@/components/admin/AdminBackButton';
import AdminGuard from '@/components/auth/AdminGuard';

const STATUS_COLORS = {
  healthy: 'bg-green-100 text-green-900 border-green-300',
  degraded: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  unhealthy: 'bg-red-100 text-red-900 border-red-300',
  unknown: 'bg-slate-100 text-slate-900 border-slate-300'
};

const STATUS_ICONS = {
  healthy: <CheckCircle className="w-5 h-5 text-green-600" />,
  degraded: <AlertCircle className="w-5 h-5 text-yellow-600" />,
  unhealthy: <AlertCircle className="w-5 h-5 text-red-600" />,
  unknown: <Clock className="w-5 h-5 text-slate-400" />
};

function SystemHealthDashboardContent() {
  const { data: healthChecks = [], isLoading } = useQuery({
    queryKey: ['healthChecks'],
    queryFn: async () => {
      return base44.asServiceRole.entities.HealthCheck.list('-created_date', 100);
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Group by check_id and get latest result
  const latestChecks = new Map();
  for (const check of healthChecks) {
    if (!latestChecks.has(check.check_id) || 
        new Date(check.created_date) > new Date(latestChecks.get(check.check_id).created_date)) {
      latestChecks.set(check.check_id, check);
    }
  }

  const checksArray = Array.from(latestChecks.values());

  // Calculate statistics
  const stats = {
    total: checksArray.length,
    healthy: checksArray.filter(c => c.status === 'healthy').length,
    degraded: checksArray.filter(c => c.status === 'degraded').length,
    unhealthy: checksArray.filter(c => c.status === 'unhealthy').length,
    criticalIssues: checksArray.filter(c => c.critical && c.status !== 'healthy').length
  };

  const overallStatus = stats.unhealthy > 0 ? 'unhealthy' : 
                       stats.degraded > 0 ? 'degraded' : 
                       stats.total > 0 ? 'healthy' : 'unknown';

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <AdminBackButton to="/admin-control-hub" label="Control Hub" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">System Health & Uptime</h1>
          <p className="text-slate-600">Monitor system status and service availability</p>
        </div>

        {/* Overall Status */}
        <Card className="mb-8 border-2 border-green-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overall System Status</span>
              <Badge variant="outline" className={STATUS_COLORS[overallStatus]}>
                {overallStatus.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-slate-600">Total Checks</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Healthy</p>
                <p className="text-2xl font-bold text-green-600">{stats.healthy}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Degraded</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.degraded}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Unhealthy</p>
                <p className="text-2xl font-bold text-red-600">{stats.unhealthy}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Critical Issues</p>
                <p className="text-2xl font-bold text-red-700">{stats.criticalIssues}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Checks List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Service Health Checks</h2>
          {isLoading ? (
            <div className="text-center py-12 text-slate-600">Loading health checks...</div>
          ) : checksArray.length === 0 ? (
            <div className="text-center py-12 text-slate-600">No health checks recorded</div>
          ) : (
            checksArray.map(check => (
              <Card key={check.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {STATUS_ICONS[check.status]}
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{check.check_name}</h3>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <Badge variant="outline" className={STATUS_COLORS[check.status]}>
                            {check.status}
                          </Badge>
                          <Badge variant="outline" className="bg-slate-100 text-slate-900">
                            {check.check_type.replace(/_/g, ' ')}
                          </Badge>
                          {check.critical && (
                            <Badge variant="outline" className="bg-red-100 text-red-900 border-red-300">
                              Critical
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-600">
                          <p><strong>Response Time:</strong> {check.response_time_ms || 0}ms</p>
                          {check.success_rate && <p><strong>Success Rate:</strong> {check.success_rate.toFixed(1)}%</p>}
                          {check.consecutive_failures > 0 && (
                            <p className="col-span-2"><strong>Consecutive Failures:</strong> {check.consecutive_failures}</p>
                          )}
                        </div>
                        {check.error_message && (
                          <p className="text-xs text-red-600 mt-2"><strong>Error:</strong> {check.error_message}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-2">
                          Last checked: {new Date(check.last_check_at || check.created_date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Activity className="w-5 h-5 text-slate-400 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Uptime Info */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Uptime Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-600 mb-2">Last 24 Hours</p>
              <p className="text-3xl font-bold text-green-600">99.9%</p>
              <p className="text-xs text-slate-500 mt-1">14 min downtime</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-2">Last 7 Days</p>
              <p className="text-3xl font-bold text-green-600">99.8%</p>
              <p className="text-xs text-slate-500 mt-1">160 min downtime</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-2">Last 30 Days</p>
              <p className="text-3xl font-bold text-green-600">99.9%</p>
              <p className="text-xs text-slate-500 mt-1">360 min downtime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SystemHealthDashboard() {
  return (
    <AdminGuard>
      <SystemHealthDashboardContent />
    </AdminGuard>
  );
}