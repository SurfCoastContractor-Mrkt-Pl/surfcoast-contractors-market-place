import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Globe, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

const severityColors = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const alertTypeColors = {
  geo_block: 'bg-blue-100 text-blue-700',
  suspicious_request: 'bg-orange-100 text-orange-700',
  rapid_requests: 'bg-red-100 text-red-700',
  malformed_payload: 'bg-purple-100 text-purple-700',
  unauthorized_access: 'bg-red-100 text-red-700',
};

const alertTypeLabels = {
  geo_block: '🌐 Geo Block',
  suspicious_request: '⚠️ Suspicious',
  rapid_requests: '⚡ Rapid Requests',
  malformed_payload: '🔧 Bad Payload',
  unauthorized_access: '🔒 Unauthorized',
};

export default function SecurityAlertsTable({ authed }) {
  const [showResolved, setShowResolved] = useState(false);
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ['security-alerts'],
    queryFn: () => base44.entities.SecurityAlert.list('-created_date', 200),
    enabled: authed,
    refetchInterval: 30000,
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, notes }) =>
      base44.entities.SecurityAlert.update(id, { resolved: true, admin_notes: notes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['security-alerts'] }),
  });

  const filtered = alerts.filter(a => showResolved || !a.resolved);
  const unresolved = alerts.filter(a => !a.resolved);
  const geoBlocks = unresolved.filter(a => a.alert_type === 'geo_block');
  const highSeverity = unresolved.filter(a => a.severity === 'high' || a.severity === 'critical');

  if (isLoading) {
    return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-sm">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="font-semibold text-red-700">{highSeverity.length}</span>
          <span className="text-red-600">High/Critical</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <Globe className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-blue-700">{geoBlocks.length}</span>
          <span className="text-blue-600">Geo Blocks</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-sm">
          <span className="font-semibold text-amber-700">{unresolved.length}</span>
          <span className="text-amber-600">Total Unresolved</span>
        </div>
        <div className="flex items-center gap-2 ml-auto gap-2">
          <Button
            size="sm"
            variant={showResolved ? 'default' : 'outline'}
            onClick={() => setShowResolved(v => !v)}
            className="h-8 text-xs"
          >
            {showResolved ? 'Hide Resolved' : 'Show Resolved'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="h-8 gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Alert List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Shield className="w-10 h-10 mx-auto mb-2 text-green-300" />
          No security alerts. Platform is clean.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(alert => (
            <Card
              key={alert.id}
              className={`p-4 ${alert.resolved ? 'opacity-50' : ''} ${
                alert.severity === 'critical' ? 'border-red-300 bg-red-50' :
                alert.severity === 'high' ? 'border-orange-300 bg-orange-50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={severityColors[alert.severity] || severityColors.medium}>
                      {alert.severity}
                    </Badge>
                    <Badge className={alertTypeColors[alert.alert_type] || 'bg-slate-100 text-slate-600'}>
                      {alertTypeLabels[alert.alert_type] || alert.alert_type}
                    </Badge>
                    {alert.country && alert.country !== 'US' && (
                      <Badge className="bg-red-100 text-red-700">
                        🚫 {alert.country_name || alert.country}
                      </Badge>
                    )}
                    {alert.resolved && <Badge className="bg-green-100 text-green-700">Resolved</Badge>}
                  </div>
                  <div className="text-sm text-slate-700">{alert.details}</div>
                  <div className="text-xs text-slate-500 flex flex-wrap gap-3">
                    {alert.ip_address && <span>IP: <code className="bg-slate-100 px-1 rounded">{alert.ip_address}</code></span>}
                    {alert.path && <span>Path: {alert.path}</span>}
                    <span>{new Date(alert.created_date).toLocaleString()}</span>
                  </div>
                  {alert.user_agent && (
                    <div className="text-xs text-slate-400 truncate max-w-md">{alert.user_agent}</div>
                  )}
                  {alert.resolved && alert.admin_notes && (
                    <div className="text-xs text-green-700 bg-green-50 rounded px-2 py-1">
                      <strong>Notes:</strong> {alert.admin_notes}
                    </div>
                  )}
                </div>
                {!alert.resolved && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs shrink-0 border-green-300 text-green-700 hover:bg-green-50"
                    onClick={() => {
                      const notes = prompt('Optional resolution notes:') ?? '';
                      resolveMutation.mutate({ id: alert.id, notes });
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