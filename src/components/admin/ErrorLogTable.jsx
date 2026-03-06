import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, CheckCircle2, Filter, RefreshCw } from 'lucide-react';

const severityColors = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const typeColors = {
  profile_setup: 'bg-purple-100 text-purple-700',
  payment: 'bg-blue-100 text-blue-700',
  job_posting: 'bg-amber-100 text-amber-700',
  verification: 'bg-indigo-100 text-indigo-700',
  messaging: 'bg-green-100 text-green-700',
  other: 'bg-slate-100 text-slate-600',
};

export default function ErrorLogTable({ authed }) {
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['error-logs'],
    queryFn: () => base44.entities.ErrorLog.list('-created_date', 200),
    enabled: authed,
    refetchInterval: 30000,
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, notes }) => base44.entities.ErrorLog.update(id, { resolved: true, admin_notes: notes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['error-logs'] }),
  });

  const filtered = logs.filter(log => {
    if (!showResolved && log.resolved) return false;
    if (filterSeverity && log.severity !== filterSeverity) return false;
    if (filterType && log.error_type !== filterType) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        log.error_message?.toLowerCase().includes(s) ||
        log.user_email?.toLowerCase().includes(s) ||
        log.action?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const unresolved = logs.filter(l => !l.resolved);
  const critical = unresolved.filter(l => l.severity === 'critical' || l.severity === 'high');

  if (isLoading) {
    return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary Badges */}
      <div className="flex flex-wrap gap-3 mb-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-sm">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="font-semibold text-red-700">{critical.length}</span>
          <span className="text-red-600">High/Critical unresolved</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-sm">
          <span className="font-semibold text-amber-700">{unresolved.length}</span>
          <span className="text-amber-600">Total unresolved</span>
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()} className="ml-auto gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search email, action, error..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs h-8 text-sm"
        />
        <select
          value={filterSeverity}
          onChange={e => setFilterSeverity(e.target.value)}
          className="h-8 text-sm border border-slate-200 rounded-md px-2 bg-white"
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="h-8 text-sm border border-slate-200 rounded-md px-2 bg-white"
        >
          <option value="">All Types</option>
          <option value="profile_setup">Profile Setup</option>
          <option value="payment">Payment</option>
          <option value="job_posting">Job Posting</option>
          <option value="verification">Verification</option>
          <option value="messaging">Messaging</option>
          <option value="other">Other</option>
        </select>
        <Button
          size="sm"
          variant={showResolved ? 'default' : 'outline'}
          onClick={() => setShowResolved(v => !v)}
          className="h-8 text-xs"
        >
          {showResolved ? 'Hide Resolved' : 'Show Resolved'}
        </Button>
      </div>

      {/* Log List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-300" />
          No errors found matching your filters.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(log => (
            <Card key={log.id} className={`p-4 ${log.resolved ? 'opacity-50' : ''} ${log.severity === 'critical' ? 'border-red-300 bg-red-50' : log.severity === 'high' ? 'border-orange-300 bg-orange-50' : ''}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={severityColors[log.severity] || severityColors.medium}>
                      {log.severity}
                    </Badge>
                    <Badge className={typeColors[log.error_type] || typeColors.other}>
                      {log.error_type?.replace('_', ' ')}
                    </Badge>
                    <Badge className={log.user_type === 'contractor' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-700'}>
                      {log.user_type}
                    </Badge>
                    {log.resolved && <Badge className="bg-green-100 text-green-700">Resolved</Badge>}
                  </div>
                  <div className="text-sm font-medium text-slate-800">{log.action}</div>
                  <div className="text-sm text-red-700 font-mono bg-red-50 rounded px-2 py-1 break-all">{log.error_message}</div>
                  <div className="text-xs text-slate-500 flex flex-wrap gap-3">
                    <span>{log.user_email}</span>
                    <span>{new Date(log.created_date).toLocaleString()}</span>
                  </div>
                  {log.context && (
                    <details className="text-xs text-slate-500 mt-1">
                      <summary className="cursor-pointer hover:text-slate-700">View context</summary>
                      <pre className="mt-1 bg-slate-100 rounded p-2 overflow-auto max-h-32 text-xs">{
                        (() => { try { return JSON.stringify(JSON.parse(log.context), null, 2); } catch { return log.context; } })()
                      }</pre>
                    </details>
                  )}
                  {log.resolved && log.admin_notes && (
                    <div className="text-xs text-green-700 bg-green-50 rounded px-2 py-1 mt-1">
                      <strong>Resolution:</strong> {log.admin_notes}
                    </div>
                  )}
                </div>
                {!log.resolved && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs shrink-0 border-green-300 text-green-700 hover:bg-green-50"
                    onClick={() => {
                      const notes = prompt('Optional resolution notes:') ?? '';
                      resolveMutation.mutate({ id: log.id, notes });
                    }}
                    disabled={resolveMutation.isPending}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Resolve
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}