import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Loader2, Clock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function QBSyncDashboard() {
  const [user, setUser] = useState(null);
  const [qbCreds, setQbCreds] = useState({ customerId: '', realmId: '', accessToken: '' });
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: closedScopes = [] } = useQuery({
    queryKey: ['closedScopes', user?.email],
    queryFn: () => user?.email ? 
      base44.entities.ScopeOfWork.filter({
        contractor_email: user.email,
        status: 'closed'
      }) : 
      [],
    enabled: !!user?.email
  });

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await base44.functions.invoke('syncToQuickBooksAPI', {
        qb_customer_id: qbCreds.customerId,
        qb_realm_id: qbCreds.realmId,
        qb_access_token: qbCreds.accessToken
      });
      setLastSync({
        timestamp: new Date(),
        count: response?.data?.synced_count,
        success: response?.data?.success
      });
    } catch (error) {
      console.error('Sync failed:', error);
    }
    setSyncing(false);
  };

  if (!user) return <div className="p-6 text-center">Loading...</div>;

  const pendingSync = closedScopes.length - (lastSync?.count || 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">QuickBooks Sync Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-1">Closed Jobs Ready</p>
              <p className="text-3xl font-bold text-slate-900">{closedScopes.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-1">Last Synced</p>
              {lastSync ? (
                <p className="text-sm font-semibold text-green-600">
                  {format(lastSync.timestamp, 'MMM d, h:mm a')}
                </p>
              ) : (
                <p className="text-sm text-slate-500">Never</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-1">Pending Sync</p>
              <p className={`text-2xl font-bold ${pendingSync > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {pendingSync}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* QB Credentials */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>QuickBooks Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="QB Customer ID"
              value={qbCreds.customerId}
              onChange={(e) => setQbCreds({...qbCreds, customerId: e.target.value})}
            />
            <Input
              placeholder="QB Realm ID"
              value={qbCreds.realmId}
              onChange={(e) => setQbCreds({...qbCreds, realmId: e.target.value})}
            />
            <Input
              placeholder="QB Access Token"
              type="password"
              value={qbCreds.accessToken}
              onChange={(e) => setQbCreds({...qbCreds, accessToken: e.target.value})}
            />
            <Button 
              onClick={handleSync} 
              disabled={syncing || !qbCreds.customerId}
              className="w-full gap-2"
            >
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Sync Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Sync History */}
        <Card>
          <CardHeader>
            <CardTitle>Jobs Pending Sync</CardTitle>
          </CardHeader>
          <CardContent>
            {closedScopes.length === 0 ? (
              <p className="text-slate-600 text-sm">No closed jobs yet</p>
            ) : (
              <div className="space-y-2">
                {closedScopes.map(scope => (
                  <div key={scope.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{scope.job_title}</p>
                      <p className="text-sm text-slate-500">${scope.contractor_payout_amount}</p>
                    </div>
                    <Badge variant="outline">Pending QB</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}