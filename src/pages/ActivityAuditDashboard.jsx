import React, { useState } from 'react';
import AdminGuard from '@/components/auth/AdminGuard';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Eye } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SEVERITY_COLORS = {
  low: 'bg-blue-100 text-blue-900 border-blue-300',
  medium: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  high: 'bg-orange-100 text-orange-900 border-orange-300',
  critical: 'bg-red-200 text-red-950 border-red-400'
};

const ACTION_LABELS = {
  create: 'Created',
  read: 'Viewed',
  update: 'Updated',
  delete: 'Deleted',
  login: 'Logged in',
  logout: 'Logged out',
  export: 'Exported',
  import: 'Imported',
  payment: 'Payment',
  approve: 'Approved',
  reject: 'Rejected',
  download: 'Downloaded',
  upload: 'Uploaded',
  share: 'Shared',
  access: 'Accessed'
};

function ActivityAuditDashboardContent() {
  const [filters, setFilters] = useState({ severity: 'all', actionType: 'all', entityType: 'all', reviewed: 'all' });
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', filters],
    queryFn: async () => {
      const query = {};
      if (filters.severity !== 'all') query.severity = filters.severity;
      if (filters.actionType !== 'all') query.action_type = filters.actionType;
      if (filters.entityType !== 'all') query.entity_type = filters.entityType;
      if (filters.reviewed !== 'all') query.reviewed = filters.reviewed === 'reviewed';

      return base44.asServiceRole.entities.ActivityLog.filter(query, '-created_date', 100);
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, notes }) => {
      return base44.asServiceRole.entities.ActivityLog.update(id, {
        reviewed: true,
        review_notes: notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    }
  });

  const unreviewMutation = useMutation({
    mutationFn: async (id) => {
      return base44.asServiceRole.entities.ActivityLog.update(id, {
        reviewed: false,
        review_notes: ''
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    }
  });

  const stats = {
    total: activities.length,
    critical: activities.filter(a => a.severity === 'critical').length,
    unreviewed: activities.filter(a => !a.reviewed).length
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Activity & Audit Log</h1>
          <p className="text-slate-600">Track user actions and system changes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
              <p className="text-sm text-slate-600">Total Activities</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
              <p className="text-sm text-slate-600">Critical Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-yellow-600">{stats.unreviewed}</div>
              <p className="text-sm text-slate-600">Unreviewed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4 flex-wrap items-end">
          <div>
            <label className="text-xs text-slate-600 block mb-2">Severity</label>
            <Select value={filters.severity} onValueChange={(value) => setFilters({ ...filters, severity: value })}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-slate-600 block mb-2">Action</label>
            <Select value={filters.actionType} onValueChange={(value) => setFilters({ ...filters, actionType: value })}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="access">Access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-slate-600 block mb-2">Status</label>
            <Select value={filters.reviewed} onValueChange={(value) => setFilters({ ...filters, reviewed: value })}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="unreviewed">Unreviewed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-slate-600">Loading activities...</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 text-slate-600">No activities found</div>
          ) : (
            activities.map(activity => (
              <Card key={activity.id} className={`border-l-4 ${activity.reviewed ? 'opacity-75' : ''}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        {activity.severity === 'critical' ? (
                          <AlertCircle className="w-5 h-5 mt-0.5 text-red-600" />
                        ) : (
                          <Eye className="w-5 h-5 mt-0.5 text-slate-400" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">
                            {ACTION_LABELS[activity.action_type]} {activity.entity_name}
                          </h3>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className={SEVERITY_COLORS[activity.severity]}>
                              {activity.severity}
                            </Badge>
                            <Badge variant="outline" className="bg-slate-100 text-slate-900">
                              {activity.entity_type}
                            </Badge>
                            {activity.reviewed && (
                              <Badge variant="outline" className="bg-green-100 text-green-900 border-green-300">
                                <CheckCircle className="w-3 h-3 mr-1" /> Reviewed
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-600">
                            {activity.user_email && <p><strong>User:</strong> {activity.user_email}</p>}
                            <p><strong>IP:</strong> {activity.ip_address}</p>
                            {activity.description && <p className="col-span-2"><strong>Details:</strong> {activity.description}</p>}
                          </div>
                          {activity.review_notes && (
                            <p className="text-xs text-slate-600 mt-2">
                              <strong>Review Notes:</strong> {activity.review_notes}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 mt-2">
                            {new Date(activity.created_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {activity.reviewed ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unreviewMutation.mutate(activity.id)}
                        >
                          Unreview
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const notes = prompt('Review notes:');
                            if (notes !== null) {
                              reviewMutation.mutate({ id: activity.id, notes });
                            }
                          }}
                        >
                          Mark Reviewed
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

export default function ActivityAuditDashboard() {
  return (
    <AdminGuard>
      <ActivityAuditDashboardContent />
    </AdminGuard>
  );
}