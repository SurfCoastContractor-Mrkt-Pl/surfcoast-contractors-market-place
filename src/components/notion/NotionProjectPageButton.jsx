import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink, Loader2, BookMarked } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/**
 * Reusable button to create a Notion project page from a ScopeOfWork.
 * Drop this anywhere a scope object is available.
 * 
 * Props:
 *   scope: ScopeOfWork object
 */
export default function NotionProjectPageButton({ scope }) {
  const [open, setOpen] = useState(false);
  const [parentPageId, setParentPageId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!parentPageId.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke('notionProjectDoc', {
        action: 'createProjectPage',
        parentPageId: parentPageId.trim(),
        scopeId: scope.id,
        jobTitle: scope.job_title,
        contractorName: scope.contractor_name,
        customerName: scope.customer_name,
        costType: scope.cost_type,
        costAmount: scope.cost_amount,
        agreedWorkDate: scope.agreed_work_date,
        scopeSummary: scope.scope_summary
      });
      setResult(res.data.pageUrl);
    } catch (e) {
      setError('Failed to create Notion page. Check the Page ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BookMarked className="w-4 h-4" />
          Add to Notion
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Notion Project Page</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-slate-500">
            This will create a project documentation page in your Notion workspace for <strong>{scope.job_title || 'this project'}</strong>.
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Parent Notion Page ID</label>
            <Input
              placeholder="e.g. abc123def456..."
              value={parentPageId}
              onChange={e => setParentPageId(e.target.value)}
            />
            <p className="text-xs text-slate-400">
              The Notion page where this project page will be created under.
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {result ? (
            <div className="space-y-3">
              <p className="text-sm text-green-700 font-medium">Page created successfully!</p>
              <a
                href={result}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Notion
              </a>
              <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={handleCreate}
              disabled={loading || !parentPageId.trim()}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Page
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}