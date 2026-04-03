import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, AlertTriangle, AlertOctagon, Info, CheckCircle, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const severityIcons = {
  critical: <AlertOctagon className="w-5 h-5 text-red-600" />,
  high: <AlertTriangle className="w-5 h-5 text-orange-600" />,
  medium: <AlertCircle className="w-5 h-5 text-yellow-600" />,
  low: <Info className="w-5 h-5 text-blue-600" />
};

const severityColors = {
  critical: 'bg-red-50 border-red-200',
  high: 'bg-orange-50 border-orange-200',
  medium: 'bg-yellow-50 border-yellow-200',
  low: 'bg-blue-50 border-blue-200'
};

export default function AdminErrorLogs() {
  const [filters, setFilters] = useState({
    severity: 'all',
    system: 'all',
    isResolved: 'unresolved',
    searchEmail: ''
  });

  const { data: errorLogs = [], isLoading } = useQuery({
    queryKey: ['errorLogs'],
    queryFn: () => base44.asServiceRole.entities.ErrorLog.list('', 500)
  });

  const filteredLogs = errorLogs.filter(log => {
    const data = log.data;
    if (filters.severity !== 'all' && data.severity !== filters.severity) return false;
    if (filters.system !== 'all' && data.system !== filters.system) return false;
    if (filters.isResolved === 'resolved' && !data.isResolved) return false;
    if (filters.isResolved === 'unresolved' && data.isResolved) return false;
    if (filters.searchEmail && !data.userEmail.includes(filters.searchEmail)) return false;
    return true;
  });

  const handleResolve = async (errorId) => {
    try {
      await base44.asServiceRole.entities.ErrorLog.update(errorId, { isResolved: true });
      // Refresh the data
      window.location.reload();
    } catch (error) {
      console.error('Failed to resolve error:', error);
    }
  };

  const stats = {
    total: errorLogs.length,
    critical: errorLogs.filter(e => e.data.severity === 'critical').length,
    high: errorLogs.filter(e => e.data.severity === 'high').length,
    unresolved: errorLogs.filter(e => !e.data.isResolved).length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Error Monitoring</h1>
          <p className="text-slate-600">Real-time error tracking and management dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600">Total Errors</div>
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-red-200 bg-red-50">
            <div className="text-sm text-red-600 font-medium">🔴 Critical</div>
            <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-200 bg-orange-50">
            <div className="text-sm text-orange-600 font-medium">🟠 High</div>
            <div className="text-3xl font-bold text-orange-600">{stats.high}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600">Unresolved</div>
            <div className="text-3xl font-bold text-slate-900">{stats.unresolved}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 mb-8">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Filter by email..."
              value={filters.searchEmail}
              onChange={(e) => setFilters({ ...filters, searchEmail: e.target.value })}
            />
            <Select value={filters.severity} onValueChange={(value) => setFilters({ ...filters, severity: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.system} onValueChange={(value) => setFilters({ ...filters, system: value })}>
              <SelectTrigger>
                <SelectValue placeholder="System" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Systems</SelectItem>
                <SelectItem value="main_app">Main App</SelectItem>
                <SelectItem value="wave_fo">WAVE FO</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.isResolved} onValueChange={(value) => setFilters({ ...filters, isResolved: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unresolved">Unresolved</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error List */}
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border border-slate-200">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-slate-600">No errors matching your filters</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className={`rounded-lg p-6 border shadow-sm ${severityColors[log.data.severity]} bg-white`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {severityIcons[log.data.severity]}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{log.data.pageOrFeature}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          log.data.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          log.data.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          log.data.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {log.data.severity.toUpperCase()}
                        </span>
                        {log.data.system === 'wave_fo' && (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700">WAVE FO</span>
                        )}
                        {log.data.isResolved && (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">RESOLVED</span>
                        )}
                      </div>
                      <p className="text-slate-700 font-medium mb-1">{log.data.errorMessage}</p>
                      <p className="text-sm text-slate-600 mb-2">
                        <strong>User:</strong> {log.data.userEmail} ({log.data.userName})
                      </p>
                      <p className="text-sm text-slate-600 mb-2">
                        <strong>Action:</strong> {log.data.actionAttempted}
                      </p>
                      <p className="text-xs text-slate-500">
                        {log.data.platform.toUpperCase()} • {new Date(log.data.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!log.data.isResolved && (
                    <Button
                      size="sm"
                      onClick={() => handleResolve(log.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
                {log.data.errorStack && (
                  <div className="mt-4 p-3 bg-slate-100 rounded font-mono text-xs text-slate-700 overflow-auto max-h-32">
                    {log.data.errorStack}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}