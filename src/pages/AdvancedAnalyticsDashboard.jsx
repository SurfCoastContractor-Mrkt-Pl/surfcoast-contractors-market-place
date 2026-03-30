import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-900 border-red-300',
  warning: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  info: 'bg-blue-100 text-blue-900 border-blue-300'
};

const SEVERITY_ICONS = {
  critical: <AlertCircle className="w-5 h-5 text-red-600" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
  info: <Activity className="w-5 h-5 text-blue-600" />
};

export default function AdvancedAnalyticsDashboard() {
  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['analyticsInsights'],
    queryFn: async () => {
      try {
        const result = await base44.functions.invoke('generateAnalyticsInsights', {});
        return result.data || [];
      } catch (err) {
        console.error('Failed to generate insights:', err);
        return [];
      }
    },
    refetchInterval: 300000 // 5 minutes
  });

  // Calculate statistics
  const stats = {
    total: insights.length,
    critical: insights.filter(i => i.severity === 'critical').length,
    warning: insights.filter(i => i.severity === 'warning').length,
    info: insights.filter(i => i.severity === 'info').length,
    healthScore: 100 - (insights.filter(i => i.severity === 'critical').length * 10 + 
                         insights.filter(i => i.severity === 'warning').length * 2)
  };

  stats.healthScore = Math.max(0, Math.min(100, stats.healthScore));

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const criticalInsights = insights.filter(i => i.severity === 'critical');
  const warningInsights = insights.filter(i => i.severity === 'warning');
  const infoInsights = insights.filter(i => i.severity === 'info');

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Advanced Analytics</h1>
          <p className="text-slate-600">System insights and comprehensive health analysis</p>
        </div>

        {/* Health Score */}
        <Card className="mb-8 bg-gradient-to-r from-slate-50 to-slate-100 border-2">
          <CardHeader>
            <CardTitle>System Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div>
                <div className={`text-6xl font-bold ${getHealthColor(stats.healthScore)}`}>
                  {stats.healthScore.toFixed(0)}
                </div>
                <p className="text-slate-600 mt-2">Overall system health</p>
              </div>
              <div className="grid grid-cols-3 gap-4 flex-1">
                <div>
                  <p className="text-sm text-slate-600">Critical Issues</p>
                  <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Warnings</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.warning}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Info</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.info}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights by Severity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Critical */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Critical Issues ({stats.critical})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {criticalInsights.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <p className="text-sm">All critical systems operational</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {criticalInsights.slice(0, 5).map((insight, idx) => (
                    <div key={idx} className="p-2 bg-red-50 rounded border border-red-200">
                      <p className="text-xs font-semibold text-red-900">{insight.title}</p>
                      <p className="text-xs text-red-700 mt-1">{insight.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Warnings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Warnings ({stats.warning})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {warningInsights.length === 0 ? (
                <p className="text-sm text-slate-600">No warnings</p>
              ) : (
                <div className="space-y-2">
                  {warningInsights.slice(0, 5).map((insight, idx) => (
                    <div key={idx} className="p-2 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-xs font-semibold text-yellow-900">{insight.title}</p>
                      <p className="text-xs text-yellow-700 mt-1">{insight.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Info ({stats.info})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {infoInsights.length === 0 ? (
                <p className="text-sm text-slate-600">No info items</p>
              ) : (
                <div className="space-y-2">
                  {infoInsights.slice(0, 5).map((insight, idx) => (
                    <div key={idx} className="p-2 bg-blue-50 rounded border border-blue-200">
                      <p className="text-xs font-semibold text-blue-900">{insight.title}</p>
                      <p className="text-xs text-blue-700 mt-1">{insight.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All Insights */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">All Insights</h2>
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-12 text-slate-600">Generating insights...</div>
            ) : insights.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <p>All systems healthy - no insights to report</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              insights.map((insight, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      {SEVERITY_ICONS[insight.severity]}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{insight.title}</h3>
                          <Badge variant="outline" className={SEVERITY_COLORS[insight.severity]}>
                            {insight.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{insight.description}</p>
                        {insight.details && (
                          <div className="text-xs text-slate-500 mt-2">
                            {typeof insight.details === 'object' && !Array.isArray(insight.details) && (
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(insight.details).map(([key, val]) => (
                                  <p key={key}><strong>{key}:</strong> {val}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(insight.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}