import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STATUS_COLORS = {
  200: 'bg-green-100 text-green-900',
  201: 'bg-green-100 text-green-900',
  204: 'bg-green-100 text-green-900',
  400: 'bg-red-100 text-red-900',
  401: 'bg-orange-100 text-orange-900',
  403: 'bg-orange-100 text-orange-900',
  404: 'bg-yellow-100 text-yellow-900',
  500: 'bg-red-100 text-red-900',
  503: 'bg-red-100 text-red-900'
};

export default function APIUsageAnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState('24h');

  const { data: usage = [], isLoading } = useQuery({
    queryKey: ['apiUsage', timeframe],
    queryFn: async () => {
      return base44.asServiceRole.entities.APIUsage.list('-created_date', 500);
    }
  });

  // Calculate statistics
  const stats = {
    totalCalls: usage.length,
    errorCalls: 0,
    avgResponseTime: 0,
    p95ResponseTime: 0,
    p99ResponseTime: 0,
    byEndpoint: {},
    byMethod: {},
    byStatus: {},
    slowestEndpoints: []
  };

  const responseTimes = [];

  for (const call of usage) {
    // Count errors
    if (call.status_code >= 400) {
      stats.errorCalls++;
    }

    // Endpoint stats
    if (!stats.byEndpoint[call.endpoint]) {
      stats.byEndpoint[call.endpoint] = { count: 0, avgTime: 0, errors: 0, totalTime: 0 };
    }
    stats.byEndpoint[call.endpoint].count++;
    stats.byEndpoint[call.endpoint].totalTime += call.response_time_ms;
    if (call.status_code >= 400) {
      stats.byEndpoint[call.endpoint].errors++;
    }

    // Method stats
    if (!stats.byMethod[call.method]) {
      stats.byMethod[call.method] = 0;
    }
    stats.byMethod[call.method]++;

    // Status stats
    if (!stats.byStatus[call.status_code]) {
      stats.byStatus[call.status_code] = 0;
    }
    stats.byStatus[call.status_code]++;

    responseTimes.push(call.response_time_ms);
  }

  // Calculate averages
  for (const endpoint in stats.byEndpoint) {
    const data = stats.byEndpoint[endpoint];
    data.avgTime = data.totalTime / data.count;
  }

  // Calculate percentiles
  if (responseTimes.length > 0) {
    stats.avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    responseTimes.sort((a, b) => a - b);
    stats.p95ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.95)];
    stats.p99ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.99)];

    // Slowest endpoints
    stats.slowestEndpoints = Object.entries(stats.byEndpoint)
      .map(([endpoint, data]) => ({ endpoint, ...data }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10);
  }

  const errorRate = stats.totalCalls > 0 ? ((stats.errorCalls / stats.totalCalls) * 100).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">API Usage Analytics</h1>
          <p className="text-slate-600">Monitor API calls, performance, and quota usage</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
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
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Calls</p>
                  <div className="text-2xl font-bold text-slate-900">{stats.totalCalls}</div>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
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
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Avg Response</p>
                  <div className="text-2xl font-bold text-slate-900">{stats.avgResponseTime.toFixed(0)}ms</div>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">P99 Response</p>
                  <div className="text-2xl font-bold text-slate-900">{stats.p99ResponseTime.toFixed(0)}ms</div>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* By Status Code */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Calls by Status Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status}>
                  <Badge variant="outline" className={STATUS_COLORS[status] || 'bg-slate-100'}>
                    {status}
                  </Badge>
                  <p className="text-2xl font-bold mt-2 text-slate-900">{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By Method */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Calls by HTTP Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(stats.byMethod).map(([method, count]) => (
                <div key={method}>
                  <Badge variant="outline" className="bg-slate-100 text-slate-900">
                    {method}
                  </Badge>
                  <p className="text-2xl font-bold mt-2 text-slate-900">{count}</p>
                  <p className="text-xs text-slate-500">
                    {((count / stats.totalCalls) * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Slowest Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>Slowest Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-slate-600">Loading data...</div>
              ) : stats.slowestEndpoints.length === 0 ? (
                <div className="text-center py-8 text-slate-600">No data available</div>
              ) : (
                stats.slowestEndpoints.map((endpoint, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{endpoint.endpoint}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="bg-slate-100 text-slate-900 text-xs">
                          {endpoint.count} calls
                        </Badge>
                        {endpoint.errors > 0 && (
                          <Badge variant="outline" className="bg-red-100 text-red-900 text-xs">
                            {endpoint.errors} errors
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{endpoint.avgTime.toFixed(0)}ms</p>
                      <p className="text-xs text-slate-500">avg response</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}