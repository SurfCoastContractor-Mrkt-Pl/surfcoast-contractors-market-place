import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import HubSpotConnectButton from './HubSpotConnectButton';

export default function CRMSyncPanel({ scope, review, syncType = 'job', onSyncComplete }) {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const functionName = syncType === 'job' ? 'syncJobToHubSpot' : 'syncReviewToHubSpot';
      const payload = syncType === 'job' 
        ? { scope_id: scope?.id, connectorId: 'hubspot-crm-contractors-vendors' }
        : { review_id: review?.id, connectorId: 'hubspot-crm-contractors-vendors' };

      const response = await base44.functions.invoke(functionName, payload);
      setSyncStatus({ success: true, message: 'Synced to HubSpot successfully' });
      onSyncComplete?.();
    } catch (error) {
      setSyncStatus({ success: false, message: error.message });
    }
    setSyncing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          CRM Integration
        </CardTitle>
        <CardDescription>Sync your jobs and reviews to HubSpot</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-2">HubSpot Connection</label>
          <HubSpotConnectButton />
        </div>

        {(scope || review) && (
          <div>
            <label className="text-sm font-medium block mb-2">
              {syncType === 'job' ? 'Sync Job to HubSpot' : 'Sync Review to HubSpot'}
            </label>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSync}
                disabled={syncing}
                className="gap-2"
                size="sm"
              >
                {syncing ? <Loader className="w-4 h-4 animate-spin" /> : null}
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
              {syncStatus && (
                <Badge className={syncStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {syncStatus.success ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                  {syncStatus.message}
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 space-y-1">
          <p className="font-medium text-slate-700">What syncs:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Job details → HubSpot Deals (amount, dates, status)</li>
            <li>Customer info → HubSpot Contacts</li>
            <li>Reviews → Contact ratings & feedback</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}