import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, BookOpen, FolderOpen, Plus, Loader2, FileText, Search, Settings, Link, Edit3, Check, Database, RefreshCw, Pencil, Wand2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NotionDatabasesTab from './NotionDatabasesTab';
import NotionRichPageBuilder from './NotionRichPageBuilder';
import NotionSyncTab from './NotionSyncTab';
import NotionManageTab from './NotionManageTab';

const KB_CATEGORIES = ['General', 'Compliance', 'Payments', 'Safety', 'Onboarding', 'FAQ'];

const STORAGE_KEY_PROJECT = 'notion_project_parent_id';
const STORAGE_KEY_KB = 'notion_kb_parent_id';

export default function NotionIntegrationPanel({ isAdmin = false }) {
  const [projectParentId, setProjectParentId] = useState(() => localStorage.getItem(STORAGE_KEY_PROJECT) || '330c3b3d-27dd-8159-a260-fdfc73c2368b');
  const [kbParentId, setKbParentId] = useState(() => localStorage.getItem(STORAGE_KEY_KB) || '330c3b3d-27dd-815d-b342-cec5f8bc81d3');
  const [projectPages, setProjectPages] = useState([]);
  const [kbPages, setKbPages] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingKb, setLoadingKb] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');

  // KB form
  const [kbTitle, setKbTitle] = useState('');
  const [kbCategory, setKbCategory] = useState('General');
  const [kbContent, setKbContent] = useState('');
  const [creatingKb, setCreatingKb] = useState(false);
  const [kbSuccess, setKbSuccess] = useState(null);

  // New project page form
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectSuccess, setProjectSuccess] = useState(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Edit / append
  const [editPageId, setEditPageId] = useState('');
  const [editContent, setEditContent] = useState('');
  const [appending, setAppending] = useState(false);
  const [appendSuccess, setAppendSuccess] = useState(false);

  // Entity linking
  const [linkScopeId, setLinkScopeId] = useState('');
  const [linkPageUrl, setLinkPageUrl] = useState('');
  const [linkPageId, setLinkPageId] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);

  // Settings panel
  const [showSettings, setShowSettings] = useState(false);

  const saveIds = () => {
    localStorage.setItem(STORAGE_KEY_PROJECT, projectParentId);
    localStorage.setItem(STORAGE_KEY_KB, kbParentId);
    setShowSettings(false);
  };

  const invoke = (action, params = {}) =>
    base44.functions.invoke('notionProjectDoc', { action, ...params });

  const fetchProjectPages = async () => {
    if (!projectParentId.trim()) return;
    setLoadingProjects(true);
    const res = await invoke('getProjectPages', { parentPageId: projectParentId.trim() });
    setProjectPages(res.data.pages || []);
    setLoadingProjects(false);
  };

  const fetchKbPages = async () => {
    if (!kbParentId.trim()) return;
    setLoadingKb(true);
    const res = await invoke('getKnowledgeBasePages', { parentPageId: kbParentId.trim() });
    setKbPages(res.data.pages || []);
    setLoadingKb(false);
  };

  const createKbPage = async () => {
    if (!kbTitle.trim() || !kbParentId.trim()) return;
    setCreatingKb(true);
    setKbSuccess(null);
    const res = await invoke('createKnowledgeBasePage', { title: kbTitle, category: kbCategory, content: kbContent, parentPageId: kbParentId.trim() });
    setKbSuccess(res.data.pageUrl);
    setKbTitle(''); setKbContent('');
    setCreatingKb(false);
    fetchKbPages();
  };

  const createProjectPage = async () => {
    if (!newProjectTitle.trim() || !projectParentId.trim()) return;
    setCreatingProject(true);
    setProjectSuccess(null);
    const res = await invoke('createProjectPage', {
      jobTitle: newProjectTitle,
      parentPageId: projectParentId.trim(),
      scopeSummary: 'Created manually from NotionHub.',
    });
    setProjectSuccess(res.data.pageUrl);
    setNewProjectTitle('');
    setCreatingProject(false);
    fetchProjectPages();
  };

  const searchPages = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    const res = await invoke('searchPages', { query: searchQuery.trim() });
    setSearchResults(res.data.pages || []);
    setSearching(false);
  };

  const appendToPage = async () => {
    if (!editPageId.trim() || !editContent.trim()) return;
    setAppending(true);
    setAppendSuccess(false);
    await invoke('appendToPage', { pageId: editPageId.trim(), content: editContent });
    setEditContent('');
    setAppendSuccess(true);
    setAppending(false);
  };

  const linkScope = async () => {
    if (!linkScopeId.trim() || !linkPageUrl.trim()) return;
    setLinking(true);
    setLinkSuccess(false);
    await invoke('linkScopeToPage', { scopeId: linkScopeId.trim(), notionPageUrl: linkPageUrl.trim(), notionPageId: linkPageId.trim() });
    setLinkSuccess(true);
    setLinking(false);
  };

  const tabs = [
    { key: 'projects', label: 'Projects', icon: FolderOpen },
    { key: 'kb', label: 'Knowledge Base', icon: BookOpen },
    { key: 'search', label: 'Search', icon: Search },
    { key: 'databases', label: 'Databases', icon: Database },
    ...(isAdmin ? [
      { key: 'rich', label: 'Rich Builder', icon: Wand2 },
      { key: 'edit', label: 'Edit Page', icon: Edit3 },
      { key: 'manage', label: 'Manage', icon: Pencil },
      { key: 'sync', label: 'Sync', icon: RefreshCw },
      { key: 'link', label: 'Link Scope', icon: Link },
    ] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-lg">N</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Notion Hub</h2>
          <p className="text-sm text-slate-500">Project docs, knowledge base & more</p>
        </div>
        <Badge className="ml-auto bg-green-100 text-green-700 border-green-200 shrink-0">Connected</Badge>
        {isAdmin && (
          <button onClick={() => setShowSettings(s => !s)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <Settings className="w-5 h-5 text-slate-500" />
          </button>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && isAdmin && (
        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-4">
          <p className="text-sm font-semibold text-slate-700">Configure Parent Page IDs</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Project Docs Parent ID</label>
              <Input value={projectParentId} onChange={e => setProjectParentId(e.target.value)} className="text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Knowledge Base Parent ID</label>
              <Input value={kbParentId} onChange={e => setKbParentId(e.target.value)} className="text-sm" />
            </div>
          </div>
          <Button size="sm" onClick={saveIds}>Save Settings</Button>
          <p className="text-xs text-slate-400">These IDs are saved locally to your browser.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === t.key
                ? 'text-slate-900 border-b-2 border-slate-900 -mb-px'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchProjectPages} disabled={loadingProjects}>
              {loadingProjects ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load Pages'}
            </Button>
          </div>

          {/* Create new project page (admin) */}
          {isAdmin && (
            <div className="border border-dashed border-slate-300 rounded-xl p-4 space-y-3 bg-slate-50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Create Project Page</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Project page title"
                  value={newProjectTitle}
                  onChange={e => setNewProjectTitle(e.target.value)}
                  className="text-sm"
                />
                <Button size="sm" onClick={createProjectPage} disabled={creatingProject || !newProjectTitle.trim()}>
                  {creatingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </Button>
              </div>
              {projectSuccess && (
                <a href={projectSuccess} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-green-600 hover:underline">
                  <ExternalLink className="w-3 h-3" /> View in Notion
                </a>
              )}
            </div>
          )}

          {projectPages.length > 0 ? (
            <ul className="space-y-2">
              {projectPages.map(page => (
                <li key={page.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-700 font-medium">{page.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <button
                        onClick={() => { setEditPageId(page.id); setActiveTab('edit'); }}
                        className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-200"
                      >
                        Edit
                      </button>
                    )}
                    <a href={page.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 text-slate-400 hover:text-slate-700" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 text-slate-400 text-sm">No pages loaded yet. Click "Load Pages" above.</div>
          )}
        </div>
      )}

      {/* Knowledge Base Tab */}
      {activeTab === 'kb' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchKbPages} disabled={loadingKb}>
              {loadingKb ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load Articles'}
            </Button>
          </div>

          {kbPages.length > 0 && (
            <ul className="space-y-2">
              {kbPages.map(page => (
                <li key={page.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-700 font-medium">{page.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <button
                        onClick={() => { setEditPageId(page.id); setActiveTab('edit'); }}
                        className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-200"
                      >
                        Edit
                      </button>
                    )}
                    <a href={page.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 text-slate-400 hover:text-slate-700" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Admin: Create KB Article */}
          {isAdmin && (
            <div className="border border-dashed border-slate-300 rounded-xl p-4 space-y-3 bg-slate-50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Create Article</p>
              <Input placeholder="Article title" value={kbTitle} onChange={e => setKbTitle(e.target.value)} className="text-sm" />
              <Select value={kbCategory} onValueChange={setKbCategory}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {KB_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea placeholder="Article content..." value={kbContent} onChange={e => setKbContent(e.target.value)} className="text-sm h-24" />
              <Button className="w-full" onClick={createKbPage} disabled={creatingKb || !kbTitle.trim()}>
                {creatingKb ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Create in Notion
              </Button>
              {kbSuccess && (
                <a href={kbSuccess} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-green-600 hover:underline">
                  <ExternalLink className="w-3 h-3" /> View in Notion
                </a>
              )}
            </div>
          )}

          {kbPages.length === 0 && <div className="text-center py-10 text-slate-400 text-sm">No articles loaded. Click "Load Articles".</div>}
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search Notion pages..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchPages()}
              className="text-sm"
            />
            <Button size="sm" onClick={searchPages} disabled={searching || !searchQuery.trim()}>
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
          {searchResults.length > 0 ? (
            <ul className="space-y-2">
              {searchResults.map(page => (
                <li key={page.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-700 font-medium">{page.title}</p>
                      {page.last_edited && <p className="text-xs text-slate-400">Last edited: {new Date(page.last_edited).toLocaleDateString()}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <button
                        onClick={() => { setEditPageId(page.id); setActiveTab('edit'); }}
                        className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-200"
                      >
                        Edit
                      </button>
                    )}
                    <a href={page.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 text-slate-400 hover:text-slate-700" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 text-slate-400 text-sm">Search for pages across your Notion workspace.</div>
          )}
        </div>
      )}

      {/* Edit Page Tab (admin only) */}
      {activeTab === 'edit' && isAdmin && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Append a timestamped update block to an existing Notion page.</p>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Page ID</label>
            <Input
              placeholder="Notion page ID (e.g. from search results)"
              value={editPageId}
              onChange={e => setEditPageId(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Update Content</label>
            <Textarea
              placeholder="Write your update or note here..."
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="text-sm h-28"
            />
          </div>
          <Button onClick={appendToPage} disabled={appending || !editPageId.trim() || !editContent.trim()}>
            {appending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
            Append Update
          </Button>
          {appendSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="w-4 h-4" /> Update appended successfully.
            </div>
          )}
        </div>
      )}

      {/* Databases Tab */}
      {activeTab === 'databases' && (
        <NotionDatabasesTab isAdmin={isAdmin} />
      )}

      {/* Rich Page Builder (admin only) */}
      {activeTab === 'rich' && isAdmin && (
        <NotionRichPageBuilder projectParentId={projectParentId} />
      )}

      {/* Manage Tab (admin only) */}
      {activeTab === 'manage' && isAdmin && (
        <NotionManageTab />
      )}

      {/* Sync Tab (admin only) */}
      {activeTab === 'sync' && isAdmin && (
        <NotionSyncTab />
      )}

      {/* Link to Scope Tab (admin only) */}
      {activeTab === 'link' && isAdmin && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Associate a Notion page with a ScopeOfWork record in the database.</p>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Scope of Work ID</label>
            <Input
              placeholder="ScopeOfWork record ID"
              value={linkScopeId}
              onChange={e => setLinkScopeId(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Notion Page URL</label>
            <Input
              placeholder="https://notion.so/..."
              value={linkPageUrl}
              onChange={e => setLinkPageUrl(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Notion Page ID (optional)</label>
            <Input
              placeholder="Page ID for programmatic access"
              value={linkPageId}
              onChange={e => setLinkPageId(e.target.value)}
              className="text-sm"
            />
          </div>
          <Button onClick={linkScope} disabled={linking || !linkScopeId.trim() || !linkPageUrl.trim()}>
            {linking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Link className="w-4 h-4 mr-2" />}
            Link Page to Scope
          </Button>
          {linkSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="w-4 h-4" /> Linked successfully.
            </div>
          )}
        </div>
      )}

      {/* Help */}
      <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-500 border border-slate-100">
        <strong className="text-slate-700">Tip:</strong> Find a Notion Page ID by copying the page URL — it's the last part after the dash: <code className="bg-slate-200 px-1 rounded">notion.so/Title-<strong>abc123def456</strong></code>
      </div>
    </div>
  );
}