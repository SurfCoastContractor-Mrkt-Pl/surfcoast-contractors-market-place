import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink, Database, Loader2, Plus, ChevronDown, ChevronRight } from 'lucide-react';

export default function NotionDatabasesTab({ isAdmin }) {
  const [databases, setDatabases] = useState([]);
  const [loadingDbs, setLoadingDbs] = useState(false);
  const [expandedDb, setExpandedDb] = useState(null);
  const [dbRows, setDbRows] = useState({});
  const [loadingRows, setLoadingRows] = useState({});

  // New row form
  const [newRowDb, setNewRowDb] = useState('');
  const [newRowTitle, setNewRowTitle] = useState('');
  const [creatingRow, setCreatingRow] = useState(false);
  const [rowSuccess, setRowSuccess] = useState(null);

  const invoke = (action, params = {}) =>
    base44.functions.invoke('notionProjectDoc', { action, ...params });

  const loadDatabases = async () => {
    setLoadingDbs(true);
    const res = await invoke('listDatabases');
    setDatabases(res.data.databases || []);
    setLoadingDbs(false);
  };

  const loadRows = async (dbId) => {
    if (expandedDb === dbId) { setExpandedDb(null); return; }
    setExpandedDb(dbId);
    setLoadingRows(r => ({ ...r, [dbId]: true }));
    const res = await invoke('queryDatabase', { databaseId: dbId });
    setDbRows(r => ({ ...r, [dbId]: res.data.rows || [] }));
    setLoadingRows(r => ({ ...r, [dbId]: false }));
  };

  const createRow = async () => {
    if (!newRowDb.trim() || !newRowTitle.trim()) return;
    setCreatingRow(true);
    setRowSuccess(null);
    const res = await invoke('createDatabaseRow', {
      databaseId: newRowDb.trim(),
      properties: { Name: { title: [{ text: { content: newRowTitle } }] } }
    });
    setRowSuccess(res.data.rowUrl);
    setNewRowTitle('');
    setCreatingRow(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={loadDatabases} disabled={loadingDbs}>
          {loadingDbs ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load Databases'}
        </Button>
      </div>

      {databases.length > 0 ? (
        <div className="space-y-2">
          {databases.map(db => (
            <div key={db.id} className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => loadRows(db.id)}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">{db.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a href={db.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700" />
                  </a>
                  {expandedDb === db.id ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {expandedDb === db.id && (
                <div className="border-t border-slate-200">
                  {loadingRows[db.id] ? (
                    <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
                  ) : (dbRows[db.id] || []).length > 0 ? (
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                          {Object.keys((dbRows[db.id] || [])[0]?.properties || {}).slice(0, 4).map(k => (
                            <th key={k} className="px-3 py-2 text-left text-slate-500 font-medium">{k}</th>
                          ))}
                          <th className="px-3 py-2 text-left text-slate-500 font-medium">Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(dbRows[db.id] || []).slice(0, 20).map(row => (
                          <tr key={row.id} className="hover:bg-slate-50">
                            {Object.entries(row.properties).slice(0, 4).map(([k, v]) => (
                              <td key={k} className="px-3 py-2 text-slate-600 max-w-[150px] truncate">
                                {Array.isArray(v) ? v.join(', ') : String(v ?? '')}
                              </td>
                            ))}
                            <td className="px-3 py-2">
                              <a href={row.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-6 text-center text-sm text-slate-400">No rows found.</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-slate-400 text-sm">No databases loaded. Click "Load Databases".</div>
      )}

      {isAdmin && (
        <div className="border border-dashed border-slate-300 rounded-xl p-4 space-y-3 bg-slate-50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Add Row to Database</p>
          <Input
            placeholder="Database ID"
            value={newRowDb}
            onChange={e => setNewRowDb(e.target.value)}
            className="text-sm"
          />
          <Input
            placeholder="Row title / name"
            value={newRowTitle}
            onChange={e => setNewRowTitle(e.target.value)}
            className="text-sm"
          />
          <Button size="sm" onClick={createRow} disabled={creatingRow || !newRowDb.trim() || !newRowTitle.trim()}>
            {creatingRow ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
            Add Row
          </Button>
          {rowSuccess && (
            <a href={rowSuccess} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-green-600 hover:underline">
              <ExternalLink className="w-3 h-3" /> View Row in Notion
            </a>
          )}
        </div>
      )}
    </div>
  );
}