import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';

/**
 * Displays Notion connection status and provides quick actions
 * Shows if a ScopeOfWork has a linked Notion page
 */

export default function NotionConnectionStatus({ scopeId, scopeData = null }) {
  const [scope, setScope] = useState(scopeData);
  const [loading, setLoading] = useState(!scopeData);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!scopeData) {
      loadScope();
    }
  }, [scopeId, scopeData]);

  const loadScope = async () => {
    setLoading(true);
    const res = await base44.entities.ScopeOfWork.get(scopeId);
    setScope(res);
    setLoading(false);
  };

  const syncToNotion = async () => {
    setSyncing(true);
    try {
      await base44.functions.invoke('notionProjectDoc', {
        action: 'syncScopeToNotion',
        scopeId
      });
      await loadScope();
    } catch (err) {
      console.error('Sync failed:', err);
    }
    setSyncing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!scope) {
    return null;
  }

  const hasNotion = scope.notion_page_url && scope.notion_page_id;

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
      {hasNotion ? (
        <>
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">Notion Page Linked</p>
            <p className="text-xs text-slate-500">Auto-synced with project status</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={syncToNotion}
              disabled={syncing}
            >
              {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Refresh'}
            </Button>
            <a
              href={scope.notion_page_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-slate-200 rounded transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-slate-600" />
            </a>
          </div>
        </>
      ) : (
        <>
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">No Notion Page</p>
            <p className="text-xs text-slate-500">Auto-sync will activate once page is created</p>
          </div>
          <Badge variant="outline" className="text-xs">Pending</Badge>
        </>
      )}
    </div>
  );
}