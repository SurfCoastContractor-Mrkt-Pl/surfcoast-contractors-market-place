import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink, Loader2, RefreshCw, Zap, Check, AlertCircle } from 'lucide-react';

export default function NotionSyncTab() {
  // Manual sync a scope → Notion
  const [syncScopeId, setSyncScopeId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  // Poll Notion for updates
  const [polling, setPolling] = useState(false);
  const [pollResults, setPollResults] = useState(null);

  const invoke = (action, params = {}) =>
    base44.functions.invoke('notionProjectDoc', { action, ...params });

  const syncScope = async () => {
    if (!syncScopeId.trim()) return;
    setSyncing(true);
    setSyncResult(null);
    const res = await invoke('syncScopeToNotion', { scopeId: syncScopeId.trim() });
    setSyncResult(res.data.success ? 'ok' : res.data.error || 'error');
    setSyncing(false);
  };

  const pollNotion = async () => {
    setPolling(true);
    setPollResults(null);
    const res = await invoke('pollNotionForUpdates');
    setPollResults(res.data.updated_in_notion || []);
    setPolling(false);
  };

  return (
    <div className="space-y-6">
      {/* Sync scope → Notion */}
      <div className="border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Push Scope Status → Notion</h3>
        </div>
        <p className="text-sm text-slate-500">
          Sync a ScopeOfWork record's current status and details to its linked Notion page. The page title and a status block will be updated.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="ScopeOfWork ID"
            value={syncScopeId}
            onChange={e => setSyncScopeId(e.target.value)}
            className="text-sm"
          />
          <Button size="sm" onClick={syncScope} disabled={syncing || !syncScopeId.trim()}>
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
        {syncResult === 'ok' && (
          <div className="flex items-center gap-2 text-sm text-green-600"><Check className="w-4 h-4" /> Synced to Notion successfully.</div>
        )}
        {syncResult && syncResult !== 'ok' && (
          <div className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" /> {syncResult}</div>
        )}
      </div>

      {/* Poll Notion → check for updates */}
      <div className="border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Poll Notion for Updates</h3>
        </div>
        <p className="text-sm text-slate-500">
          Scans all ScopeOfWork records that have a linked Notion page and identifies pages edited in Notion more recently than the app record. Use this to detect external edits made directly in Notion.
        </p>
        <Button variant="outline" size="sm" onClick={pollNotion} disabled={polling}>
          {polling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
          Run Poll
        </Button>

        {pollResults !== null && (
          <div>
            {pollResults.length === 0 ? (
              <p className="text-sm text-slate-500">All linked pages are up to date — no external Notion edits detected.</p>
            ) : (
              <ul className="space-y-2 mt-2">
                {pollResults.map(item => (
                  <li key={item.scopeId} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-amber-800">{item.jobTitle}</p>
                      <p className="text-xs text-amber-600">Notion edited: {new Date(item.notionEdited).toLocaleString()}</p>
                    </div>
                    <span className="text-xs text-amber-600 font-mono">{item.scopeId.slice(0, 8)}…</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}