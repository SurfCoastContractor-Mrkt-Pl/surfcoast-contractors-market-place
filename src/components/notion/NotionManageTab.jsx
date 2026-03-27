import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Pencil, Trash2, Check, AlertCircle } from 'lucide-react';

export default function NotionManageTab() {
  // Update title
  const [updatePageId, setUpdatePageId] = useState('');
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateEmoji, setUpdateEmoji] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState(null);

  // Archive
  const [archivePageId, setArchivePageId] = useState('');
  const [archiving, setArchiving] = useState(false);
  const [archiveResult, setArchiveResult] = useState(null);

  const invoke = (action, params = {}) =>
    base44.functions.invoke('notionProjectDoc', { action, ...params });

  const updatePage = async () => {
    if (!updatePageId.trim() || !updateTitle.trim()) return;
    setUpdating(true);
    setUpdateResult(null);
    const res = await invoke('updatePageTitle', { pageId: updatePageId.trim(), title: updateTitle, emoji: updateEmoji || undefined });
    setUpdateResult(res.data.success ? 'ok' : res.data.error || 'error');
    setUpdating(false);
  };

  const archivePage = async () => {
    if (!archivePageId.trim()) return;
    if (!window.confirm('Archive this Notion page? It will be moved to trash in Notion.')) return;
    setArchiving(true);
    setArchiveResult(null);
    const res = await invoke('archivePage', { pageId: archivePageId.trim() });
    setArchiveResult(res.data.success ? 'ok' : res.data.error || 'error');
    if (res.data.success) setArchivePageId('');
    setArchiving(false);
  };

  return (
    <div className="space-y-6">
      {/* Update title */}
      <div className="border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Pencil className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Update Page Title & Icon</h3>
        </div>
        <p className="text-sm text-slate-500">Change the title and optional emoji icon of an existing Notion page.</p>
        <Input placeholder="Page ID" value={updatePageId} onChange={e => setUpdatePageId(e.target.value)} className="text-sm" />
        <div className="flex gap-2">
          <Input placeholder="New emoji (e.g. 🏗️)" value={updateEmoji} onChange={e => setUpdateEmoji(e.target.value)} className="text-sm w-32" />
          <Input placeholder="New title" value={updateTitle} onChange={e => setUpdateTitle(e.target.value)} className="text-sm flex-1" />
        </div>
        <Button size="sm" onClick={updatePage} disabled={updating || !updatePageId.trim() || !updateTitle.trim()}>
          {updating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Pencil className="w-4 h-4 mr-1" />}
          Update Page
        </Button>
        {updateResult === 'ok' && <div className="flex items-center gap-2 text-sm text-green-600"><Check className="w-4 h-4" /> Page updated.</div>}
        {updateResult && updateResult !== 'ok' && <div className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" /> {updateResult}</div>}
      </div>

      {/* Archive page */}
      <div className="border border-red-100 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-slate-800">Archive (Delete) Page</h3>
        </div>
        <p className="text-sm text-slate-500">Move a Notion page to trash. This is reversible from within Notion.</p>
        <div className="flex gap-2">
          <Input
            placeholder="Page ID to archive"
            value={archivePageId}
            onChange={e => setArchivePageId(e.target.value)}
            className="text-sm"
          />
          <Button variant="destructive" size="sm" onClick={archivePage} disabled={archiving || !archivePageId.trim()}>
            {archiving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
        {archiveResult === 'ok' && <div className="flex items-center gap-2 text-sm text-green-600"><Check className="w-4 h-4" /> Page archived.</div>}
        {archiveResult && archiveResult !== 'ok' && <div className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" /> {archiveResult}</div>}
      </div>
    </div>
  );
}