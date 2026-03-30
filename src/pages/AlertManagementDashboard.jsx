import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SEVERITY_COLORS = {
  info: 'bg-blue-100 text-blue-900',
  warning: 'bg-yellow-100 text-yellow-900',
  critical: 'bg-red-100 text-red-900',
  emergency: 'bg-red-200 text-red-950'
};

const STATUS_ICONS = {
  triggered: <AlertCircle className="w-5 h-5 text-red-600" />,
  escalated: <AlertCircle className="w-5 h-5 text-orange-600" />,
  acknowledged: <Clock className="w-5 h-5 text-yellow-600" />,
  resolved: <CheckCircle className="w-5 h-5 text-green-600" />
};

export default function AlertManagementDashboard() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts', statusFilter, severityFilter],
    queryFn: async () => {
      const query = {};
      if (statusFilter !== 'all') query.status = statusFilter;
      if (severityFilter !== 'all') query.severity = severityFilter;

      return base44.asServiceRole.entities.Alert.filter(query, '-created_date', 100);
    }
  });

  const acknowledgeAlert = useMutation({
    mutationFn: async (alertId) => {
      return base44.asServiceRole.entities.Alert.update(alertId, {
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    }
  });

  const resolveAlert = useMutation({
    mutationFn: async ({ alertId, notes }) => {
      return base44.asServiceRole.entities.Alert.update(alertId, {
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolution_notes: notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    }
  });

  // Calculate statistics
  const stats = {
    total: alerts.length,
    triggered: alerts.filter(a => a.status === 'triggered').length,
    escalated: alerts.filter(a => a.status === 'escalated').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    resolved: alerts.filter(a => a.status === 'resolved').length
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Alert Management</h1>
          <p className="text-slate-600">Monitor and manage system alerts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-1">Total Alerts</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-1">Triggered</p>
              <p className="text-2xl font-bold text-red-600">{stats.triggered}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-1">Escalated</p>
              <p className="text-2xl font-bold text-orange-600">{stats.escalated}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-1">Acknowledged</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.acknowledged}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-1">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4">
          <div>
            <label className="text-xs text-slate-600 block mb-2">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="triggered">Triggered</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-slate-600 block mb-2">Severity</label>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-slate-600">Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-600">No alerts found</div>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {STATUS_ICONS[alert.status]}
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{alert.title}</h3>
                          <Badge className={SEVERITY_COLORS[alert.severity]}>
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline" className="bg-slate-100 text-slate-900">
                            {alert.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{alert.message}</p>
                        <div className="flex gap-2 mt-2 text-xs text-slate-500">
                          {alert.source && <p><strong>Source:</strong> {alert.source}</p>}
                          {alert.metric && <p><strong>Metric:</strong> {alert.metric}</p>}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          Triggered: {new Date(alert.triggered_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(alert.status === 'triggered' || alert.status === 'escalated') && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeAlert.mutate(alert.id)}
                          >
                            Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const notes = prompt('Resolution notes:');
                              if (notes !== null) {
                                resolveAlert.mutate({ alertId: alert.id, notes });
                              }
                            }}
                          >
                            Resolve
                          </Button>
                        </>
                      )}
                      {alert.status === 'acknowledged' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const notes = prompt('Resolution notes:');
                            if (notes !== null) {
                              resolveAlert.mutate({ alertId: alert.id, notes });
                            }
                          }}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                  {alert.resolution_notes && (
                    <p className="text-xs text-slate-600 mt-3 p-2 bg-slate-50 rounded">
                      <strong>Resolution:</strong> {alert.resolution_notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}