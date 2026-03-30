import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Filter, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LEVELS = {
  info: 'bg-blue-100 text-blue-900 border-blue-300',
  warning: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  error: 'bg-red-100 text-red-900 border-red-300',
  critical: 'bg-red-200 text-red-950 border-red-400'
};

const CATEGORIES = {
  auth: 'Authentication',
  validation: 'Validation',
  network: 'Network',
  database: 'Database',
  payment: 'Payment',
  file_upload: 'File Upload',
  permission: 'Permission',
  unknown: 'Unknown'
};

export default function ErrorMonitoringDashboard() {
  const [filters, setFilters] = useState({ level: 'all', category: 'all', resolved: 'unresolved' });
  const queryClient = useQueryClient();

  const { data: errors = [], isLoading } = useQuery({
    queryKey: ['errorLogs', filters],
    queryFn: async () => {
      const query = {};
      if (filters.level !== 'all') query.level = filters.level;
      if (filters.category !== 'all') query.category = filters.category;
      if (filters.resolved === 'resolved') query.resolved = true;
      if (filters.resolved === 'unresolved') query.resolved = false;

      return base44.asServiceRole.entities.ErrorLog.filter(query, '-created_date', 100);
    }
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, notes }) => {
      return base44.asServiceRole.entities.ErrorLog.update(id, {
        resolved: true,
        resolution_notes: notes,
        resolved_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errorLogs'] });
    }
  });

  const unresolveError = useMutation({
    mutationFn: async (id) => {
      return base44.asServiceRole.entities.ErrorLog.update(id, {
        resolved: false,
        resolution_notes: '',
        resolved_at: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errorLogs'] });
    }
  });

  const stats = {
    total: errors.length,
    critical: errors.filter(e => e.level === 'critical').length,
    unresolved: errors.filter(e => !e.resolved).length
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Error Monitoring</h1>
          <p className="text-slate-600">Track and manage platform errors</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
              <p className="text-sm text-slate-600">Total Errors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
              <p className="text-sm text-slate-600">Critical Errors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-yellow-600">{stats.unresolved}</div>
              <p className="text-sm text-slate-600">Unresolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4 flex-wrap items-end">
          <div>
            <label className="text-xs text-slate-600 block mb-2">Level</label>
            <Select value={filters.level} onValueChange={(value) => setFilters({ ...filters, level: value })}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-slate-600 block mb-2">Category</label>
            <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORIES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-slate-600 block mb-2">Status</label>
            <Select value={filters.resolved} onValueChange={(value) => setFilters({ ...filters, resolved: value })}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Errors List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-slate-600">Loading errors...</div>
          ) : errors.length === 0 ? (
            <div className="text-center py-12 text-slate-600">No errors found</div>
          ) : (
            errors.map(error => (
              <Card key={error.id} className={`border-l-4 ${error.resolved ? 'opacity-75' : ''}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <AlertCircle className={`w-5 h-5 mt-0.5 ${error.level === 'critical' ? 'text-red-600' : 'text-slate-400'}`} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{error.message}</h3>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className={LEVELS[error.level]}>
                              {error.level}
                            </Badge>
                            <Badge variant="outline">{CATEGORIES[error.category] || error.category}</Badge>
                            {error.resolved && (
                              <Badge variant="outline" className="bg-green-100 text-green-900 border-green-300">
                                <CheckCircle className="w-3 h-3 mr-1" /> Resolved
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-3">
                            <strong>URL:</strong> {error.url}
                          </p>
                          {error.resolution_notes && (
                            <p className="text-xs text-slate-600 mt-2">
                              <strong>Resolution:</strong> {error.resolution_notes}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 mt-2">
                            {new Date(error.created_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {error.resolved ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unresolveError.mutate(error.id)}
                        >
                          Unresolve
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const notes = prompt('Resolution notes:');
                            if (notes) {
                              resolveMutation.mutate({ id: error.id, notes });
                            }
                          }}
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}