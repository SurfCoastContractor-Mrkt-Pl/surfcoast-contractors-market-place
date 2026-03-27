import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Loader2, Plus, Trash2, Wand2 } from 'lucide-react';

const BLOCK_TYPES = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'heading_1', label: 'Heading 1' },
  { value: 'heading_2', label: 'Heading 2' },
  { value: 'heading_3', label: 'Heading 3' },
  { value: 'bulleted_list_item', label: 'Bullet Point' },
  { value: 'numbered_list_item', label: 'Numbered Item' },
  { value: 'toggle', label: 'Toggle' },
  { value: 'callout', label: 'Callout' },
  { value: 'code', label: 'Code Block' },
  { value: 'divider', label: 'Divider' },
  { value: 'quote', label: 'Quote' },
];

function buildBlock(type, content, extra = {}) {
  if (type === 'divider') return { object: 'block', type: 'divider', divider: {} };
  const rt = [{ text: { content: content || '' } }];
  if (type === 'callout') return { object: 'block', type: 'callout', callout: { rich_text: rt, icon: { emoji: extra.emoji || '💡' }, color: 'blue_background' } };
  if (type === 'toggle') return { object: 'block', type: 'toggle', toggle: { rich_text: rt, children: [] } };
  if (type === 'code') return { object: 'block', type: 'code', code: { rich_text: rt, language: extra.lang || 'plain text' } };
  return { object: 'block', type, [type]: { rich_text: rt } };
}

export default function NotionRichPageBuilder({ projectParentId }) {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('📄');
  const [blocks, setBlocks] = useState([{ type: 'paragraph', content: '' }]);
  const [creating, setCreating] = useState(false);
  const [pageUrl, setPageUrl] = useState(null);
  const [error, setError] = useState(null);

  const addBlock = () => setBlocks(b => [...b, { type: 'paragraph', content: '' }]);
  const removeBlock = (i) => setBlocks(b => b.filter((_, idx) => idx !== i));
  const updateBlock = (i, field, val) => setBlocks(b => b.map((bl, idx) => idx === i ? { ...bl, [field]: val } : bl));

  const create = async () => {
    if (!title.trim() || !projectParentId.trim()) return;
    setCreating(true);
    setError(null);
    setPageUrl(null);
    const builtBlocks = blocks.map(b => buildBlock(b.type, b.content, b));
    const res = await base44.functions.invoke('notionProjectDoc', {
      action: 'createRichPage',
      parentPageId: projectParentId.trim(),
      title,
      emoji,
      blocks: builtBlocks,
    });
    if (res.data.success) {
      setPageUrl(res.data.pageUrl);
      setTitle(''); setBlocks([{ type: 'paragraph', content: '' }]);
    } else {
      setError(res.data.error || 'Failed to create page');
    }
    setCreating(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Build a richly formatted Notion page with custom block types.</p>

      <div className="flex gap-2">
        <Input placeholder="Page emoji icon" value={emoji} onChange={e => setEmoji(e.target.value)} className="text-sm w-24" />
        <Input placeholder="Page title" value={title} onChange={e => setTitle(e.target.value)} className="text-sm flex-1" />
      </div>

      <div className="space-y-2">
        {blocks.map((block, i) => (
          <div key={i} className="flex gap-2 items-start">
            <Select value={block.type} onValueChange={v => updateBlock(i, 'type', v)}>
              <SelectTrigger className="text-xs w-40 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLOCK_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {block.type !== 'divider' ? (
              <Textarea
                placeholder={`${block.type === 'code' ? 'Code...' : 'Content...'}`}
                value={block.content}
                onChange={e => updateBlock(i, 'content', e.target.value)}
                className="text-sm flex-1 h-10 min-h-0 resize-none"
              />
            ) : (
              <div className="flex-1 flex items-center"><hr className="flex-1 border-slate-300" /></div>
            )}
            {blocks.length > 1 && (
              <button onClick={() => removeBlock(i)} className="p-1 text-slate-400 hover:text-red-500 mt-1">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addBlock}>
          <Plus className="w-4 h-4 mr-1" /> Add Block
        </Button>
        <Button size="sm" onClick={create} disabled={creating || !title.trim() || !projectParentId.trim()}>
          {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Wand2 className="w-4 h-4 mr-1" />}
          Create Page
        </Button>
      </div>

      {!projectParentId?.trim() && (
        <p className="text-xs text-amber-600">⚠ Set a Project Parent ID in Settings first.</p>
      )}
      {pageUrl && (
        <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-green-600 hover:underline">
          <ExternalLink className="w-3 h-3" /> View page in Notion
        </a>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}