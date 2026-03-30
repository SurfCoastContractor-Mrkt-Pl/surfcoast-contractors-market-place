import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, Zap } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const METRIC_COLORS = {
  api_latency: 'bg-blue-100 text-blue-900',
  function_execution: 'bg-purple-100 text-purple-900',
  page_load: 'bg-green-100 text-green-900',
  user_action: 'bg-yellow-100 text-yellow-900',
  database_query: 'bg-red-100 text-red-900',
  error_rate: 'bg-orange-100 text-orange-900',
  memory_usage: 'bg-pink-100 text-pink-900',
  cpu_usage: 'bg-indigo-100 text-indigo-900'
};

const STATUS_COLORS = {
  success: 'bg-green-100 text-green-900 border-green-300',
  error: 'bg-red-100 text-red-900 border-red-300'
};

export default function PerformanceAnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState('1h');
  const [metricType, setMetricType] = useState('all');

  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ['performanceMetrics', timeframe, metricType],
    queryFn: async () => {
      const query = {};

      // Calculate time window
      const now = new Date();
      let since = new Date();

      if (timeframe === '1h') since.setHours(since.getHours() - 1);
      else if (timeframe === '24h') since.setDate(since.getDate() - 1);
      else if (timeframe === '7d') since.setDate(since.getDate() - 7);
      else if (timeframe === '30d') since.setDate(since.getDate() - 30);

      // Filter metrics
      if (metricType !== 'all') {
        query.metric_type = metricType;
      }

      // Note: In production, you'd query by date range
      return base44.asServiceRole.entities.PerformanceMetric.filter(query, '-created_date', 200);
    }
  });

  // Calculate statistics
  const stats = {
    totalMetrics: metrics.length,
    avgLatency: 0,
    maxLatency: 0,
    errorCount: 0,
    byType: {}
  };

  for (const metric of metrics) {
    if (metric.status === 'error') stats.errorCount++;

    if (!stats.byType[metric.metric_type]) {
      stats.byType[metric.metric_type] = {
        count: 0,
        sum: 0,
        avg: 0,
        min: Infinity,
        max: 0
      };
    }

    const type = stats.byType[metric.metric_type];
    type.count++;
    type.sum += metric.value;
    type.min = Math.min(type.min, metric.value);
    type.max = Math.max(type.max, metric.value);
    type.avg = type.sum / type.count;

    stats.avgLatency += metric.value;
    stats.maxLatency = Math.max(stats.maxLatency, metric.value);
  }

  if (metrics.length > 0) {
    stats.avgLatency = stats.avgLatency / metrics.length;
  }

  const errorRate = metrics.length > 0 ? (stats.errorCount / metrics.length * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Performance Analytics</h1>
          <p className="text-slate-600">Monitor system performance and user experience</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4">
          <div>
            <label className="text-xs text-slate-600 block mb-2">Timeframe</label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last 1 Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-slate-600 block mb-2">Metric Type</label>
            <Select value={metricType} onValueChange={setMetricType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Metrics</SelectItem>
                <SelectItem value="api_latency">API Latency</SelectItem>
                <SelectItem value="page_load">Page Load</SelectItem>
                <SelectItem value="function_execution">Function Execution</SelectItem>
                <SelectItem value="user_action">User Action</SelectItem>
                <SelectItem value="database_query">Database Query</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Avg Latency</p>
                  <div className="text-2xl font-bold text-slate-900">{stats.avgLatency.toFixed(0)}ms</div>
                </div>
                <Zap className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Max Latency</p>
                  <div className="text-2xl font-bold text-slate-900">{stats.maxLatency.toFixed(0)}ms</div>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Error Rate</p>
                  <div className="text-2xl font-bold text-slate-900">{errorRate}%</div>
                </div>
                <Activity className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Metrics</p>
                  <div className="text-2xl font-bold text-slate-900">{stats.totalMetrics}</div>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics by Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.entries(stats.byType).map(([type, data]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="text-lg">
                  <Badge className={METRIC_COLORS[type]}>
                    {type.replace(/_/g, ' ')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Average</p>
                    <p className="text-xl font-bold text-slate-900">{data.avg.toFixed(1)}ms</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Min / Max</p>
                    <p className="text-xl font-bold text-slate-900">{data.min.toFixed(0)} / {data.max.toFixed(0)}ms</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Count</p>
                    <p className="text-xl font-bold text-slate-900">{data.count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Total</p>
                    <p className="text-xl font-bold text-slate-900">{data.sum.toFixed(0)}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Metrics */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Metrics</h2>
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-8 text-slate-600">Loading metrics...</div>
            ) : metrics.length === 0 ? (
              <div className="text-center py-8 text-slate-600">No metrics recorded</div>
            ) : (
              metrics.slice(0, 20).map((metric, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={METRIC_COLORS[metric.metric_type]}>
                        {metric.metric_type}
                      </Badge>
                      <Badge variant="outline" className={STATUS_COLORS[metric.status]}>
                        {metric.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{metric.url}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{metric.value.toFixed(1)}ms</p>
                    <p className="text-xs text-slate-500">{new Date(metric.created_date).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}