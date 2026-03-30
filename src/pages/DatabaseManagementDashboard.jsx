import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  applied: 'bg-green-100 text-green-900 border-green-300',
  failed: 'bg-red-100 text-red-900 border-red-300',
  rolled_back: 'bg-slate-100 text-slate-900 border-slate-300'
};

export default function DatabaseManagementDashboard() {
  const [loading, setLoading] = useState(false);

  const { data: status = {}, refetch } = useQuery({
    queryKey: ['migrations'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getMigrationStatus', {});
      return response.data;
    }
  });

  const handleApplyPending = async () => {
    setLoading(true);
    try {
      await base44.functions.invoke('applyPendingMigrations', {});
      refetch();
    } catch (error) {
      console.error('Failed to apply migrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyMigration = async (migrationName) => {
    setLoading(true);
    try {
      await base44.functions.invoke('applyMigration', { migrationName });
      refetch();
    } catch (error) {
      console.error('Failed to apply migration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (migrationName) => {
    if (!confirm(`Rollback ${migrationName}?`)) return;
    setLoading(true);
    try {
      await base44.functions.invoke('rollbackMigration', { migrationName });
      refetch();
    } catch (error) {
      console.error('Failed to rollback migration:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Database Management</h1>
          <p className="text-slate-600">Manage migrations and database seeding</p>
        </div>

        {/* Migration Stats */}
        {status.stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{status.stats.total}</div>
                <p className="text-xs text-slate-600">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600">{status.stats.applied}</div>
                <p className="text-xs text-slate-600">Applied</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-yellow-600">{status.stats.pending}</div>
                <p className="text-xs text-slate-600">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-red-600">{status.stats.failed}</div>
                <p className="text-xs text-slate-600">Failed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-slate-600">{status.stats.rolled_back}</div>
                <p className="text-xs text-slate-600">Rolled Back</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-4 mb-8 flex gap-2">
          <Button
            onClick={handleApplyPending}
            disabled={loading}
            className="gap-2"
          >
            <Zap className="w-4 h-4" />
            Apply Pending
          </Button>
          <p className="text-sm text-slate-600 flex items-center">
            {status.stats?.pending} migration(s) waiting
          </p>
        </div>

        {/* Migrations List */}
        <div className="space-y-3">
          <h2 className="font-semibold text-slate-900">Migration History</h2>
          {status.migrations && status.migrations.length > 0 ? (
            status.migrations.map(migration => (
              <Card key={migration.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{migration.name}</h3>
                        <Badge variant="outline" className={STATUS_COLORS[migration.status]}>
                          {migration.status}
                        </Badge>
                      </div>
                      {migration.changes_summary && (
                        <p className="text-sm text-slate-600 mb-2">{migration.changes_summary}</p>
                      )}
                      <div className="flex gap-4 text-xs text-slate-500">
                        {migration.applied_at && (
                          <span>Applied: {new Date(migration.applied_at).toLocaleString()}</span>
                        )}
                        {migration.duration_ms && (
                          <span>{migration.duration_ms}ms</span>
                        )}
                      </div>
                      {migration.error_message && (
                        <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                          <p className="text-xs text-red-700">{migration.error_message}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {migration.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApplyMigration(migration.name)}
                          disabled={loading}
                        >
                          Apply
                        </Button>
                      )}
                      {migration.status === 'applied' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRollback(migration.name)}
                          disabled={loading}
                        >
                          Rollback
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-slate-600">No migrations yet</div>
          )}
        </div>
      </div>
    </div>
  );
}