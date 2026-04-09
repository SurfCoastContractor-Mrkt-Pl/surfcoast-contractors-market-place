import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Link2, Unlink2 } from 'lucide-react';

export default function HubSpotNotionSyncPanel({ scopeId, isPremium }) {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  const syncToHubSpot = async () => {
    setSyncing(true);
    setSyncStatus('Syncing to HubSpot...');
    try {
      const result = await base44.functions.invoke('syncJobToHubSpot', {
        scope_id: scopeId
      });
      if (result.data.success) {
        setSyncStatus('✓ Synced to HubSpot');
      } else {
        setSyncStatus('Failed to sync');
      }
    } catch (error) {
      setSyncStatus(`Error: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const syncToNotion = async () => {
    setSyncing(true);
    setSyncStatus('Creating Notion page...');
    try {
      const result = await base44.functions.invoke('syncToNotion', {
        action: 'createProject',
        scopeId,
        title: `Project ${scopeId}`,
        description: 'Project details synced from SurfCoast',
        status: 'In Progress'
      });
      if (result.data.success) {
        setSyncStatus('✓ Created in Notion');
      } else {
        setSyncStatus('Failed to create in Notion');
      }
    } catch (error) {
      setSyncStatus(`Error: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  if (!isPremium) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-sm text-amber-900">Premium Feature</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-amber-800">HubSpot & Notion sync available in WAVE Premium</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-400" />
            HubSpot Integration
          </CardTitle>
          <CardDescription>Sync project to your CRM</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                Auto-syncing to HubSpot
              </div>
              <Button 
                size="sm" 
                onClick={syncToHubSpot}
                disabled={syncing}
                className="w-full"
              >
                {syncing ? 'Syncing...' : 'Manual Sync'}
              </Button>
            </>
          {syncStatus && (
            <p className="text-xs text-slate-600 mt-2">{syncStatus}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-600" />
            Notion Integration
          </CardTitle>
          <CardDescription>Create project page in Notion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                Ready to create pages
              </div>
              <Button 
                size="sm" 
                onClick={syncToNotion}
                disabled={syncing}
                className="w-full"
              >
                {syncing ? 'Creating...' : 'Create Project Page'}
              </Button>
            </>
          {syncStatus && (
            <p className="text-xs text-slate-600 mt-2">{syncStatus}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}