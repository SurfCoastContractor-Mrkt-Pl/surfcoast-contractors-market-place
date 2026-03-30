import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, Activity, Mail, Database } from 'lucide-react';
import { useServiceAdmin } from '@/hooks/useServiceAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboardFundamentals() {
  const { isAdmin, loading } = useServiceAdmin();
  const [stats, setStats] = useState({
    errors: 0,
    activities: 0,
    migrations: 0,
  });

  useEffect(() => {
    if (!isAdmin) return;

    const fetchStats = async () => {
      try {
        const errors = await base44.asServiceRole.entities.ErrorLog.filter(
          { resolved: false },
          '-created_date',
          1
        );
        const activities = await base44.asServiceRole.entities.ActivityLog.filter(
          {},
          '-created_date',
          1
        );
        const migrations = await base44.asServiceRole.entities.Migration.filter(
          { status: 'pending' },
          '-created_date',
          1
        );

        setStats({
          errors: errors.length,
          activities: activities.length,
          migrations: migrations.length,
        });
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      }
    };

    fetchStats();
  }, [isAdmin]);

  if (loading) return <p>Loading...</p>;
  if (!isAdmin) return <p>Access denied</p>;

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Errors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.errors}</p>
          <p className="text-xs text-muted-foreground">unresolved</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" /> Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.activities}</p>
          <p className="text-xs text-muted-foreground">recent logs</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4" /> Migrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.migrations}</p>
          <p className="text-xs text-muted-foreground">pending</p>
        </CardContent>
      </Card>
    </div>
  );
}