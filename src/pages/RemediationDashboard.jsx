import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, XCircle, Zap } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-slate-100 text-slate-900',
  executing: 'bg-blue-100 text-blue-900',
  success: 'bg-green-100 text-green-900',
  failed: 'bg-red-100 text-red-900',
  rolled_back: 'bg-orange-100 text-orange-900'
};

const STATUS_ICONS = {
  pending: <Clock className="w-5 h-5 text-slate-600" />,
  executing: <Zap className="w-5 h-5 text-blue-600" />,
  success: <CheckCircle className="w-5 h-5 text-green-600" />,
  failed: <XCircle className="w-5 h-5 text-red-600" />,
  rolled_back: <AlertCircle className="w-5 h-5 text-orange-600" />
};

export default function RemediationDashboard() {
  const { data: actions = [], isLoading } = useQuery({
    queryKey: ['remediationActions'],
    queryFn: async () => {
      return base44.asServiceRole.entities.RemediationAction.list('-created_date', 200);
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Calculate statistics
  const stats = {
    total: actions.length,
    successful: actions.filter(a => a.status === 'success').length,
    failed: actions.filter(a => a.status === 'failed').length,
    executing: actions.filter(a => a.status === 'executing').length,
    pending: actions.filter(a => a.status === 'pending').length
  };

  const successRate = stats.total > 0 
    ? ((stats.successful / stats.total) * 100).toFixed(1)
    : 0;

  // Group by type
  const byType = {};
  for (const action of actions) {
    if (!byType[action.type]) byType[action.type] = 0;
    byType[action.type]++;
  }

  // Recent actions
  const recent = actions.slice(0, 20);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Remediation Dashboard</h1>
          <p className="text-slate-600">Automated response actions and remediation tracking</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-2">Total Actions</p>
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-2">Successful</p>
              <p className="text-3xl font-bold text-green-600">{stats.successful}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-2">Failed</p>
              <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-2">Executing</p>
              <p className="text-3xl font-bold text-blue-600">{stats.executing}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-2">Success Rate</p>
              <p className="text-3xl font-bold text-slate-900">{successRate}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Actions by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(byType).map(([type, count]) => (
                <div key={type} className="p-3 bg-slate-50 rounded">
                  <p className="text-xs text-slate-600 mb-1">{type}</p>
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Actions */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Actions</h2>
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-12 text-slate-600">Loading actions...</div>
            ) : recent.length === 0 ? (
              <div className="text-center py-12 text-slate-600">No remediation actions yet</div>
            ) : (
              recent.map((action) => {
                const duration = action.completed_at 
                  ? (new Date(action.completed_at) - new Date(action.started_at))
                  : null;

                return (
                  <Card key={action.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        {STATUS_ICONS[action.status]}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{action.title}</h3>
                            <Badge className={STATUS_COLORS[action.status]}>
                              {action.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{action.description}</p>
                          
                          {/* Action Details */}
                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-2">
                            {action.type && (
                              <div><strong>Type:</strong> {action.type}</div>
                            )}
                            {action.rule_name && (
                              <div><strong>Rule:</strong> {action.rule_name}</div>
                            )}
                            {action.alert_title && (
                              <div><strong>Alert:</strong> {action.alert_title}</div>
                            )}
                            {action.alert_severity && (
                              <div><strong>Severity:</strong> {action.alert_severity}</div>
                            )}
                          </div>

                          {/* Timing */}
                          <div className="text-xs text-slate-500">
                            Started: {new Date(action.started_at).toLocaleString()}
                            {duration && ` (${duration}ms)`}
                          </div>

                          {/* Result/Error */}
                          {action.status === 'success' && action.result && (
                            <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                              {typeof action.result === 'string' 
                                ? action.result 
                                : JSON.stringify(action.result)}
                            </div>
                          )}
                          {action.status === 'failed' && action.error && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                              <strong>Error:</strong> {action.error}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}