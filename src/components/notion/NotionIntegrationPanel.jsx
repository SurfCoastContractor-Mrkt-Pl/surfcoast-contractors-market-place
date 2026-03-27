import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, BookOpen, FolderOpen, Plus, Loader2, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const KB_CATEGORIES = ['General', 'Compliance', 'Payments', 'Safety', 'Onboarding', 'FAQ'];

export default function NotionIntegrationPanel({ isAdmin = false }) {
  const [projectParentId, setProjectParentId] = useState('330c3b3d-27dd-8159-a260-fdfc73c2368b');
  const [kbParentId, setKbParentId] = useState('330c3b3d-27dd-815d-b342-cec5f8bc81d3');
  const [projectPages, setProjectPages] = useState([]);
  const [kbPages, setKbPages] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingKb, setLoadingKb] = useState(false);

  // KB form state
  const [kbTitle, setKbTitle] = useState('');
  const [kbCategory, setKbCategory] = useState('General');
  const [kbContent, setKbContent] = useState('');
  const [creatingKb, setCreatingKb] = useState(false);
  const [kbSuccess, setKbSuccess] = useState(null);

  const fetchProjectPages = async () => {
    if (!projectParentId.trim()) return;
    setLoadingProjects(true);
    try {
      const res = await base44.functions.invoke('notionProjectDoc', {
        action: 'getProjectPages',
        parentPageId: projectParentId.trim()
      });
      setProjectPages(res.data.pages || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchKbPages = async () => {
    if (!kbParentId.trim()) return;
    setLoadingKb(true);
    try {
      const res = await base44.functions.invoke('notionProjectDoc', {
        action: 'getKnowledgeBasePages',
        parentPageId: kbParentId.trim()
      });
      setKbPages(res.data.pages || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingKb(false);
    }
  };

  const createKbPage = async () => {
    if (!kbTitle.trim() || !kbParentId.trim()) return;
    setCreatingKb(true);
    setKbSuccess(null);
    try {
      const res = await base44.functions.invoke('notionProjectDoc', {
        action: 'createKnowledgeBasePage',
        title: kbTitle,
        category: kbCategory,
        content: kbContent,
        parentPageId: kbParentId.trim()
      });
      setKbSuccess(res.data.pageUrl);
      setKbTitle('');
      setKbContent('');
      fetchKbPages();
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingKb(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">N</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Notion Integration</h2>
          <p className="text-sm text-slate-500">Project documentation & knowledge base</p>
        </div>
        <Badge className="ml-auto bg-green-100 text-green-700 border-green-200">Connected</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Documentation */}
        <div className="border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-800">Project Documentation</h3>
          </div>
          <p className="text-sm text-slate-500">
            View project pages linked to your Notion workspace. Paste the parent Notion page ID to load sub-pages.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Notion Parent Page ID"
              value={projectParentId}
              onChange={e => setProjectParentId(e.target.value)}
              className="text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProjectPages}
              disabled={loadingProjects || !projectParentId.trim()}
            >
              {loadingProjects ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load'}
            </Button>
          </div>

          {projectPages.length > 0 ? (
            <ul className="space-y-2">
              {projectPages.map(page => (
                <li key={page.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700 font-medium">{page.title}</span>
                  </div>
                  <a href={page.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 text-slate-400 hover:text-slate-700" />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6 text-slate-400 text-sm">
              No project pages found. Enter a parent page ID above.
            </div>
          )}
        </div>

        {/* Knowledge Base */}
        <div className="border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-800">Knowledge Base</h3>
          </div>
          <p className="text-sm text-slate-500">
            Browse and manage knowledge base articles in Notion. Enter the KB parent page ID.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Notion KB Parent Page ID"
              value={kbParentId}
              onChange={e => setKbParentId(e.target.value)}
              className="text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={fetchKbPages}
              disabled={loadingKb || !kbParentId.trim()}
            >
              {loadingKb ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load'}
            </Button>
          </div>

          {kbPages.length > 0 && (
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {kbPages.map(page => (
                <li key={page.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700 font-medium">{page.title}</span>
                  </div>
                  <a href={page.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 text-slate-400 hover:text-slate-700" />
                  </a>
                </li>
              ))}
            </ul>
          )}

          {/* Admin: Create KB Article */}
          {isAdmin && (
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Create Article</p>
              <Input
                placeholder="Article title"
                value={kbTitle}
                onChange={e => setKbTitle(e.target.value)}
                className="text-sm"
              />
              <Select value={kbCategory} onValueChange={setKbCategory}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {KB_CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Article content..."
                value={kbContent}
                onChange={e => setKbContent(e.target.value)}
                className="text-sm h-24"
              />
              <Button
                className="w-full"
                onClick={createKbPage}
                disabled={creatingKb || !kbTitle.trim() || !kbParentId.trim()}
              >
                {creatingKb ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Create in Notion
              </Button>
              {kbSuccess && (
                <a
                  href={kbSuccess}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-green-600 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" /> View in Notion
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Help text */}
      <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-500">
        <strong className="text-slate-700">How to find a Notion Page ID:</strong> Open a page in Notion → copy the URL → the Page ID is the last part after the last dash (e.g. <code className="bg-slate-200 px-1 rounded">notion.so/My-Page-<strong>abc123def456</strong></code>).
      </div>
    </div>
  );
}